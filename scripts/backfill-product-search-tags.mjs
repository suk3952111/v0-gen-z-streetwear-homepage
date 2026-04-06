import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const GEMINI_MODEL = "gemini-2.5-flash";
const DEFAULT_CONCURRENCY = 2;
const DEFAULT_BATCH_SIZE = 20;
const DEFAULT_MAX_TAGS = 5;
const PRIMARY_CONFIDENCE_THRESHOLD = 0.72;
const SECONDARY_CONFIDENCE_THRESHOLD = 0.58;
const RETRY_LIMIT = 2;

const loadEnvFile = (path) => {
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index < 0) continue;
    const key = trimmed.slice(0, index).trim();
    const rawValue = trimmed.slice(index + 1).trim();
    const value =
      rawValue.startsWith('"') && rawValue.endsWith('"')
        ? rawValue.slice(1, -1)
        : rawValue;
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
};

loadEnvFile(resolve(process.cwd(), ".env.local"));

const requiredEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GEMINI_API_KEY",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

const argv = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value = "true"] = arg.replace(/^--/, "").split("=");
    return [key, value];
  }),
);

const options = {
  dryRun: argv.get("dry-run") === "true",
  limit: Number(argv.get("limit") ?? "0"),
  offset: Number(argv.get("offset") ?? "0"),
  concurrency: Math.max(1, Number(argv.get("concurrency") ?? DEFAULT_CONCURRENCY)),
  batchSize: Math.max(1, Number(argv.get("batch-size") ?? DEFAULT_BATCH_SIZE)),
  maxTags: Math.max(3, Number(argv.get("max-tags") ?? DEFAULT_MAX_TAGS)),
  productSlugs: (argv.get("product-slugs") ?? "")
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean),
};

const normalizeSlug = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/^#+/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const slugToDisplayName = (slug) =>
  `#${slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")}`;

const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));

const fetchImageAsBase64 = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }
  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  const arrayBuffer = await response.arrayBuffer();
  return {
    mimeType: contentType,
    base64Data: Buffer.from(arrayBuffer).toString("base64"),
  };
};

const stripCodeFences = (value) =>
  value
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

const extractJsonObject = (value) => {
  const normalized = stripCodeFences(value);
  const start = normalized.indexOf("{");
  const end = normalized.lastIndexOf("}");
  return start >= 0 && end > start ? normalized.slice(start, end + 1) : normalized;
};

const parseJsonSafe = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const mapProductRow = (row) => {
  const images = [...(row.product_images ?? [])].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return (a.display_order ?? 0) - (b.display_order ?? 0);
  });

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.categories?.name ?? "unknown",
    imageUrl: images[0]?.image_url ?? null,
  };
};

const getProductsWithPrimaryImages = async () => {
  if (options.limit > 0) {
    const from = options.offset;
    const to = from + options.limit - 1;
    let query = supabase
      .from("products")
      .select(
        "id, slug, name, categories(name), product_images(image_url, is_primary, display_order)",
      )
      .order("created_at", { ascending: true });
    if (options.productSlugs.length > 0) {
      query = query.in("slug", options.productSlugs);
    } else {
      query = query.range(from, to);
    }
    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to load products: ${error.message}`);
    }

    return (data ?? []).map(mapProductRow);
  }

  const rows = [];
  let from = options.offset;

  while (true) {
    const to = from + options.batchSize - 1;
    let query = supabase
      .from("products")
      .select(
        "id, slug, name, categories(name), product_images(image_url, is_primary, display_order)",
      )
      .order("created_at", { ascending: true });
    if (options.productSlugs.length > 0) {
      query = query.in("slug", options.productSlugs);
    } else {
      query = query.range(from, to);
    }
    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to load products: ${error.message}`);
    }

    const batch = (data ?? []).map(mapProductRow);
    rows.push(...batch);

    if (options.productSlugs.length > 0 || batch.length < options.batchSize) {
      break;
    }

    from += options.batchSize;
  }

  return rows;
};

const generateTagsWithGemini = async (product) => {
  if (!product.imageUrl) {
    return { caption: "", tags: [], skipped: "missing-image" };
  }

  const image = await fetchImageAsBase64(product.imageUrl);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                `Analyze this product fashion image for search indexing. Product name: ${product.name}. Category: ${product.category}. ` +
                `Return strict JSON only in this shape: ` +
                `{"caption":"short caption","tags":[{"label":"tag label","slug":"normalized-slug","confidence":0.0,"type":"style|item|detail|fit|occasion"}]}. ` +
                `Rules: return 5 to 8 useful search tags when the image quality allows it, avoid brand names, avoid duplicate synonyms, confidence must be 0 to 1, ` +
                `include a mix of style and garment/detail tags when visible, use kebab-case slug values, prefer concrete attributes like long-sleeve, button-up, cargo, relaxed-fit, minimal, streetwear, formal, casual.`,
            },
            {
              inline_data: {
                mime_type: image.mimeType,
                data: image.base64Data,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini generate failed: ${response.status} ${await response.text()}`);
  }

  const body = await response.json();
  const text =
    body.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "{}";
  const parsed = parseJsonSafe(extractJsonObject(text), {});
  const rawTags = Array.isArray(parsed.tags) ? parsed.tags : [];
  const deduped = [];
  const seen = new Set();

  for (const tag of rawTags) {
    const label = String(tag.label ?? "").trim();
    const slug = normalizeSlug(String(tag.slug ?? label));
    const confidence = Number(tag.confidence ?? 0);
    if (!slug || seen.has(slug) || !Number.isFinite(confidence)) continue;
    seen.add(slug);
    deduped.push({
      label: label || slug,
      slug,
      confidence: Math.max(0, Math.min(1, confidence)),
      type: String(tag.type ?? "style").trim().toLowerCase(),
    });
  }

  const primary = deduped.filter((tag) => tag.confidence >= PRIMARY_CONFIDENCE_THRESHOLD);
  const secondary = deduped.filter(
    (tag) =>
      tag.confidence >= SECONDARY_CONFIDENCE_THRESHOLD &&
      tag.confidence < PRIMARY_CONFIDENCE_THRESHOLD,
  );
  const selected = [...primary, ...secondary].slice(0, options.maxTags);

  return {
    caption: String(parsed.caption ?? "").trim(),
    tags: selected,
    skipped: selected.length === 0 ? "low-confidence" : null,
  };
};

const ensureSearchTagTablesExist = async () => {
  const { error } = await supabase.from("product_search_tags").select("id").limit(1);
  if (error) {
    throw new Error(
      `product_search_tags table is unavailable. Run the latest Supabase migration first. Details: ${error.message}`,
    );
  }
};

const upsertSearchTags = async (productId, tags) => {
  if (tags.length === 0) return;

  const tagRows = tags.map((tag) => ({
    name: slugToDisplayName(tag.slug),
    slug: tag.slug,
  }));

  const { error: upsertTagError } = await supabase
    .from("product_search_tags")
    .upsert(tagRows, { onConflict: "slug" });
  if (upsertTagError) {
    throw new Error(`Failed to upsert search tags: ${upsertTagError.message}`);
  }

  const slugs = tags.map((tag) => tag.slug);
  const { data: savedTags, error: fetchTagsError } = await supabase
    .from("product_search_tags")
    .select("id, slug")
    .in("slug", slugs);
  if (fetchTagsError) {
    throw new Error(`Failed to fetch saved search tags: ${fetchTagsError.message}`);
  }

  const tagIdBySlug = new Map((savedTags ?? []).map((tag) => [tag.slug, tag.id]));
  const relationRows = tags
    .map((tag) => ({
      product_id: productId,
      tag_id: tagIdBySlug.get(tag.slug),
      confidence: Number(tag.confidence.toFixed(3)),
      source: GEMINI_MODEL,
    }))
    .filter((row) => !!row.tag_id);

  const { error: deleteError } = await supabase
    .from("product_search_tag_relations")
    .delete()
    .eq("product_id", productId)
    .eq("source", GEMINI_MODEL);
  if (deleteError) {
    throw new Error(`Failed to clear previous Gemini tags: ${deleteError.message}`);
  }

  if (relationRows.length === 0) return;

  const { error: insertError } = await supabase
    .from("product_search_tag_relations")
    .upsert(relationRows, { onConflict: "product_id,tag_id" });
  if (insertError) {
    throw new Error(`Failed to upsert search tag relations: ${insertError.message}`);
  }
};

const withRetry = async (task, description) => {
  let lastError = null;
  for (let attempt = 0; attempt <= RETRY_LIMIT; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      if (attempt === RETRY_LIMIT) break;
      await sleep(800 * (attempt + 1));
    }
  }
  throw new Error(`${description}: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
};

const runWorkerPool = async (items, worker, concurrency) => {
  const queue = [...items];
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) return;
      await worker(item);
    }
  });
  await Promise.all(workers);
};

const main = async () => {
  await ensureSearchTagTablesExist();
  const products = await getProductsWithPrimaryImages();
  const stats = {
    processed: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
  };

  await runWorkerPool(
    products,
    async (product) => {
      stats.processed += 1;
      try {
        const analysis = await withRetry(
          () => generateTagsWithGemini(product),
          `Failed to analyze ${product.slug}`,
        );

        if (analysis.tags.length === 0) {
          stats.skipped += 1;
          console.log(
            JSON.stringify({
              product: product.slug,
              status: "skipped",
              reason: analysis.skipped,
            }),
          );
          return;
        }

        if (!options.dryRun) {
          await withRetry(
            () => upsertSearchTags(product.id, analysis.tags),
            `Failed to save tags for ${product.slug}`,
          );
        }

        stats.updated += 1;
        console.log(
          JSON.stringify({
            product: product.slug,
            status: options.dryRun ? "preview" : "updated",
            tags: analysis.tags,
          }),
        );
      } catch (error) {
        stats.failed += 1;
        console.error(
          JSON.stringify({
            product: product.slug,
            status: "failed",
            message: error instanceof Error ? error.message : String(error),
          }),
        );
      }
    },
    options.concurrency,
  );

  console.log(JSON.stringify({ status: "done", options, stats }, null, 2));
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

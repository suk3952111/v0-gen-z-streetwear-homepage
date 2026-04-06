import { readFile } from "node:fs/promises";

const GEMINI_IMAGE_MODEL = "gemini-2.5-flash";
const GEMINI_EMBEDDING_MODEL = "gemini-embedding-001";
const DEFAULT_BATCH_SIZE = 8;
const DEFAULT_MAX_BATCHES = 20;

function parseEnv(text) {
  const env = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIndex = line.indexOf("=");
    if (eqIndex < 0) continue;
    env[line.slice(0, eqIndex).trim()] = line.slice(eqIndex + 1).trim();
  }
  return env;
}

function parseArgs(argv) {
  const args = new Map();
  for (const token of argv.slice(2)) {
    if (!token.startsWith("--")) continue;
    const [key, value] = token.slice(2).split("=");
    args.set(key, value ?? "true");
  }
  return {
    batchSize: Math.max(1, Number(args.get("batch-size") ?? DEFAULT_BATCH_SIZE)),
    maxBatches: Math.max(1, Number(args.get("max-batches") ?? DEFAULT_MAX_BATCHES)),
    stopOnError: args.get("stop-on-error") !== "false",
  };
}

function parseDataUrl(url) {
  const match = url.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid data URL");
  return { mimeType: match[1], base64Data: match[2] };
}

function normalizeTagSlug(tag) {
  return String(tag)
    .trim()
    .toLowerCase()
    .replace(/^#+/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeShortText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeDetailList(values) {
  return [...new Set((values ?? []).map(normalizeShortText).filter(Boolean))].slice(0, 8);
}

function toVectorLiteral(values) {
  return `[${values.map((value) => Number(value).toFixed(8)).join(",")}]`;
}

function stripCodeFences(value) {
  return value.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
}

function extractJsonObject(value) {
  const normalized = stripCodeFences(value);
  const start = normalized.indexOf("{");
  const end = normalized.lastIndexOf("}");
  return start >= 0 && end > start ? normalized.slice(start, end + 1) : normalized;
}

async function fetchImageAsDataUrl(imageUrl) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return `data:${contentType};base64,${base64}`;
}

async function callGeminiGenerate(apiKey, parts) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
        contents: [{ role: "user", parts }],
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini generate failed: ${response.status} ${await response.text()}`);
  }

  const body = await response.json();
  return body.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "{}";
}

async function callGeminiEmbedding(apiKey, text) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_EMBEDDING_MODEL}:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${GEMINI_EMBEDDING_MODEL}`,
        content: {
          parts: [{ text }],
        },
        outputDimensionality: 768,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini embedding failed: ${response.status} ${await response.text()}`);
  }

  const body = await response.json();
  const values = body.embedding?.values ?? [];
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error("Gemini embedding response is empty");
  }
  return values;
}

async function analyzeImageStyle(apiKey, imageDataUrl) {
  const image = parseDataUrl(imageDataUrl);
  const content = await callGeminiGenerate(apiKey, [
    {
      text:
        'Analyze this fashion product image and return JSON: ' +
        '{"caption":"short caption","color":"main color","garment_type":"specific clothing type","fit":"fit word","silhouette":"silhouette word","material":"material word","pattern":"pattern word","details":["detail1","detail2"],"style_tags":["tag1","tag2","tag3"]}. ' +
        "Keep every value short and lowercase. style_tags should be concise fashion tags only.",
    },
    {
      inline_data: {
        mime_type: image.mimeType,
        data: image.base64Data,
      },
    },
  ]);

  const parsed = JSON.parse(extractJsonObject(content) || "{}");
  const caption = normalizeShortText(parsed.caption) || "clothing item";
  const styleTags = [...new Set((parsed.style_tags ?? []).map(normalizeTagSlug).filter(Boolean))].slice(0, 8);

  return {
    caption,
    color: normalizeShortText(parsed.color),
    garment_type: normalizeShortText(parsed.garment_type),
    fit: normalizeShortText(parsed.fit),
    silhouette: normalizeShortText(parsed.silhouette),
    material: normalizeShortText(parsed.material),
    pattern: normalizeShortText(parsed.pattern),
    details: normalizeDetailList(parsed.details),
    style_tags: styleTags,
  };
}

async function listMissingRows(env, batchSize) {
  const response = await fetch(
    `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/list_product_images_for_embedding`,
    {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ batch_count: batchSize }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to list rows: ${response.status} ${await response.text()}`);
  }

  return await response.json();
}

async function countRemainingRows(env) {
  const response = await fetch(
    `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/product_images?select=id,caption_embedding,ai_attributes`,
    {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to count rows: ${response.status} ${await response.text()}`);
  }

  const rows = await response.json();
  return rows.filter((row) => !row.caption_embedding || !row.ai_attributes).length;
}

async function updateRow(env, row, caption, embeddingLiteral, aiAttributes) {
  const response = await fetch(
    `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/product_images?id=eq.${row.image_id}`,
    {
      method: "PATCH",
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        caption,
        caption_embedding: embeddingLiteral,
        caption_updated_at: new Date().toISOString(),
        ai_attributes: aiAttributes,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to update image ${row.image_id}: ${response.status} ${await response.text()}`);
  }
}

async function main() {
  const options = parseArgs(process.argv);
  const env = parseEnv(await readFile(".env.local", "utf8"));

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.GEMINI_API_KEY) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or GEMINI_API_KEY in .env.local");
  }

  let updated = 0;
  let failed = 0;
  const initialRemaining = await countRemainingRows(env);

  console.log(`[backfill] remaining before start: ${initialRemaining}`);

  for (let batchIndex = 0; batchIndex < options.maxBatches; batchIndex += 1) {
    const rows = await listMissingRows(env, options.batchSize);
    if (!Array.isArray(rows) || rows.length === 0) break;

    for (const row of rows) {
      const currentIndex = updated + failed + 1;
      const totalKnown = initialRemaining;
      console.log(`[backfill] processing ${currentIndex}/${totalKnown} image=${row.image_id}`);

      try {
        const dataUrl = await fetchImageAsDataUrl(row.image_url);
        const analysis = await analyzeImageStyle(env.GEMINI_API_KEY, dataUrl);
        const embedding = await callGeminiEmbedding(env.GEMINI_API_KEY, analysis.caption);
        await updateRow(env, row, analysis.caption, toVectorLiteral(embedding), analysis);
        updated += 1;
        console.log(`[backfill] success ${row.image_id} updated=${updated} failed=${failed}`);
      } catch (error) {
        failed += 1;
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[backfill] FAILED ${row.image_id}: ${message}`);
        console.error(JSON.stringify({ updated, failed, stoppedAt: row.image_id }, null, 2));
        if (options.stopOnError) {
          process.exitCode = 1;
          return;
        }
      }
    }
  }

  const remainingAfter = await countRemainingRows(env);
  console.log(JSON.stringify({ updated, failed, remainingAfter }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

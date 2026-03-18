import type { Database } from "@/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ShopProductItem } from "@/features/products/types/shop";
import { getProductsBySlugs } from "@/features/products/services/get-products-by-slugs";
import { loadShopProductsPage } from "@/features/products/services/load-shop-products-page";
import { getProductsByIdsQueryBuilder } from "@/features/products/query-builder/get-products-by-ids.builder";
import { getProductsBySlugsQueryBuilder } from "@/features/products/query-builder/get-products-by-slugs.builder";
import { getProductTagRelationsByTagIdsQueryBuilder } from "@/features/products/query-builder/get-product-tag-relations-by-tag-ids.builder";
import { getProductTagsBySlugsQueryBuilder } from "@/features/products/query-builder/get-product-tags-by-slugs.builder";
import { listProductImagesForEmbeddingQueryBuilder } from "@/features/products/query-builder/list-product-images-for-embedding.builder";
import { matchProductsByImageEmbeddingQueryBuilder } from "@/features/products/query-builder/match-products-by-image-embedding.builder";
import { matchProductsByProductEmbeddingQueryBuilder } from "@/features/products/query-builder/match-products-by-product-embedding.builder";
import { updateProductImageCaptionEmbeddingQueryBuilder } from "@/features/products/query-builder/update-product-image-caption-embedding.builder";

type FindStyleByImageInput = {
  imageDataUrl: string;
  limit?: number;
};

type RecommendSimilarByAiInput = {
  productId: string;
  limit?: number;
};

type FindStyleByImageResult = {
  detectedTags: string[];
  products: ShopProductItem[];
};

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

type GeminiEmbeddingResponse = {
  embedding?: {
    values?: number[];
  };
};

type ImageStyleAnalysis = {
  caption: string;
  styleTags: string[];
};

const GEMINI_IMAGE_MODEL = "gemini-2.5-flash";
const GEMINI_EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_WEIGHT = 0.85;
const TAG_WEIGHT = 0.15;
const ENABLE_EMBEDDING_BACKFILL =
  process.env.ENABLE_EMBEDDING_BACKFILL === "true";

const parseJsonSafe = <T>(value: string, fallback: T): T => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const parseDataUrl = (value: string) => {
  const match = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid data URL format");
  }
  return {
    mimeType: match[1],
    base64Data: match[2],
  };
};

const toVectorLiteral = (values: number[]) => {
  return `[${values.map((value) => Number(value).toFixed(8)).join(",")}]`;
};

const clampMatch = (similarity: number) => {
  return Math.max(0, Math.min(100, Math.round(similarity * 100)));
};

const normalizeTagSlug = (tag: string) => {
  return tag
    .trim()
    .toLowerCase()
    .replace(/^#+/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const callGeminiGenerate = async (parts: Array<Record<string, unknown>>) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      generationConfig: {
        temperature: 0.2,
      },
      contents: [{ role: "user", parts }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini generate failed: ${response.status} ${errorText}`);
  }

  const body = (await response.json()) as GeminiGenerateContentResponse;
  const text =
    body.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("") ?? "{}";

  return text;
};

const callGeminiEmbedding = async (text: string) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_EMBEDDING_MODEL}:embedContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: `models/${GEMINI_EMBEDDING_MODEL}`,
      content: {
        parts: [{ text }],
      },
      outputDimensionality: 768,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini embedding failed: ${response.status} ${errorText}`);
  }

  const body = (await response.json()) as GeminiEmbeddingResponse;
  const values = body.embedding?.values ?? [];
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error("Gemini embedding response is empty");
  }
  return values;
};

const analyzeImageStyle = async (
  imageDataUrl: string,
): Promise<ImageStyleAnalysis> => {
  const image = parseDataUrl(imageDataUrl);
  const content = await callGeminiGenerate([
    {
      text: 'Analyze this fashion image and return strict JSON only: {"caption":"short caption","style_tags":["tag1","tag2","tag3"]}. style_tags must be short lowercase words, max 8.',
    },
    {
      inline_data: {
        mime_type: image.mimeType,
        data: image.base64Data,
      },
    },
  ]);

  const parsed = parseJsonSafe<{ caption?: string; style_tags?: string[] }>(
    content,
    {},
  );
  const caption = (parsed.caption ?? "").trim();
  const styleTags = (parsed.style_tags ?? [])
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0)
    .slice(0, 8);

  if (!caption) {
    throw new Error("Failed to analyze image caption");
  }

  return { caption, styleTags };
};

const fetchImageAsDataUrl = async (imageUrl: string) => {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return `data:${contentType};base64,${base64}`;
};

const ensureProductImageCaptionEmbeddings = async (
  supabaseClient: SupabaseClient<Database>,
  batchCount: number,
) => {
  const { data, error } = await listProductImagesForEmbeddingQueryBuilder(
    supabaseClient,
    batchCount,
  );
  if (error) {
    throw new Error(
      `Failed to list product images for embedding: ${error.message}`,
    );
  }

  const rows = (data ?? []) as Array<{ image_id: string; image_url: string }>;
  for (const row of rows) {
    try {
      const dataUrl = await fetchImageAsDataUrl(row.image_url);
      const analysis = await analyzeImageStyle(dataUrl);
      const embedding = await callGeminiEmbedding(analysis.caption);
      const embeddingLiteral = toVectorLiteral(embedding);

      const { error: updateError } =
        await updateProductImageCaptionEmbeddingQueryBuilder(
          supabaseClient,
          row.image_id,
          analysis.caption,
          embeddingLiteral,
        );

      if (updateError) {
        throw new Error(updateError.message);
      }
    } catch {
      continue;
    }
  }
};

const mapMatchedProductsToItems = async (
  supabaseClient: SupabaseClient<Database>,
  rows: Array<{ product_id: string; similarity: number }>,
  limit: number,
) => {
  if (rows.length === 0) return [] as ShopProductItem[];

  const productIds = rows.map((row) => row.product_id);
  const { data: productsData, error: productsError } =
    await getProductsByIdsQueryBuilder(supabaseClient, productIds);
  if (productsError) {
    throw new Error(
      `Failed to load matched products: ${productsError.message}`,
    );
  }

  const productRows = (productsData ?? []) as Array<{
    id: string;
    slug: string;
  }>;
  const slugById = new Map(productRows.map((row) => [row.id, row.slug]));
  const orderedSlugs = productIds
    .map((id) => slugById.get(id))
    .filter((slug): slug is string => !!slug);

  const products = await getProductsBySlugs(supabaseClient, orderedSlugs);
  const scoreBySlug = new Map(
    rows
      .map((row) => {
        const slug = slugById.get(row.product_id);
        if (!slug) return null;
        return [slug, clampMatch(Number(row.similarity ?? 0))] as const;
      })
      .filter((entry): entry is readonly [string, number] => !!entry),
  );

  return products.slice(0, limit).map((product) => ({
    ...product,
    aiMatch: scoreBySlug.get(product.id) ?? product.aiMatch,
  }));
};

const getProductDbIdBySlug = async (
  supabaseClient: SupabaseClient<Database>,
  productSlug: string,
) => {
  const { data, error } = await getProductsBySlugsQueryBuilder(supabaseClient, [
    productSlug,
  ]);
  if (error) {
    throw new Error(`Failed to load source product: ${error.message}`);
  }
  const row = (data ?? [])[0] as { id?: string } | undefined;
  return row?.id ?? null;
};

const buildTagScoreByProductId = async (
  supabaseClient: SupabaseClient<Database>,
  styleTags: string[],
) => {
  const tagSlugs = [
    ...new Set(
      styleTags.map(normalizeTagSlug).filter((slug) => slug.length > 0),
    ),
  ];
  if (tagSlugs.length === 0) {
    return new Map<string, number>();
  }

  const { data: tagRowsData, error: tagRowsError } =
    await getProductTagsBySlugsQueryBuilder(supabaseClient, tagSlugs);
  if (tagRowsError) {
    throw new Error(`Failed to load style tags: ${tagRowsError.message}`);
  }

  const tagRows = (tagRowsData ?? []) as Array<{ id: string }>;
  if (tagRows.length === 0) {
    return new Map<string, number>();
  }

  const tagIds = tagRows.map((tag) => tag.id);
  const { data: relationsData, error: relationsError } =
    await getProductTagRelationsByTagIdsQueryBuilder(supabaseClient, tagIds);
  if (relationsError) {
    throw new Error(
      `Failed to load product tag relations: ${relationsError.message}`,
    );
  }

  const relations = (relationsData ?? []) as Array<{
    product_id: string;
    tag_id: string;
  }>;
  const countByProductId = new Map<string, number>();
  relations.forEach((relation) => {
    countByProductId.set(
      relation.product_id,
      (countByProductId.get(relation.product_id) ?? 0) + 1,
    );
  });

  const totalTags = Math.max(1, tagRows.length);
  const scoreByProductId = new Map<string, number>();
  countByProductId.forEach((count, productId) => {
    scoreByProductId.set(productId, Math.min(1, count / totalTags));
  });
  return scoreByProductId;
};

const mergeEmbeddingAndTagScores = (
  embeddingRows: Array<{ product_id: string; similarity: number }>,
  tagScoreByProductId: Map<string, number>,
) => {
  const scoreMap = new Map<string, { embedding: number; tag: number }>();

  embeddingRows.forEach((row) => {
    const prev = scoreMap.get(row.product_id);
    const embedding = Math.max(
      prev?.embedding ?? 0,
      Number(row.similarity ?? 0),
    );
    scoreMap.set(row.product_id, {
      embedding,
      tag: prev?.tag ?? 0,
    });
  });

  tagScoreByProductId.forEach((tagScore, productId) => {
    const prev = scoreMap.get(productId);
    scoreMap.set(productId, {
      embedding: prev?.embedding ?? 0,
      tag: Math.max(prev?.tag ?? 0, tagScore),
    });
  });

  return [...scoreMap.entries()]
    .map(([product_id, score]) => {
      const similarity =
        score.embedding > 0
          ? score.embedding * EMBEDDING_WEIGHT + score.tag * TAG_WEIGHT
          : score.tag * 0.35;
      return { product_id, similarity };
    })
    .sort((a, b) => b.similarity - a.similarity);
};

export const findStyleByImage = async (
  supabaseClient: SupabaseClient<Database>,
  input: FindStyleByImageInput,
): Promise<FindStyleByImageResult> => {
  const limit = Math.max(1, Math.min(12, input.limit ?? 6));
  if (ENABLE_EMBEDDING_BACKFILL) {
    await ensureProductImageCaptionEmbeddings(supabaseClient, 8);
  }

  const analysis = await analyzeImageStyle(input.imageDataUrl);
  const queryEmbedding = await callGeminiEmbedding(analysis.caption);
  const queryEmbeddingLiteral = toVectorLiteral(queryEmbedding);

  const [{ data, error }, tagScoreByProductId] = await Promise.all([
    matchProductsByImageEmbeddingQueryBuilder(
      supabaseClient,
      queryEmbeddingLiteral,
      Math.max(limit * 4, 24),
    ),
    buildTagScoreByProductId(supabaseClient, analysis.styleTags),
  ]);

  if (error) {
    throw new Error(
      `Failed to search similar products by image: ${error.message}`,
    );
  }

  const embeddingRows = (data ?? []) as Array<{
    product_id: string;
    similarity: number;
  }>;
  const rankedRows = mergeEmbeddingAndTagScores(
    embeddingRows,
    tagScoreByProductId,
  );

  if (rankedRows.length === 0) {
    const fallback = await loadShopProductsPage(supabaseClient, {
      offset: 0,
      limit,
    });
    return {
      detectedTags: analysis.styleTags,
      products: fallback.items.map((item) => ({ ...item, aiMatch: 0 })),
    };
  }

  const products = await mapMatchedProductsToItems(
    supabaseClient,
    rankedRows,
    limit,
  );
  return {
    detectedTags: analysis.styleTags,
    products,
  };
};

export const recommendSimilarProductsByAi = async (
  supabaseClient: SupabaseClient<Database>,
  input: RecommendSimilarByAiInput,
): Promise<ShopProductItem[]> => {
  const limit = Math.max(1, Math.min(12, input.limit ?? 5));
  if (ENABLE_EMBEDDING_BACKFILL) {
    await ensureProductImageCaptionEmbeddings(supabaseClient, 8);
  }

  const sourceProductDbId = await getProductDbIdBySlug(
    supabaseClient,
    input.productId,
  );
  if (!sourceProductDbId) {
    return [];
  }

  const { data, error } = await matchProductsByProductEmbeddingQueryBuilder(
    supabaseClient,
    sourceProductDbId,
    Math.max(limit * 4, 24),
  );
  if (error) {
    throw new Error(`Failed to search similar products: ${error.message}`);
  }

  const rows = (data ?? []) as Array<{
    product_id: string;
    similarity: number;
  }>;
  if (rows.length === 0) {
    return [];
  }

  return mapMatchedProductsToItems(supabaseClient, rows, limit);
};

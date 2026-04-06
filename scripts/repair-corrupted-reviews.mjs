import { readFile } from "node:fs/promises";

const COPY_POOL = {
  KR: {
    titles: [
      "핏 좋아요",
      "실물이 더 예뻐요",
      "데일리로 좋아요",
      "퀄리티 만족",
      "스트릿 무드 제대로",
      "디테일이 좋네요",
      "추천할 만해요",
      "생각보다 더 괜찮아요",
    ],
    contents: [
      "핏이 깔끔하고 전체적인 완성도가 좋아서 자주 손이 갑니다.",
      "원단이 탄탄하고 착용감도 편해서 데일리로 입기 좋았어요.",
      "실물 색감이 더 좋고 디테일이 살아 있어서 만족스럽습니다.",
      "다른 아이템이랑 매치하기 쉬워서 활용도가 높아요.",
      "스트릿한 분위기가 잘 살아 있고 마감도 기대 이상이었어요.",
      "생각보다 더 가볍고 편해서 하루 종일 입어도 부담이 없었습니다.",
      "실루엣이 예쁘게 떨어져서 사진보다 실제 착용이 더 마음에 들었어요.",
      "전체적인 퀄리티가 안정적이라 가격 대비 만족도가 높습니다.",
    ],
  },
  EN: {
    titles: [
      "Great fit",
      "Looks even better",
      "Easy daily piece",
      "Quality feels solid",
      "Street vibe on point",
      "Love the details",
      "Would recommend",
      "Better than expected",
    ],
    contents: [
      "The fit is clean and the overall finish makes this easy to wear often.",
      "Fabric feels sturdy and comfortable enough for everyday styling.",
      "It looks better in person and the details make it feel more premium.",
      "Very easy to pair with other pieces, so it gets a lot of use.",
      "The streetwear vibe comes through well and the construction feels solid.",
      "Lighter and more comfortable than expected, even for all-day wear.",
      "The silhouette falls nicely and looks better on body than in photos.",
      "Overall quality feels reliable and the value is strong for the price.",
    ],
  },
};

function parseEnv(text) {
  const env = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIndex = line.indexOf("=");
    if (eqIndex < 0) continue;
    const key = line.slice(0, eqIndex).trim();
    const value = line.slice(eqIndex + 1).trim();
    env[key] = value;
  }
  return env;
}

function hashText(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pickFrom(pool, seed) {
  return pool[hashText(seed) % pool.length];
}

function hasCorruption(value) {
  return typeof value === "string" && value.includes("?");
}

function detectLocale(value) {
  if (typeof value !== "string") return null;
  if (/[가-힣]/.test(value)) return "KR";
  if (/[A-Za-z]/.test(value)) return "EN";
  return null;
}

async function main() {
  const envText = await readFile(".env.local", "utf8");
  const env = parseEnv(envText);
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase credentials in .env.local");
  }

  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(
    `${supabaseUrl}/rest/v1/reviews?select=id,title,content&or=(title.like.*%3F*,content.like.*%3F*)&order=created_at.asc`,
    { headers },
  );

  if (!response.ok) {
    throw new Error(`Failed to load damaged reviews: ${response.status} ${await response.text()}`);
  }

  const reviews = await response.json();
  let updatedCount = 0;

  for (const review of reviews) {
    const survivingLocale = detectLocale(review.title) ?? detectLocale(review.content);
    const locale = survivingLocale ?? (hashText(`${review.id}:locale`) % 2 === 0 ? "KR" : "EN");
    const pool = COPY_POOL[locale];
    const payload = {};

    if (hasCorruption(review.title)) {
      payload.title = pickFrom(pool.titles, `${review.id}:title`);
    }

    if (hasCorruption(review.content)) {
      payload.content = pickFrom(pool.contents, `${review.id}:content`);
    }

    if (Object.keys(payload).length === 0) continue;

    const patchResponse = await fetch(`${supabaseUrl}/rest/v1/reviews?id=eq.${review.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(payload),
    });

    if (!patchResponse.ok) {
      throw new Error(`Failed to update review ${review.id}: ${patchResponse.status} ${await patchResponse.text()}`);
    }

    updatedCount += 1;
  }

  console.log(JSON.stringify({ damagedCount: reviews.length, updatedCount }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

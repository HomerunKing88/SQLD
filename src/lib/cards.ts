// 개념 카드 덱 정렬·요약 — 순수 함수(테스트 용이). 저장/렌더와 분리.
import type { CardProgress, CardRating, Concept } from "./types";

export type ConceptGroup = "all" | "sql" | "modeling";

/** 카테고리 → 그룹(SQL / 데이터모델링) */
export function groupOf(c: Concept): Exclude<ConceptGroup, "all"> {
  return c.category.startsWith("modeling") ? "modeling" : "sql";
}

/** 등급별 재출제 우선순위(작을수록 먼저). 미학습·다시 → 앞, 숙지 → 뒤 */
function weight(rating: CardRating | undefined): number {
  switch (rating) {
    case "again":
      return 0; // 몰라서 '다시' → 최우선 재노출
    case undefined:
      return 1; // 아직 안 본 카드
    case "ok":
      return 2; // 애매
    case "known":
      return 3; // 숙지 → 맨 뒤
  }
}

/**
 * 덱 정렬: 그룹 필터 후, (진행 등급 가중치 → 원래 순서) 안정 정렬.
 * 결정적(Math.random 미사용)이라 미리보기·실제 세트가 일치한다.
 */
export function buildCardDeck(
  concepts: Concept[],
  progress: Record<string, CardProgress>,
  group: ConceptGroup = "all"
): Concept[] {
  const filtered = concepts.filter(
    (c) => group === "all" || groupOf(c) === group
  );
  return filtered
    .map((c, idx) => ({ c, idx, w: weight(progress[c.id]?.rating) }))
    .sort((a, b) => a.w - b.w || a.idx - b.idx)
    .map((x) => x.c);
}

export interface DeckSummary {
  total: number;
  known: number; // 숙지
  learning: number; // again + ok
  unseen: number; // 아직 안 본 것
  masteredRatio: number; // 0~1 (숙지/전체)
}

/** 그룹 기준 진행 요약(홈·카드 상단 표시용) */
export function deckSummary(
  concepts: Concept[],
  progress: Record<string, CardProgress>,
  group: ConceptGroup = "all"
): DeckSummary {
  const filtered = concepts.filter(
    (c) => group === "all" || groupOf(c) === group
  );
  let known = 0;
  let learning = 0;
  let unseen = 0;
  for (const c of filtered) {
    const r = progress[c.id]?.rating;
    if (r === "known") known += 1;
    else if (r === "again" || r === "ok") learning += 1;
    else unseen += 1;
  }
  const total = filtered.length;
  return {
    total,
    known,
    learning,
    unseen,
    masteredRatio: total ? known / total : 0,
  };
}

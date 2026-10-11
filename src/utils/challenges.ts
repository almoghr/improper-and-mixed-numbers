import type { Challenge, ChallengeDirection } from '../types';

export function getQuestionKey(challenge: Challenge): string {
  return `${challenge.direction}:${challenge.improper.numerator}/${challenge.improper.denominator}`;
}

export function getFractionKey(challenge: Challenge): string {
  return `${challenge.improper.numerator}/${challenge.improper.denominator}`;
}

export function createChallenge(
  id: number,
  whole: number,
  remainder: number,
  denom: number,
  direction: ChallengeDirection,
  tier: 1 | 2 | 3 | 4,
  tierName: string
): Challenge {
  const improperNum = whole * denom + remainder;
  const hint1 =
    direction === 'improper_to_mixed'
      ? `כמה פעמים המכנה ${denom} נכנס במלואו במונה ${improperNum}?`
      : `כדי לדעת כמה חלקים יש בסך הכל, נכפיל את השלם (${whole}) במכנה (${denom}).`;
  const hint2 =
    direction === 'improper_to_mixed'
      ? `חלק: ${improperNum} ÷ ${denom}. התוצאה היא השלם, והשארית היא המונה החדש!`
      : `חשב: (${whole} × ${denom}) + ${remainder}. המכנה (${denom}) נשאר אותו דבר!`;
  const explanationText =
    direction === 'improper_to_mixed'
      ? `נחלק את המונה במכנה: ${improperNum} ÷ ${denom} = ${whole} ושארית ${remainder}. לכן השבר הוא ${whole} ו-${remainder}/${denom}.`
      : `נכפיל את השלמים במכנה ונוסיף את השארית: (${whole} × ${denom}) + ${remainder} = ${improperNum}. המכנה נשאר ${denom}, לכן השבר הוא ${improperNum}/${denom}.`;

  return {
    id,
    direction,
    improper: { numerator: improperNum, denominator: denom },
    mixed: { whole, numerator: remainder, denominator: denom },
    tier,
    tierName,
    hint1,
    hint2,
    explanationText,
  };
}

// Generates 200 strictly unique, mathematically sound challenges for the Quest mode (50 per tier)
function generate200Challenges(): Challenge[] {
  const challenges: Challenge[] = [];
  let id = 1;

  const tierSpecs: {
    tier: 1 | 2 | 3 | 4;
    name: string;
    denoms: number[];
    wholeMin: number;
    wholeMax: number;
  }[] = [
    {
      tier: 1,
      name: 'שלב 1: יסודות',
      denoms: [2, 3, 4, 5, 6],
      wholeMin: 1,
      wholeMax: 4,
    },
    {
      tier: 2,
      name: 'שלב 2: ביניים',
      denoms: [4, 5, 6, 7, 8],
      wholeMin: 2,
      wholeMax: 5,
    },
    {
      tier: 3,
      name: 'שלב 3: מתקדם',
      denoms: [6, 7, 8, 9, 10],
      wholeMin: 2,
      wholeMax: 6,
    },
    {
      tier: 4,
      name: 'שלב 4: מומחה',
      denoms: [7, 8, 9, 10, 11, 12, 14, 16],
      wholeMin: 3,
      wholeMax: 7,
    },
  ];

  const globalSeenKeys = new Set<string>();

  for (const spec of tierSpecs) {
    const candidates: { whole: number; remainder: number; denom: number; key: string }[] = [];
    for (const d of spec.denoms) {
      for (let w = spec.wholeMin; w <= spec.wholeMax; w++) {
        for (let r = 1; r < d; r++) {
          const key = `${w} ${r}/${d}`;
          if (!globalSeenKeys.has(key)) {
            candidates.push({ whole: w, remainder: r, denom: d, key });
          }
        }
      }
    }

    const chosen: { whole: number; remainder: number; denom: number; key: string }[] = [];
    let idx = 0;
    while (chosen.length < 50 && candidates.length > 0) {
      const pickIdx = (idx * 7) % candidates.length;
      const cand = candidates.splice(pickIdx, 1)[0];
      chosen.push(cand);
      globalSeenKeys.add(cand.key);
      idx++;
    }

    for (let i = 0; i < chosen.length; i++) {
      const c = chosen[i];
      const direction: ChallengeDirection = i % 2 === 0 ? 'improper_to_mixed' : 'mixed_to_improper';
      challenges.push(
        createChallenge(id++, c.whole, c.remainder, c.denom, direction, spec.tier, spec.name)
      );
    }
  }

  return challenges;
}

// Generates a massive pool of 5,000+ challenges for the 60 seconds speed challenge
function generateTimedChallengesPool(): {
  all: Challenge[];
  byTier: Record<1 | 2 | 3 | 4, Challenge[]>;
} {
  const all: Challenge[] = [];
  const byTier: Record<1 | 2 | 3 | 4, Challenge[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
  };

  const timedSpecs: {
    tier: 1 | 2 | 3 | 4;
    name: string;
    denoms: number[];
    wholeMin: number;
    wholeMax: number;
  }[] = [
    {
      tier: 1,
      name: 'שלב 1: יסודות',
      denoms: [2, 3, 4, 5, 6],
      wholeMin: 1,
      wholeMax: 6,
    },
    {
      tier: 2,
      name: 'שלב 2: ביניים',
      denoms: [3, 4, 5, 6, 7, 8, 9, 10],
      wholeMin: 2,
      wholeMax: 8,
    },
    {
      tier: 3,
      name: 'שלב 3: מתקדם',
      denoms: [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15],
      wholeMin: 2,
      wholeMax: 9,
    },
    {
      tier: 4,
      name: 'שלב 4: מומחה',
      denoms: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20],
      wholeMin: 3,
      wholeMax: 12,
    },
  ];

  let nextId = 10000;
  for (const spec of timedSpecs) {
    for (const d of spec.denoms) {
      for (let w = spec.wholeMin; w <= spec.wholeMax; w++) {
        for (let r = 1; r < d; r++) {
          const ch1 = createChallenge(
            nextId++,
            w,
            r,
            d,
            'improper_to_mixed',
            spec.tier,
            spec.name
          );
          const ch2 = createChallenge(
            nextId++,
            w,
            r,
            d,
            'mixed_to_improper',
            spec.tier,
            spec.name
          );

          all.push(ch1, ch2);
          byTier[spec.tier].push(ch1, ch2);
        }
      }
    }
  }

  return { all, byTier };
}

export const ALL_CHALLENGES: Challenge[] = generate200Challenges();

// Pre-filtered lists for the dedicated game modes
export const IMPROPER_TO_MIXED_CHALLENGES = ALL_CHALLENGES.filter(
  c => c.direction === 'improper_to_mixed'
);
export const MIXED_TO_IMPROPER_CHALLENGES = ALL_CHALLENGES.filter(
  c => c.direction === 'mixed_to_improper'
);

const { all: TIMED_CHALLENGES_POOL, byTier: TIMED_CHALLENGES_BY_TIER } =
  generateTimedChallengesPool();

export { TIMED_CHALLENGES_POOL, TIMED_CHALLENGES_BY_TIER };

/**
 * Gets a random challenge from the large pool, strictly ensuring no duplicates
 * in the active challenge session by filtering out any excluded question keys and fraction keys.
 */
export function getRandomChallenge(
  tier?: number,
  excludedKeys?: Set<string> | string[]
): Challenge {
  const excludeSet =
    excludedKeys instanceof Set ? excludedKeys : new Set(excludedKeys || []);
  const targetTier = (
    tier && tier >= 1 && tier <= 4 ? tier : 1
  ) as 1 | 2 | 3 | 4;
  const pool = TIMED_CHALLENGES_BY_TIER[targetTier] || TIMED_CHALLENGES_POOL;

  // Level 1: Strict match - neither identical question nor identical fraction numbers used
  let available = pool.filter(
    c => !excludeSet.has(getFractionKey(c)) && !excludeSet.has(getQuestionKey(c))
  );

  // Level 2: If strict is exhausted in current tier, at least ensure question key itself wasn't seen
  if (available.length === 0) {
    available = pool.filter(c => !excludeSet.has(getQuestionKey(c)));
  }

  // Level 3: If whole tier is exhausted, check other tiers for questions not in excludeSet
  if (available.length === 0) {
    available = TIMED_CHALLENGES_POOL.filter(c => !excludeSet.has(getQuestionKey(c)));
  }

  // Level 4: Procedural generation fallback if somehow everything in the 5,000+ pool was used
  if (available.length === 0) {
    let attempts = 0;
    while (attempts < 500) {
      attempts++;
      const d = 2 + Math.floor(Math.random() * 12);
      const w = 1 + Math.floor(Math.random() * 10);
      const r = 1 + Math.floor(Math.random() * (d - 1));
      const dir: ChallengeDirection =
        Math.random() < 0.5 ? 'improper_to_mixed' : 'mixed_to_improper';
      const c = createChallenge(
        999000 + attempts,
        w,
        r,
        d,
        dir,
        targetTier,
        `שלב ${targetTier}`
      );
      if (!excludeSet.has(getQuestionKey(c)) && !excludeSet.has(getFractionKey(c))) {
        return c;
      }
    }
  }

  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

// Storage helpers for user progress
const STATS_KEY = 'fraction_lab_user_stats';

export function loadUserStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) {
      return {
        completedChallengeIds: [],
        highScore60s: 0,
        totalAnswered: 0,
        totalCorrect: 0,
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      completedChallengeIds: [],
      highScore60s: 0,
      totalAnswered: 0,
      totalCorrect: 0,
    };
  }
}

export function saveChallengeCompleted(challengeId: number) {
  const stats = loadUserStats();
  if (!stats.completedChallengeIds.includes(challengeId)) {
    stats.completedChallengeIds.push(challengeId);
  }
  stats.totalAnswered += 1;
  stats.totalCorrect += 1;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  return stats;
}

export function saveHighScore(score: number) {
  const stats = loadUserStats();
  if (score > (stats.highScore60s || 0)) {
    stats.highScore60s = score;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }
  return stats.highScore60s;
}

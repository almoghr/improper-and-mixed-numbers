import type { Challenge, ChallengeDirection } from '../types';

// Deterministic generator ensuring 200 unique, mathematically sound challenges
function generate200Challenges(): Challenge[] {
  const challenges: Challenge[] = [];
  let id = 1;

  // Tier 1: 50 Challenges (Denominators 2, 3, 4, Wholes 1-2)
  const tier1Configs = [
    { denom: 2, minWhole: 1, maxWhole: 2 },
    { denom: 3, minWhole: 1, maxWhole: 2 },
    { denom: 4, minWhole: 1, maxWhole: 2 },
    { denom: 5, minWhole: 1, maxWhole: 2 },
  ];

  // Tier 2: 50 Challenges (Denominators 4, 5, 6, 8, Wholes 1-3)
  const tier2Configs = [
    { denom: 4, minWhole: 2, maxWhole: 3 },
    { denom: 5, minWhole: 1, maxWhole: 3 },
    { denom: 6, minWhole: 1, maxWhole: 3 },
    { denom: 8, minWhole: 1, maxWhole: 3 },
  ];

  // Tier 3: 50 Challenges (Denominators 6, 7, 8, 9, 10, Wholes 2-4)
  const tier3Configs = [
    { denom: 6, minWhole: 2, maxWhole: 4 },
    { denom: 7, minWhole: 2, maxWhole: 4 },
    { denom: 8, minWhole: 2, maxWhole: 4 },
    { denom: 9, minWhole: 2, maxWhole: 4 },
    { denom: 10, minWhole: 2, maxWhole: 4 },
  ];

  // Tier 4: 50 Challenges (Denominators 7, 8, 10, 12, 16, Wholes 3-6)
  const tier4Configs = [
    { denom: 8, minWhole: 3, maxWhole: 5 },
    { denom: 10, minWhole: 3, maxWhole: 5 },
    { denom: 12, minWhole: 2, maxWhole: 5 },
    { denom: 16, minWhole: 2, maxWhole: 4 },
    { denom: 7, minWhole: 3, maxWhole: 6 },
  ];

  const buildTier = (
    tierNumber: 1 | 2 | 3 | 4,
    tierName: string,
    configs: { denom: number; minWhole: number; maxWhole: number }[],
    count: number
  ) => {
    let created = 0;
    let configIndex = 0;
    const seen = new Set<string>();

    while (created < count) {
      const cfg = configs[configIndex % configs.length];
      configIndex++;

      const wholeRange = cfg.maxWhole - cfg.minWhole + 1;
      const whole = cfg.minWhole + (Math.floor(created / configs.length) % wholeRange);
      // Remainder must be between 1 and denom - 1 (non-zero so it's a true mixed fraction)
      const remainder = 1 + ((created * 3 + whole) % (cfg.denom - 1));
      const improperNum = whole * cfg.denom + remainder;

      const key = `${improperNum}/${cfg.denom}`;
      if (seen.has(key)) {
        // slight jitter
        const altRemainder = 1 + ((remainder + 1) % (cfg.denom - 1));
        const altNum = whole * cfg.denom + altRemainder;
        const altKey = `${altNum}/${cfg.denom}`;
        if (seen.has(altKey)) continue;
      }
      seen.add(key);

      // Alternate directions in the 200 challenges bank
      const direction: ChallengeDirection = created % 2 === 0 ? 'improper_to_mixed' : 'mixed_to_improper';

      let hint1 = '';
      let hint2 = '';
      let explanationText = '';

      if (direction === 'improper_to_mixed') {
        hint1 = `כמה פעמים המכנה ${cfg.denom} נכנס במלואו במונה ${improperNum}?`;
        hint2 = `חלק: ${improperNum} ÷ ${cfg.denom}. התוצאה היא השלם, והשארית היא המונה החדש!`;
        explanationText = `נחלק את המונה במכנה: ${improperNum} ÷ ${cfg.denom} = ${whole} ושארית ${remainder}. לכן השבר הוא ${whole} ו-${remainder}/${cfg.denom}.`;
      } else {
        hint1 = `כדי לדעת כמה חלקים יש בסך הכל, נכפיל את השלם (${whole}) במכנה (${cfg.denom}).`;
        hint2 = `חשב: (${whole} × ${cfg.denom}) + ${remainder}. המכנה (${cfg.denom}) נשאר אותו דבר!`;
        explanationText = `נכפיל את השלמים במכנה ונוסיף את השארית: (${whole} × ${cfg.denom}) + ${remainder} = ${improperNum}. המכנה נשאר ${cfg.denom}, לכן השבר הוא ${improperNum}/${cfg.denom}.`;
      }

      challenges.push({
        id,
        direction,
        improper: { numerator: improperNum, denominator: cfg.denom },
        mixed: { whole, numerator: remainder, denominator: cfg.denom },
        tier: tierNumber,
        tierName,
        hint1,
        hint2,
        explanationText,
      });

      id++;
      created++;
    }
  };

  buildTier(1, 'שלב 1: יסודות', tier1Configs, 50);
  buildTier(2, 'שלב 2: ביניים', tier2Configs, 50);
  buildTier(3, 'שלב 3: מתקדם', tier3Configs, 50);
  buildTier(4, 'שלב 4: מומחה', tier4Configs, 50);

  return challenges;
}

export const ALL_CHALLENGES: Challenge[] = generate200Challenges();

// Pre-filtered lists for the dedicated game modes
export const IMPROPER_TO_MIXED_CHALLENGES = ALL_CHALLENGES.filter(c => c.direction === 'improper_to_mixed');
export const MIXED_TO_IMPROPER_CHALLENGES = ALL_CHALLENGES.filter(c => c.direction === 'mixed_to_improper');

// Helper to get random challenge for timed mode
export function getRandomChallenge(tier?: number): Challenge {
  const pool = tier ? ALL_CHALLENGES.filter(c => c.tier === tier) : ALL_CHALLENGES;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

// Storage helpers for user progress
const STATS_KEY = 'fraction_lab_user_stats';

export function loadUserStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { completedChallengeIds: [], highScore60s: 0, totalAnswered: 0, totalCorrect: 0 };
    return JSON.parse(raw);
  } catch {
    return { completedChallengeIds: [], highScore60s: 0, totalAnswered: 0, totalCorrect: 0 };
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

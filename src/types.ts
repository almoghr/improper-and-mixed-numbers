export type ShapeType = 'circle' | 'rectangle';

export type GameMode = 
  | 'improper_to_mixed'  // משבר מדומה למספר מעורב
  | 'mixed_to_improper'  // ממספר מעורב לשבר מדומה
  | 'challenge_200'      // מאגר 200 האתגרים (מעורב)
  | 'timed_60'           // אתגר 60 שניות
  | 'sandbox';           // מעבדה חופשית (סנדבוקס)

export interface Fraction {
  numerator: number;
  denominator: number;
}

export interface MixedNumber {
  whole: number;
  numerator: number;
  denominator: number;
}

export type ChallengeDirection = 'improper_to_mixed' | 'mixed_to_improper';

export interface Challenge {
  id: number;
  direction: ChallengeDirection;
  improper: Fraction;
  mixed: MixedNumber;
  tier: 1 | 2 | 3 | 4;
  tierName: string;
  hint1: string;
  hint2: string;
  explanationText: string;
}

export interface StudentAnswer {
  whole?: number | string;
  numerator?: number | string;
  denominator?: number | string;
}

export interface UserStats {
  completedChallengeIds: number[];
  highScore60s: number;
  totalAnswered: number;
  totalCorrect: number;
}

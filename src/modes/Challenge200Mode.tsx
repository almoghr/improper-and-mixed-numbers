import React, { useState, useEffect, useRef } from 'react';
import { ALL_CHALLENGES, loadUserStats, saveChallengeCompleted } from '../utils/challenges';
import type { StudentAnswer } from '../types';
import { FractionInput } from '../components/FractionInput';
import { ManipulativeWorkspace } from '../components/manipulatives/ManipulativeWorkspace';
import { ExplanationModal } from '../components/ExplanationModal';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Star,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Flame,
  LayoutGrid,
} from 'lucide-react';

export const Challenge200Mode: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<1 | 2 | 3 | 4>(1);
  const [activeChallengeId, setActiveChallengeId] = useState<number>(1);
  const [showLevelGrid, setShowLevelGrid] = useState<boolean>(false);
  const [completedIds, setCompletedIds] = useState<number[]>([]);

  // Current challenge object
  const currentChallenge = ALL_CHALLENGES.find(c => c.id === activeChallengeId) || ALL_CHALLENGES[0];

  const [answer, setAnswer] = useState<StudentAnswer>({});
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [feedback, setFeedback] = useState<{
    type: 'correct' | 'wrong' | null;
    message: string;
  }>({ type: null, message: '' });

  const [showExplanation, setShowExplanation] = useState(false);
  const [showVisualHelper, setShowVisualHelper] = useState(false);
  const [streak, setStreak] = useState(0);

  // Load completed challenges on mount
  useEffect(() => {
    const stats = loadUserStats();
    setCompletedIds(stats.completedChallengeIds || []);
  }, []);

  // Update selected tier when jumping to a challenge
  useEffect(() => {
    if (currentChallenge) {
      setSelectedTier(currentChallenge.tier);
    }
  }, [currentChallenge]);

  // Check answer
  const handleSubmit = () => {
    const { direction, improper, mixed } = currentChallenge;
    let isCorrect = false;

    if (direction === 'improper_to_mixed') {
      const userWhole = Number(answer.whole);
      const userNum = Number(answer.numerator);
      const userDenom = Number(answer.denominator);

      const isExact =
        userWhole === mixed.whole &&
        userNum === mixed.numerator &&
        userDenom === mixed.denominator;

      const isEquiv =
        userWhole === mixed.whole &&
        userNum > 0 &&
        userDenom > 0 &&
        userNum * mixed.denominator === mixed.numerator * userDenom;

      isCorrect = isExact || isEquiv;
    } else {
      const userNum = Number(answer.numerator);
      const userDenom = Number(answer.denominator);

      const isExact =
        userNum === improper.numerator && userDenom === improper.denominator;

      const isEquiv =
        userNum > 0 &&
        userDenom > 0 &&
        userNum * improper.denominator === improper.numerator * userDenom;

      isCorrect = isExact || isEquiv;
    }

    if (isCorrect) {
      soundManager.playSuccess();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
      });
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak % 5 === 0) {
        soundManager.playStreak(Math.floor(newStreak / 5));
      }

      // Save progress
      const updated = saveChallengeCompleted(currentChallenge.id);
      setCompletedIds(updated.completedChallengeIds);

      setFeedback({
        type: 'correct',
        message: 'כל הכבוד! פתרת בהצלחה! ⭐ קבלת כוכב זהב לשלב זה!',
      });
    } else {
      const nextMistakes = mistakesCount + 1;
      setMistakesCount(nextMistakes);
      setStreak(0);
      soundManager.playError();

      if (nextMistakes >= 3) {
        setShowExplanation(true);
        setFeedback({
          type: 'wrong',
          message: '3 ניסיונות! בוא נראה את ההסבר המלא וההמחשה.',
        });
      } else if (nextMistakes === 1) {
        setFeedback({
          type: 'wrong',
          message: `רמז ראשון: ${currentChallenge.hint1}`,
        });
      } else if (nextMistakes === 2) {
        setShowVisualHelper(true);
        setFeedback({
          type: 'wrong',
          message: `רמז שני: ${currentChallenge.hint2}`,
        });
      }
    }
  };

  const handleNextChallenge = () => {
    soundManager.playPop();
    const nextId = activeChallengeId < 200 ? activeChallengeId + 1 : 1;
    setActiveChallengeId(nextId);
    setAnswer({});
    setMistakesCount(0);
    setFeedback({ type: null, message: '' });
    setShowExplanation(false);
  };

  const handlePrevChallenge = () => {
    soundManager.playPop();
    const prevId = activeChallengeId > 1 ? activeChallengeId - 1 : 200;
    setActiveChallengeId(prevId);
    setAnswer({});
    setMistakesCount(0);
    setFeedback({ type: null, message: '' });
    setShowExplanation(false);
  };

  const handleSelectLevel = (id: number) => {
    soundManager.playPop();
    setActiveChallengeId(id);
    setAnswer({});
    setMistakesCount(0);
    setFeedback({ type: null, message: '' });
    setShowExplanation(false);
    setShowLevelGrid(false);
  };

  const [isHighlightingAnswer, setIsHighlightingAnswer] = useState(false);
  const inputTargetRef = useRef<HTMLDivElement>(null);

  const handleApplyFromVisual = (w: number, num: number, den: number) => {
    if (currentChallenge.direction === 'improper_to_mixed') {
      setAnswer({ whole: w, numerator: num, denominator: den });
    } else {
      const totalNum = w * den + num;
      setAnswer({ numerator: totalNum, denominator: den });
    }

    setIsHighlightingAnswer(true);
    setTimeout(() => setIsHighlightingAnswer(false), 1500);

    setTimeout(() => {
      inputTargetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const firstInput = inputTargetRef.current?.querySelector('input');
      if (firstInput) {
        firstInput.focus();
      }
    }, 50);
  };

  const tierChallenges = ALL_CHALLENGES.filter(c => c.tier === selectedTier);
  const tierCompletedCount = tierChallenges.filter(c => completedIds.includes(c.id)).length;

  const { direction, improper, mixed } = currentChallenge;
  const isCurrentCompleted = completedIds.includes(currentChallenge.id);

  return (
    <div className="mode-container challenge200-container">
      {/* Top Quest Header */}
      <div className="quest-header">
        <div className="quest-title-box">
          <div className="badge-pill gold">
            <Trophy size={16} />
            <span>מסע 200 האתגרים (מעורב)</span>
          </div>
          <h2 className="mode-headline">200 האתגרים: שבר מדומה ומעורב</h2>
          <p className="mode-subtext">
            האתגרים משלבים שאלות משני הכיוונים כדי לבנות שליטה מוחלטת בחומר. אם תטעה 3 פעמים, נפתח לך הסבר והמחשה מלאה!
          </p>
        </div>

        {/* Global Stats */}
        <div className="header-stats">
          <div className="stat-chip streak-chip">
            <Flame size={18} className="flame-icon" />
            <span>רצף: {streak}</span>
          </div>
          <div className="stat-chip stars-chip">
            <Star size={18} className="star-icon filled" />
            <span>
              {completedIds.length} / 200 כוכבים ({Math.round((completedIds.length / 200) * 100)}%)
            </span>
          </div>
          <button
            type="button"
            className="toggle-grid-btn"
            onClick={() => setShowLevelGrid(prev => !prev)}
          >
            <LayoutGrid size={18} />
            <span>{showLevelGrid ? 'סגור מפת שלבים' : 'מפת 200 השלבים'}</span>
          </button>
        </div>
      </div>

      {/* Tiers Navigation */}
      <div className="tiers-tabs-bar">
        {[
          { tier: 1 as const, name: 'שלב 1: יסודות (1-50)' },
          { tier: 2 as const, name: 'שלב 2: ביניים (51-100)' },
          { tier: 3 as const, name: 'שלב 3: מתקדם (101-150)' },
          { tier: 4 as const, name: 'שלב 4: מומחה (151-200)' },
        ].map(t => {
          const tChallenges = ALL_CHALLENGES.filter(c => c.tier === t.tier);
          const tCount = tChallenges.filter(c => completedIds.includes(c.id)).length;
          return (
            <button
              key={t.tier}
              type="button"
              className={`tier-tab-btn ${selectedTier === t.tier ? 'active' : ''}`}
              onClick={() => {
                soundManager.playPop();
                setSelectedTier(t.tier);
              }}
            >
              <div className="tab-title">{t.name}</div>
              <div className="tab-progress">
                <div
                  className="tab-progress-bar"
                  style={{ width: `${(tCount / 50) * 100}%` }}
                />
                <span>{tCount}/50 הושלמו</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Level Grid Browser Modal/Panel */}
      {showLevelGrid && (
        <div className="levels-grid-panel">
          <div className="panel-header">
            <h3>בחר שלב מתוך {selectedTier === 1 ? '1-50' : selectedTier === 2 ? '51-100' : selectedTier === 3 ? '101-150' : '151-200'}:</h3>
            <span className="panel-stats">{tierCompletedCount}/50 נפתרו</span>
          </div>
          <div className="levels-number-grid">
            {tierChallenges.map(c => {
              const done = completedIds.includes(c.id);
              const isCurrent = c.id === activeChallengeId;
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`level-grid-cell ${done ? 'done' : ''} ${isCurrent ? 'active-level' : ''}`}
                  onClick={() => handleSelectLevel(c.id)}
                >
                  <span className="level-num">{c.id}</span>
                  {done ? <Star size={12} className="cell-star" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Challenge Card */}
      <div className="challenge-card main-prompt-card">
        {/* Navigation / Stage Tag Row */}
        <div className="card-top-row">
          <div className="nav-level-group">
            <button
              type="button"
              className="level-arrow-btn"
              onClick={handleNextChallenge}
              title="שלב הבא"
            >
              <ArrowRight size={16} />
            </button>
            <span className="question-tag">
              שלב {currentChallenge.id} מתוך 200
              {isCurrentCompleted && <Star size={16} className="tag-star" />}
            </span>                        <button
              type="button"
              className="level-arrow-btn"
              onClick={handlePrevChallenge}
              title="שלב קודם"
            >
              <ArrowLeft size={16} />
            </button>

          </div>

          <div className="strikes-indicator">
            <span className="strikes-label">ניסיונות:</span>
            <div className="strikes-dots">
              {[0, 1, 2].map(idx => (
                <div
                  key={idx}
                  className={`strike-dot ${idx < mistakesCount ? 'filled' : ''}`}
                />
              ))}
            </div>
            <span className="strikes-count">({mistakesCount}/3)</span>
          </div>
        </div>

        {/* Challenge Math Problem Area */}
        <div className="question-display-area">
          <div className="direction-badge-row">
            <span className="mode-badge-label">
              {direction === 'improper_to_mixed'
                ? '🔀 המר משבר מדומה למספר מעורב'
                : '🔄 המר ממספר מעורב לשבר מדומה:'}
            </span>
          </div>

          <div className="math-question-box">
            {direction === 'improper_to_mixed' ? (
              <div className="big-fraction-card">
                <span className="num">{improper.numerator}</span>
                <span className="bar" />
                <span className="den">{improper.denominator}</span>
              </div>
            ) : (
              <div className="big-mixed-card">
                <span className="whole">{mixed.whole}</span>
                <div className="frac-part">
                  <span className="num">{mixed.numerator}</span>
                  <span className="bar" />
                  <span className="den">{mixed.denominator}</span>
                </div>
              </div>
            )}

            <div className="convert-symbol">➔</div>

            <div
              className={`input-target-area ${isHighlightingAnswer ? 'highlight-applied' : ''}`}
              ref={inputTargetRef}
            >
              <FractionInput
                direction={direction}
                answer={answer}
                onChange={setAnswer}
                onSubmit={handleSubmit}
                disabled={feedback.type === 'correct'}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="question-buttons-row">
            {feedback.type !== 'correct' ? (
              <button
                type="button"
                className="btn-primary-action submit-btn"
                onClick={handleSubmit}
              >
                <CheckCircle2 size={20} />
                <span>בדוק תשובה</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary-action next-btn"
                onClick={handleNextChallenge}
              >
                <span>עבור לשלב הבא</span>
                <ArrowRight size={20} />
              </button>
            )}

            <button
              type="button"
              className="btn-secondary-action help-toggle-btn"
              onClick={() => setShowVisualHelper(prev => !prev)}
            >
              {showVisualHelper ? <EyeOff size={18} /> : <Eye size={18} />}
              <span>{showVisualHelper ? 'הסתר עזר גרפי' : 'עזר גרפי (עיגולים / מלבנים)'}</span>
            </button>

            <button
              type="button"
              className="btn-secondary-action explain-btn"
              onClick={() => setShowExplanation(true)}
              title="הצג הסבר מלא"
            >
              <Lightbulb size={18} />
              <span>הסבר</span>
            </button>
          </div>

          {/* Feedback message */}
          {feedback.message && (
            <div className={`feedback-alert ${feedback.type}`}>
              {feedback.type === 'correct' ? (
                <CheckCircle2 size={22} className="alert-icon" />
              ) : (
                <AlertCircle size={22} className="alert-icon" />
              )}
              <div className="alert-content">
                <span className="alert-text">{feedback.message}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visual Helper */}
      {showVisualHelper && (
        <div className="visual-helper-wrapper">
          <div className="helper-header">
            <div className="helper-badge">
              <Lightbulb size={16} />
              <span>עזר גרפי לשלב {currentChallenge.id}</span>
            </div>
            <p>
              המכנה הוא <strong>{improper.denominator}</strong>. לחץ על חלקים כדי לצבוע{' '}
              <strong>{improper.numerator}</strong> חלקים, ובדוק כמה שלמים ושארית נוצרו!
            </p>
          </div>
          <ManipulativeWorkspace
            initialWholes={Math.max(2, Math.ceil(improper.numerator / improper.denominator))}
            initialDenominator={improper.denominator}
            targetNumerator={improper.numerator}
            targetDenominator={improper.denominator}
            onApplyToAnswer={handleApplyFromVisual}
            title={`עזר גרפי אינטראקטיבי לשלב #${currentChallenge.id}`}
          />
        </div>
      )}

      {/* 3-Strikes Explanation Modal */}
      <ExplanationModal
        challenge={currentChallenge}
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
        isThirdStrike={mistakesCount >= 3}
      />
    </div>
  );
};

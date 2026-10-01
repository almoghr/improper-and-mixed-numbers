import React, { useState, useRef } from 'react';
import type { Challenge, ChallengeDirection, StudentAnswer } from '../types';
import { FractionInput } from '../components/FractionInput';
import { ManipulativeWorkspace } from '../components/manipulatives/ManipulativeWorkspace';
import { ExplanationModal } from '../components/ExplanationModal';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Flame,
} from 'lucide-react';

interface PracticeModeProps {
  direction: ChallengeDirection;
  challenges: Challenge[];
  title: string;
  subtitle: string;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({
  direction,
  challenges,
  title,
  subtitle,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentChallenge = challenges[currentIndex % challenges.length];

  const [answer, setAnswer] = useState<StudentAnswer>({});
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [feedback, setFeedback] = useState<{
    type: 'correct' | 'wrong' | null;
    message: string;
  }>({ type: null, message: '' });

  const [showExplanation, setShowExplanation] = useState(false);
  const [showVisualHelper, setShowVisualHelper] = useState(false);
  const [streak, setStreak] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);

  // Validate answer against challenge
  const handleSubmit = () => {
    const { improper, mixed } = currentChallenge;

    let isCorrect = false;

    if (direction === 'improper_to_mixed') {
      const userWhole = Number(answer.whole);
      const userNum = Number(answer.numerator);
      const userDenom = Number(answer.denominator);

      // Check if user entered exact matching mixed number
      const isExactMatch =
        userWhole === mixed.whole &&
        userNum === mixed.numerator &&
        userDenom === mixed.denominator;

      // Also check mathematically equivalent fraction if reduced
      const isEquivFraction =
        userWhole === mixed.whole &&
        userNum > 0 &&
        userDenom > 0 &&
        userNum * mixed.denominator === mixed.numerator * userDenom;

      isCorrect = isExactMatch || isEquivFraction;
    } else {
      // mixed_to_improper
      const userNum = Number(answer.numerator);
      const userDenom = Number(answer.denominator);

      const isExactMatch =
        userNum === improper.numerator && userDenom === improper.denominator;

      const isEquivFraction =
        userNum > 0 &&
        userDenom > 0 &&
        userNum * improper.denominator === improper.numerator * userDenom;

      isCorrect = isExactMatch || isEquivFraction;
    }

    if (isCorrect) {
      soundManager.playSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
      setStreak(prev => prev + 1);
      setSolvedCount(prev => prev + 1);
      setFeedback({
        type: 'correct',
        message: 'מצוין! תשובה נכונה ומדויקת! 🌟',
      });
    } else {
      const newMistakes = mistakesCount + 1;
      setMistakesCount(newMistakes);
      setStreak(0);
      soundManager.playError();

      if (newMistakes >= 3) {
        // Strike 3: Show answer & explanation modal
        setShowExplanation(true);
        setFeedback({
          type: 'wrong',
          message: 'הגעת ל-3 ניסיונות! בוא נלמד יחד את הדרך המדויקת בחלון ההסבר.',
        });
      } else if (newMistakes === 1) {
        // Strike 1: Hint 1
        setFeedback({
          type: 'wrong',
          message: `רמז ראשון: ${currentChallenge.hint1}`,
        });
      } else if (newMistakes === 2) {
        // Strike 2: Hint 2 + encourage visual helper
        setShowVisualHelper(true);
        setFeedback({
          type: 'wrong',
          message: `רמז שני: ${currentChallenge.hint2}`,
        });
      }
    }
  };

  // Next question
  const handleNext = () => {
    soundManager.playPop();
    setCurrentIndex(prev => prev + 1);
    setAnswer({});
    setMistakesCount(0);
    setFeedback({ type: null, message: '' });
    setShowExplanation(false);
  };

  const [isHighlightingAnswer, setIsHighlightingAnswer] = useState(false);
  const inputTargetRef = useRef<HTMLDivElement>(null);

  // Apply visual helper result to answer
  const handleApplyFromVisual = (w: number, num: number, den: number) => {
    if (direction === 'improper_to_mixed') {
      setAnswer({ whole: w, numerator: num, denominator: den });
    } else {
      const totalNum = w * den + num;
      setAnswer({ numerator: totalNum, denominator: den });
    }

    setIsHighlightingAnswer(true);
    setTimeout(() => setIsHighlightingAnswer(false), 1500);

    // Smoothly scroll to the answer area and focus the input
    setTimeout(() => {
      inputTargetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const firstInput = inputTargetRef.current?.querySelector('input');
      if (firstInput) {
        firstInput.focus();
      }
    }, 50);
  };

  const { improper, mixed } = currentChallenge;

  return (
    <div className="mode-container practice-container">
      {/* Top Banner */}
      <div className="practice-header">
        <div className="header-info">
          <div className="badge-pill blue">
            <span>אימון ממוקד</span>
          </div>
          <h2 className="mode-headline">{title}</h2>
          <p className="mode-subtext">{subtitle}</p>
        </div>

        <div className="header-stats">
          <div className="stat-chip streak-chip">
            <Flame size={18} className="flame-icon" />
            <span>רצף: {streak}</span>
          </div>
          <div className="stat-chip">
            <span>נפתרו: {solvedCount}</span>
          </div>
        </div>
      </div>

      {/* Main Challenge Card */}
      <div className="challenge-card main-prompt-card">
        {/* Challenge Prompt Header */}
        <div className="card-top-row">
          <span className="question-tag">תרגיל #{currentIndex + 1}</span>

          {/* Strikes Tracker */}
          <div className="strikes-indicator">
            <span className="strikes-label">ניסיונות:</span>
            <div className="strikes-dots">
              {[0, 1, 2].map(idx => (
                <div
                  key={idx}
                  className={`strike-dot ${idx < mistakesCount ? 'filled' : ''}`}
                  title={`ניסיון ${idx + 1}`}
                />
              ))}
            </div>
            <span className="strikes-count">({mistakesCount}/3)</span>
          </div>
        </div>

        {/* The Question Math Expression */}
        <div className="question-display-area">
          <div className="prompt-instruction">
            {direction === 'improper_to_mixed'
              ? 'המר את השבר המדומה הבא למספר מעורב'
              : 'המר את המספר המעורב הבא לשבר מדומה:'}
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

            {/* Answer Input Area */}
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
                onClick={handleNext}
              >
                <span>התרגיל הבא</span>
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
              title="הצג הסבר מפורט"
            >
              <Lightbulb size={18} />
              <span>הסבר</span>
            </button>
          </div>

          {/* Feedback & Hint Alerts */}
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

      {/* Visual Manipulative Drawer */}
      {showVisualHelper && (
        <div className="visual-helper-wrapper">
          <div className="helper-header">
            <div className="helper-badge">
              <HelpCircle size={16} />
              <span>המחשה אינטראקטיבית לתרגיל זה</span>
            </div>
            <p>
              המכנה בתרגיל הוא <strong>{improper.denominator}</strong>. הוסף שלמים, צבע{' '}
              <strong>{improper.numerator}</strong> חלקים, ובדוק כמה שלמים ושארית קיבלת!
            </p>
          </div>
          <ManipulativeWorkspace
            initialWholes={Math.max(2, Math.ceil(improper.numerator / improper.denominator))}
            initialDenominator={improper.denominator}
            targetNumerator={improper.numerator}
            targetDenominator={improper.denominator}
            onApplyToAnswer={handleApplyFromVisual}
            title="עזר גרפי אינטראקטיבי"
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

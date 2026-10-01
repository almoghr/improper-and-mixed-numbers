import React, { useState, useEffect, useRef } from 'react';
import { getRandomChallenge, loadUserStats, saveHighScore } from '../utils/challenges';
import type { Challenge, StudentAnswer } from '../types';
import { FractionInput } from '../components/FractionInput';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Timer,
  Zap,
  RotateCcw,
  Flame,
  Award,
  CheckCircle2,
  XCircle,
  Play,
} from 'lucide-react';

export const Timed60Mode: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge>(() => getRandomChallenge(1));
  const [answer, setAnswer] = useState<StudentAnswer>({});
  const [gameEnded, setGameEnded] = useState<boolean>(false);

  const [history, setHistory] = useState<{
    challenge: Challenge;
    isCorrect: boolean;
  }[]>([]);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const stats = loadUserStats();
    setHighScore(stats.highScore60s || 0);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = window.setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isPlaying && timeLeft === 0) {
      // Game over
      setIsPlaying(false);
      setGameEnded(true);
      soundManager.playFanfare();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
      const newHigh = saveHighScore(score);
      setHighScore(newHigh);
    }

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [isPlaying, timeLeft, score]);

  const handleStartGame = () => {
    soundManager.playPop();
    setTimeLeft(60);
    setScore(0);
    setStreak(0);
    setHistory([]);
    setGameEnded(false);
    setCurrentChallenge(getRandomChallenge(1));
    setAnswer({});
    setIsPlaying(true);
  };

  const handleCheckAnswer = () => {
    if (!isPlaying) return;

    const { direction, improper, mixed } = currentChallenge;
    let isCorrect = false;

    if (direction === 'improper_to_mixed') {
      const uWhole = Number(answer.whole);
      const uNum = Number(answer.numerator);
      const uDen = Number(answer.denominator);

      isCorrect =
        (uWhole === mixed.whole && uNum === mixed.numerator && uDen === mixed.denominator) ||
        (uWhole === mixed.whole && uNum > 0 && uDen > 0 && uNum * mixed.denominator === mixed.numerator * uDen);
    } else {
      const uNum = Number(answer.numerator);
      const uDen = Number(answer.denominator);

      isCorrect =
        (uNum === improper.numerator && uDen === improper.denominator) ||
        (uNum > 0 && uDen > 0 && uNum * improper.denominator === improper.numerator * uDen);
    }

    // Record history
    setHistory(prev => [...prev, { challenge: currentChallenge, isCorrect }]);

    if (isCorrect) {
      soundManager.playSuccess();
      const currentMultiplier = streak >= 6 ? 4 : streak >= 4 ? 3 : streak >= 2 ? 2 : 1;
      const pointsEarned = 10 * currentMultiplier;
      setScore(prev => prev + pointsEarned);
      const nextStreak = streak + 1;
      setStreak(nextStreak);

      if (nextStreak % 3 === 0) {
        soundManager.playStreak(Math.min(4, Math.floor(nextStreak / 3)));
      }
    } else {
      soundManager.playError();
      setStreak(0);
    }

    // Pick next challenge
    // Adjust tier based on score
    const targetTier = score > 150 ? 4 : score > 100 ? 3 : score > 50 ? 2 : 1;
    setCurrentChallenge(getRandomChallenge(targetTier));
    setAnswer({});
  };

  const multiplier = streak >= 6 ? 4 : streak >= 4 ? 3 : streak >= 2 ? 2 : 1;
  const timerPercent = (timeLeft / 60) * 100;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * timerPercent) / 100;

  return (
    <div className="mode-container timed-container">
      {/* Header */}
      <div className="timed-header-card">
        <div className="header-info">
          <div className="badge-pill orange">
            <Zap size={16} />
            <span>אתגר מהירות 60 שניות</span>
          </div>
          <h2 className="mode-headline">בליץ שברים: כמה תצליח בדקה?</h2>
          <p className="mode-subtext">
            שאלות מתחלפות משני הכיוונים! ענה מהר, בנה רצף תשובות נכונות והכפל את הנקודות שלך.
          </p>
        </div>

        <div className="header-stats">
          <div className="stat-chip high-score-chip">
            <Award size={18} className="award-icon" />
            <span>שיא אישי: {highScore} נק׳</span>
          </div>
        </div>
      </div>

      {!isPlaying && !gameEnded ? (
        /* Start Screen */
        <div className="start-game-screen card">
          <div className="start-icon-ring">
            <Timer size={48} className="pulse-icon" />
          </div>
          <h3>מוכן לאתגר?</h3>
          <p>
            יש לך 60 שניות לענות על כמה שיותר שאלות המרה בין שברים מדומים ומספרים מעורבים.
            <br />
            רצף תשובות נכונות מכפיל את הניקוד עד פי 4!
          </p>
          <button type="button" className="btn-primary-action start-btn" onClick={handleStartGame}>
            <Play size={22} />
            <span>התחל אתגר 60 שניות!</span>
          </button>
        </div>
      ) : gameEnded ? (
        /* Results Screen */
        <div className="game-over-card card">
          <div className="results-header">
            <Award size={48} className="trophy-gold" />
            <h3>הזמן נגמר! כל הכבוד!</h3>
            <div className="final-score-display">
              <span className="score-val">{score}</span>
              <span className="score-label">נקודות</span>
            </div>
            {score >= highScore && score > 0 && (
              <div className="new-record-badge">🎉 שיא חדש! מדהים! 🎉</div>
            )}
          </div>

          <div className="results-metrics">
            <div className="metric-box">
              <span className="metric-title">תרגילים שנפתרו</span>
              <span className="metric-val">{history.length}</span>
            </div>
            <div className="metric-box">
              <span className="metric-title">תשובות נכונות</span>
              <span className="metric-val correct">
                {history.filter(h => h.isCorrect).length}
              </span>
            </div>
            <div className="metric-box">
              <span className="metric-title">דיוק</span>
              <span className="metric-val">
                {history.length > 0
                  ? Math.round(
                    (history.filter(h => h.isCorrect).length / history.length) * 100
                  )
                  : 0}
                %
              </span>
            </div>
          </div>

          <div className="results-actions">
            <button
              type="button"
              className="btn-primary-action retry-btn"
              onClick={handleStartGame}
            >
              <RotateCcw size={20} />
              <span>שחק שוב</span>
            </button>
          </div>
        </div>
      ) : (
        /* Live Game Screen */
        <div className="live-game-wrapper">
          {/* Game Status Bar */}
          <div className="live-status-bar">
            {/* Circular Timer Ring */}
            <div className="timer-ring-box">
              <svg width="90" height="90" viewBox="0 0 90 90">
                <circle
                  cx="45"
                  cy="45"
                  r={radius}
                  className="timer-track"
                />
                <circle
                  cx="45"
                  cy="45"
                  r={radius}
                  className="timer-progress"
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: strokeDashoffset,
                    stroke: timeLeft <= 10 ? '#ef4444' : '#f59e0b',
                  }}
                />
              </svg>
              <div className="timer-countdown">
                <span className={`time-number ${timeLeft <= 10 ? 'urgent' : ''}`}>
                  {timeLeft}
                </span>
                <span className="time-unit">שנ׳</span>
              </div>
            </div>

            {/* Score & Multiplier */}
            <div className="live-score-cluster">
              <div className="live-score-box">
                <span className="label">ניקוד</span>
                <span className="score-num">{score}</span>
              </div>

              <div className={`multiplier-box mult-x${multiplier}`}>
                <Flame size={16} />
                <span>בונוס ×{multiplier}</span>
              </div>
            </div>
          </div>

          {/* Question Box */}
          <div className="challenge-card timed-question-card">
            <div className="direction-badge-row">
              <span className="mode-badge-label">
                {currentChallenge.direction === 'improper_to_mixed'
                  ? '🔀 שבר מדומה ➔ מספר מעורב'
                  : '🔄 מספר מעורב ➔ שבר מדומה'}
              </span>
            </div>

            <div className="math-question-box">
              {currentChallenge.direction === 'improper_to_mixed' ? (
                <div className="big-fraction-card">
                  <span className="num">{currentChallenge.improper.numerator}</span>
                  <span className="bar" />
                  <span className="den">{currentChallenge.improper.denominator}</span>
                </div>
              ) : (
                <div className="big-mixed-card">
                  <span className="whole">{currentChallenge.mixed.whole}</span>
                  <div className="frac-part">
                    <span className="num">{currentChallenge.mixed.numerator}</span>
                    <span className="bar" />
                    <span className="den">{currentChallenge.mixed.denominator}</span>
                  </div>
                </div>
              )}

              <div className="convert-symbol">➔</div>

              <div className="input-target-area">
                <FractionInput
                  direction={currentChallenge.direction}
                  answer={answer}
                  onChange={setAnswer}
                  onSubmit={handleCheckAnswer}
                />
              </div>
            </div>

            <div className="question-buttons-row">
              <button
                type="button"
                className="btn-primary-action submit-btn"
                onClick={handleCheckAnswer}
              >
                <CheckCircle2 size={20} />
                <span>שלח תשובה (Enter)</span>
              </button>
            </div>
          </div>

          {/* Mini Recent History Dots */}
          <div className="live-dots-bar">
            {history.slice(-8).map((h, i) => (
              <div
                key={i}
                className={`history-dot ${h.isCorrect ? 'correct' : 'wrong'}`}
                title={h.isCorrect ? 'נכון' : 'טעות'}
              >
                {h.isCorrect ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

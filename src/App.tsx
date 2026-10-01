import React, { useState } from 'react';
import type { GameMode } from './types';
import { IMPROPER_TO_MIXED_CHALLENGES, MIXED_TO_IMPROPER_CHALLENGES } from './utils/challenges';
import { soundManager } from './utils/audio';
import { SandboxMode } from './modes/SandboxMode';
import { PracticeMode } from './modes/PracticeMode';
import { Challenge200Mode } from './modes/Challenge200Mode';
import { Timed60Mode } from './modes/Timed60Mode';
import {
  Sparkles,
  ArrowRightLeft,
  RefreshCw,
  Trophy,
  Timer,
  Volume2,
  VolumeX,
} from 'lucide-react';
import './App.css';

export const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<GameMode>('improper_to_mixed');
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.isMuted());

  const handleToggleSound = () => {
    const nextMuted = soundManager.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      soundManager.playPop();
    }
  };

  const handleSelectMode = (mode: GameMode) => {
    soundManager.playPop();
    setCurrentMode(mode);
  };

  return (
    <div className="app-root">
      {/* Top Application Header */}
      <header className="app-navbar">
        <div className="nav-container">
          <div className="brand-group">
            <div className="brand-icon">
              <svg width="34" height="34" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="#6366f1" />
                <path d="M50 14 A36 36 0 0 1 86 50 L50 50 Z" fill="#f59e0b" />
                <path d="M50 50 L86 50 A36 36 0 1 1 50 14 Z" fill="#ec4899" />
                <circle cx="50" cy="50" r="14" fill="#ffffff" />
              </svg>
            </div>
            <div className="brand-text">
              <h1 className="brand-title">מעבדת השברים</h1>
              <span className="brand-tagline">שבר מדומה ומספר מעורב</span>
            </div>
          </div>

          <div className="nav-actions">
            <button
              type="button"
              className={`sound-toggle-btn ${isMuted ? 'muted' : ''}`}
              onClick={handleToggleSound}
              title={isMuted ? 'הפעל צלילים' : 'השתק צלילים'}
              aria-label="בקרת צליל"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
        </div>

        {/* Game Mode Navigation Tabs */}
        <nav className="mode-nav-bar" aria-label="מצבי משחק">
          <button
            type="button"
            className={`mode-tab ${currentMode === 'improper_to_mixed' ? 'active' : ''}`}
            onClick={() => handleSelectMode('improper_to_mixed')}
          >
            <ArrowRightLeft size={18} />
            <span>שבר מדומה ➔ מעורב</span>
          </button>

          <button
            type="button"
            className={`mode-tab ${currentMode === 'mixed_to_improper' ? 'active' : ''}`}
            onClick={() => handleSelectMode('mixed_to_improper')}
          >
            <RefreshCw size={18} />
            <span>מספר מעורב ➔ מדומה</span>
          </button>

          <button
            type="button"
            className={`mode-tab highlight-gold ${currentMode === 'challenge_200' ? 'active' : ''}`}
            onClick={() => handleSelectMode('challenge_200')}
          >
            <Trophy size={18} />
            <span>200 האתגרים (מעורב)</span>
          </button>

          <button
            type="button"
            className={`mode-tab highlight-orange ${currentMode === 'timed_60' ? 'active' : ''}`}
            onClick={() => handleSelectMode('timed_60')}
          >
            <Timer size={18} />
            <span>אתגר 60 שניות</span>
          </button>

          <button
            type="button"
            className={`mode-tab highlight-purple ${currentMode === 'sandbox' ? 'active' : ''}`}
            onClick={() => handleSelectMode('sandbox')}
          >
            <Sparkles size={18} />
            <span>מעבדה חופשית (סנדבוקס)</span>
          </button>
        </nav>
      </header>

      {/* Main Mode Viewport */}
      <main className="main-content">
        {currentMode === 'improper_to_mixed' && (
          <PracticeMode
            direction="improper_to_mixed"
            challenges={IMPROPER_TO_MIXED_CHALLENGES}
            title="משבר מדומה למספר מעורב"
            subtitle="תרגול ממוקד: נתון שבר מדומה (למשל 8/6), מצא כמה שלמים ואיזה שבר נשאר (1 ו-2/6). אם תטעה 3 פעמים, נפתח לך הסבר והמחשה!"
          />
        )}

        {currentMode === 'mixed_to_improper' && (
          <PracticeMode
            direction="mixed_to_improper"
            challenges={MIXED_TO_IMPROPER_CHALLENGES}
            title="ממספר מעורב לשבר מדומה"
            subtitle="תרגול ממוקד: נתון מספר מעורב (למשל 1 ו-2/6), מצא כמה חלקים יש בסך הכל (8/6). ניתן לפתוח עזר גרפי בכל רגע!"
          />
        )}

        {currentMode === 'challenge_200' && <Challenge200Mode />}

        {currentMode === 'timed_60' && <Timed60Mode />}

        {currentMode === 'sandbox' && <SandboxMode />}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          מעבדת השברים האינטראקטיבית • מותאם ללימוד ותרגול עצמי בכיתה ובבית • קובץ עצמאי ללא תלות ברשת
        </p>
      </footer>
    </div>
  );
};

export default App;

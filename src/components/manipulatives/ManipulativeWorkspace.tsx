import React, { useState, useEffect } from 'react';
import type { ShapeType } from '../../types';
import { CircleManipulative } from './CircleManipulative';
import { RectangleManipulative } from './RectangleManipulative';
import { soundManager } from '../../utils/audio';
import { Circle, Square, Plus, Minus, RotateCcw, Check, Sparkles } from 'lucide-react';

interface ManipulativeWorkspaceProps {
  initialWholes?: number;
  initialDenominator?: number;
  targetNumerator?: number;
  targetDenominator?: number;
  onApplyToAnswer?: (whole: number, numerator: number, denominator: number) => void;
  title?: string;
  allowShapeToggle?: boolean;
}

export const ManipulativeWorkspace: React.FC<ManipulativeWorkspaceProps> = ({
  initialWholes = 2,
  initialDenominator = 6,
  targetNumerator,
  targetDenominator,
  onApplyToAnswer,
  title = 'מעבדת המחשה: עיגולים ומלבנים',
  allowShapeToggle = true,
}) => {
  const [shape, setShape] = useState<ShapeType>('circle');
  const [numWholes, setNumWholes] = useState<number>(initialWholes);
  const [denominator, setDenominator] = useState<number>(targetDenominator || initialDenominator);

  // Slices state: array of wholes, each an array of booleans of length `denominator`
  const [wholesData, setWholesData] = useState<boolean[][]>(() => {
    return Array.from({ length: initialWholes }, () => Array(initialDenominator).fill(false));
  });

  // Sync if targetDenominator changes from problem
  useEffect(() => {
    if (targetDenominator && targetDenominator !== denominator) {
      setDenominator(targetDenominator);
      setWholesData(prev =>
        Array.from({ length: prev.length }, () => Array(targetDenominator).fill(false))
      );
    }
  }, [targetDenominator]);

  // Adjust wholes count
  const handleAddWhole = () => {
    if (numWholes >= 8) return;
    soundManager.playPop();
    const next = numWholes + 1;
    setNumWholes(next);
    setWholesData(prev => [...prev, Array(denominator).fill(false)]);
  };

  const handleRemoveWhole = () => {
    if (numWholes <= 1) return;
    soundManager.playPop();
    const next = numWholes - 1;
    setNumWholes(next);
    setWholesData(prev => prev.slice(0, next));
  };

  // Adjust denominator
  const handleSetDenominator = (newDenom: number) => {
    if (newDenom < 2 || newDenom > 16) return;
    soundManager.playPop();
    setDenominator(newDenom);
    // Keep total filled pieces count approximately or rebuild
    const totalFilled = wholesData.reduce((acc, curr) => acc + curr.filter(Boolean).length, 0);
    const newWholes = Array.from({ length: numWholes }, () => Array(newDenom).fill(false));
    let remaining = totalFilled;
    for (let w = 0; w < numWholes; w++) {
      for (let s = 0; s < newDenom; s++) {
        if (remaining > 0) {
          newWholes[w][s] = true;
          remaining--;
        }
      }
    }
    setWholesData(newWholes);
  };

  // Toggle single slice
  const handleToggleSlice = (wholeIndex: number, sliceIndex: number) => {
    setWholesData(prev => {
      const next = prev.map(w => [...w]);
      if (next[wholeIndex]) {
        next[wholeIndex][sliceIndex] = !next[wholeIndex][sliceIndex];
      }
      return next;
    });
  };

  // Fill entire whole
  const handleFillWhole = (wholeIndex: number) => {
    setWholesData(prev => {
      const next = prev.map(w => [...w]);
      if (next[wholeIndex]) {
        next[wholeIndex] = Array(denominator).fill(true);
      }
      return next;
    });
  };

  // Clear single whole
  const handleClearWhole = (wholeIndex: number) => {
    setWholesData(prev => {
      const next = prev.map(w => [...w]);
      if (next[wholeIndex]) {
        next[wholeIndex] = Array(denominator).fill(false);
      }
      return next;
    });
  };

  // Clear all wholes
  const handleClearAll = () => {
    soundManager.playPop();
    setWholesData(Array.from({ length: numWholes }, () => Array(denominator).fill(false)));
  };

  // Quick fill up to target pieces (e.g. 8 pieces for 8/6)
  const handleFillCount = (countToFill: number) => {
    soundManager.playPop();
    const neededWholes = Math.max(1, Math.ceil(countToFill / denominator));
    const targetWholeCount = Math.max(numWholes, Math.min(8, neededWholes));
    setNumWholes(targetWholeCount);

    const newWholes = Array.from({ length: targetWholeCount }, () => Array(denominator).fill(false));
    let filled = 0;
    for (let w = 0; w < targetWholeCount; w++) {
      for (let s = 0; s < denominator; s++) {
        if (filled < countToFill) {
          newWholes[w][s] = true;
          filled++;
        }
      }
    }
    setWholesData(newWholes);
  };

  // Calculate live numbers
  const totalFilled = wholesData.reduce((acc, curr) => acc + curr.filter(Boolean).length, 0);
  const fullWholesCount = Math.floor(totalFilled / denominator);
  const remainderCount = totalFilled % denominator;

  return (
    <div className="manipulative-workspace">
      {/* Workspace Top Toolbar */}
      <div className="workspace-toolbar">
        <div className="toolbar-header">
          <h3 className="workspace-title">{title}</h3>
          {allowShapeToggle && (
            <div className="shape-switcher" role="group" aria-label="בחירת צורה">
              <button
                type="button"
                className={`switcher-btn ${shape === 'circle' ? 'active' : ''}`}
                onClick={() => {
                  soundManager.playPop();
                  setShape('circle');
                }}
              >
                <Circle size={16} />
                <span>עיגולים (פיצה)</span>
              </button>
              <button
                type="button"
                className={`switcher-btn ${shape === 'rectangle' ? 'active' : ''}`}
                onClick={() => {
                  soundManager.playPop();
                  setShape('rectangle');
                }}
              >
                <Square size={16} />
                <span>מלבנים (פסים)</span>
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Controls Bar */}
        <div className="controls-grid">
          {/* Wholes Stepper */}
          <div className="control-item">
            <span className="control-label">מספר שלמים:</span>
            <div className="stepper-group">
              <button
                type="button"
                className="step-btn"
                onClick={handleRemoveWhole}
                disabled={numWholes <= 1}
                title="הסר שלם"
              >
                <Minus size={15} />
              </button>
              <span className="step-val">{numWholes}</span>
              <button
                type="button"
                className="step-btn"
                onClick={handleAddWhole}
                disabled={numWholes >= 8}
                title="הוסף שלם נוסף"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          {/* Denominator Stepper */}
          <div className="control-item">
            <span className="control-label">חלוקה לשלם (מכנה):</span>
            <div className="stepper-group">
              <button
                type="button"
                className="step-btn"
                onClick={() => handleSetDenominator(denominator - 1)}
                disabled={denominator <= 2}
                title="פחות חלקים"
              >
                <Minus size={15} />
              </button>
              <span className="step-val highlight">{denominator}</span>
              <button
                type="button"
                className="step-btn"
                onClick={() => handleSetDenominator(denominator + 1)}
                disabled={denominator >= 16}
                title="יותר חלקים"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            {targetNumerator !== undefined && (
              <button
                type="button"
                className="quick-btn target-fill"
                onClick={() => handleFillCount(targetNumerator)}
              >
                <Sparkles size={15} />
                <span>צבע {targetNumerator} חלקים</span>
              </button>
            )}
            <button
              type="button"
              className="quick-btn reset-btn"
              onClick={handleClearAll}
              title="נקה את כל החלקים"
            >
              <RotateCcw size={15} />
              <span>נקה הכל</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Educational Status / Readout */}
      <div className="manipulative-summary-banner">
        <div className="summary-col">
          <span className="summary-title">חלקים צבועים</span>
          <span className="summary-number">{totalFilled}</span>
        </div>
        <div className="summary-divider">=</div>
        <div className="summary-col highlight-box">
          <span className="summary-title">שבר מדומה</span>
          <div className="fraction-display-inline">
            <span className="f-num">{totalFilled}</span>
            <span className="f-bar">/</span>
            <span className="f-denom">{denominator}</span>
          </div>
        </div>
        <div className="summary-divider">↔</div>
        <div className="summary-col highlight-box secondary">
          <span className="summary-title">מספר מעורב</span>
          <div className="mixed-display-inline">
            <span className="m-whole">{fullWholesCount}</span>
            <span className="m-fraction">
              <sup>{remainderCount}</sup>/<sub>{denominator}</sub>
            </span>
          </div>
        </div>

        {onApplyToAnswer && (
          <button
            type="button"
            className="apply-answer-btn"
            onClick={() => {
              soundManager.playPop();
              onApplyToAnswer(fullWholesCount, remainderCount, denominator);
            }}
          >
            <Check size={16} />
            <span>השתמש בתוצאה כתשובה</span>
          </button>
        )}
      </div>

      {/* Shapes Canvas Grid */}
      <div className="shapes-grid">
        {wholesData.map((slices, idx) => {
          if (shape === 'circle') {
            return (
              <CircleManipulative
                key={idx}
                wholeIndex={idx}
                denominator={denominator}
                slices={slices}
                onToggleSlice={handleToggleSlice}
                onFillWhole={handleFillWhole}
                onClearWhole={handleClearWhole}
              />
            );
          }
          return (
            <RectangleManipulative
              key={idx}
              wholeIndex={idx}
              denominator={denominator}
              slices={slices}
              onToggleSlice={handleToggleSlice}
              onFillWhole={handleFillWhole}
              onClearWhole={handleClearWhole}
            />
          );
        })}
      </div>
    </div>
  );
};

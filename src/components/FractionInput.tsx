import React, { useRef } from 'react';
import type { ChallengeDirection, StudentAnswer } from '../types';

interface FractionInputProps {
  direction: ChallengeDirection;
  answer: StudentAnswer;
  onChange: (updated: StudentAnswer) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export const FractionInput: React.FC<FractionInputProps> = ({
  direction,
  answer,
  onChange,
  onSubmit,
  disabled = false,
}) => {
  const wholeRef = useRef<HTMLInputElement>(null);
  const numRef = useRef<HTMLInputElement>(null);
  const denomRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  if (direction === 'improper_to_mixed') {
    // Student needs to enter Mixed Number: Whole + Numerator / Denominator
    return (
      <div className="fraction-input-container mixed-input-mode">
        <div className="input-group-label">הקלד מספר מעורב</div>
        <div className="mixed-input-box">
          {/* Whole number input */}
          <div className="input-field-wrapper whole-wrapper">
            <input
              ref={wholeRef}
              type="number"
              inputMode="numeric"
              min="0"
              max="99"
              placeholder="שלם"
              value={answer.whole ?? ''}
              disabled={disabled}
              onChange={e => onChange({ ...answer, whole: e.target.value })}
              onKeyDown={handleKeyDown}
              className="number-input whole-input"
              aria-label="מספר שלמים"
            />
            <span className="field-hint">שלמים</span>
          </div>

          {/* Fraction part: stacked numerator / denominator */}
          <div className="stacked-fraction-input">
            <div className="input-field-wrapper">
              <input
                ref={numRef}
                type="number"
                inputMode="numeric"
                min="0"
                max="99"
                placeholder="מונה"
                value={answer.numerator ?? ''}
                disabled={disabled}
                onChange={e => onChange({ ...answer, numerator: e.target.value })}
                onKeyDown={handleKeyDown}
                className="number-input numerator-input"
                aria-label="מונה"
              />
              <span className="field-hint">מונה</span>
            </div>

            <div className="fraction-divider-line" />

            <div className="input-field-wrapper">
              <input
                ref={denomRef}
                type="number"
                inputMode="numeric"
                min="1"
                max="99"
                placeholder="מכנה"
                value={answer.denominator ?? ''}
                disabled={disabled}
                onChange={e => onChange({ ...answer, denominator: e.target.value })}
                onKeyDown={handleKeyDown}
                className="number-input denominator-input"
                aria-label="מכנה"
              />
              <span className="field-hint">מכנה</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Student needs to enter Improper Fraction: Numerator / Denominator
  return (
    <div className="fraction-input-container improper-input-mode">
      <div className="input-group-label">הקלד שבר מדומה:</div>
      <div className="improper-input-box">
        <div className="stacked-fraction-input standalone">
          <div className="input-field-wrapper">
            <input
              ref={numRef}
              type="number"
              inputMode="numeric"
              min="1"
              max="99"
              placeholder="מונה"
              value={answer.numerator ?? ''}
              disabled={disabled}
              onChange={e => onChange({ ...answer, numerator: e.target.value })}
              onKeyDown={handleKeyDown}
              className="number-input numerator-input large"
              aria-label="מונה"
            />
            <span className="field-hint">מונה (סך הכל חלקים)</span>
          </div>

          <div className="fraction-divider-line thick" />

          <div className="input-field-wrapper">
            <input
              ref={denomRef}
              type="number"
              inputMode="numeric"
              min="1"
              max="99"
              placeholder="מכנה"
              value={answer.denominator ?? ''}
              disabled={disabled}
              onChange={e => onChange({ ...answer, denominator: e.target.value })}
              onKeyDown={handleKeyDown}
              className="number-input denominator-input large"
              aria-label="מכנה"
            />
            <span className="field-hint">מכנה (חלקים בכל שלם)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

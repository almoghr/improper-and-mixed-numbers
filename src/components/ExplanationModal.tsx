import React from 'react';
import type { Challenge } from '../types';
import { CircleManipulative } from './manipulatives/CircleManipulative';
import { BookOpen, CheckCircle, ArrowRight, Lightbulb } from 'lucide-react';

interface ExplanationModalProps {
  challenge: Challenge;
  isOpen: boolean;
  onClose: () => void;
  isThirdStrike?: boolean;
}

export const ExplanationModal: React.FC<ExplanationModalProps> = ({
  challenge,
  isOpen,
  onClose,
  isThirdStrike = false,
}) => {
  if (!isOpen) return null;

  const { direction, improper, mixed } = challenge;
  const denominator = improper.denominator;
  const totalNumerator = improper.numerator;
  const whole = mixed.whole;
  const remainder = mixed.numerator;

  // Build the slices preview: whole count = whole + (remainder > 0 ? 1 : 0)
  const previewWholesCount = Math.max(1, Math.ceil(totalNumerator / denominator));
  const previewWholes = Array.from({ length: previewWholesCount }, (_, wIdx) => {
    return Array.from({ length: denominator }, (_, sIdx) => {
      const globalIndex = wIdx * denominator + sIdx;
      return globalIndex < totalNumerator;
    });
  });

  return (
    <div className="modal-backdrop">
      <div className="explanation-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <BookOpen className="header-icon" size={24} />
            <div>
              <h2 className="modal-title">
                {isThirdStrike ? '3 ניסיונות - הנה דרך הפתרון המלאה!' : 'הסבר מפורט ודרך פתרון'}
              </h2>
              <p className="modal-subtitle">
                {direction === 'improper_to_mixed'
                  ? 'איך ממירים משבר מדומה למספר מעורב?'
                  : 'איך ממירים ממספר מעורב לשבר מדומה?'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="סגור חלון הסבר"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="modal-content">
          {/* Target Equation Card */}
          <div className="equation-highlight-card">
            <span className="equation-label">התרגיל:</span>
            <div className="equation-row">
              {direction === 'improper_to_mixed' ? (
                <>
                  <div className="fraction-box large">
                    <span className="f-num">{improper.numerator}</span>
                    <span className="f-line" />
                    <span className="f-den">{improper.denominator}</span>
                  </div>
                  <span className="eq-arrow">➔</span>
                  <div className="mixed-box large highlight">
                    <span className="m-whole">{mixed.whole}</span>
                    <div className="m-frac">
                      <span>{mixed.numerator}</span>
                      <span className="f-line" />
                      <span>{mixed.denominator}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mixed-box large">
                    <span className="m-whole">{mixed.whole}</span>
                    <div className="m-frac">
                      <span>{mixed.numerator}</span>
                      <span className="f-line" />
                      <span>{mixed.denominator}</span>
                    </div>
                  </div>
                  <span className="eq-arrow">➔</span>
                  <div className="fraction-box large highlight">
                    <span className="f-num">{improper.numerator}</span>
                    <span className="f-line" />
                    <span className="f-den">{improper.denominator}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Step-by-Step Breakdown */}
          <div className="steps-container">
            {direction === 'improper_to_mixed' ? (
              <>
                <div className="step-card">
                  <div className="step-number">1</div>
                  <div className="step-body">
                    <h4>חילוק המונה במכנה (מציאת השלמים):</h4>
                    <p>
                      נבדוק כמה פעמים המכנה <strong>{denominator}</strong> נכנס במלואו במונה{' '}
                      <strong>{totalNumerator}</strong>:
                    </p>
                    <div className="math-pill">
                      {totalNumerator} ÷ {denominator} = <strong>{whole}</strong> (שלמים)
                    </div>
                  </div>
                </div>

                <div className="step-card">
                  <div className="step-number">2</div>
                  <div className="step-body">
                    <h4>מציאת השארית (המונה החדש):</h4>
                    <p>
                      כמה חלקים נשארו שלא יצרו שלם שלם?
                    </p>
                    <div className="math-pill">
                      {totalNumerator} - ({whole} × {denominator}) = <strong>{remainder}</strong> (שארית)
                    </div>
                  </div>
                </div>

                <div className="step-card">
                  <div className="step-number">3</div>
                  <div className="step-body">
                    <h4>הרכבת המספר המעורב:</h4>
                    <p>
                      השלם הוא <strong>{whole}</strong>, המונה הוא השארית <strong>{remainder}</strong>, והמכנה נשאר{' '}
                      <strong>{denominator}</strong>:
                    </p>
                    <div className="math-pill highlight">
                      תוצאה: <strong>{whole} ו-{remainder}/{denominator}</strong>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="step-card">
                  <div className="step-number">1</div>
                  <div className="step-body">
                    <h4>כפל השלמים במכנה (כמה חלקים יש בכל השלמים):</h4>
                    <p>
                      בכל שלם יש <strong>{denominator}</strong> חלקים. יש לנו <strong>{whole}</strong> שלמים:
                    </p>
                    <div className="math-pill">
                      {whole} × {denominator} = <strong>{whole * denominator}</strong> חלקים
                    </div>
                  </div>
                </div>

                <div className="step-card">
                  <div className="step-number">2</div>
                  <div className="step-body">
                    <h4>הוספת חלקי השארית (מונה השבר):</h4>
                    <p>
                      נוסיף את <strong>{remainder}</strong> החלקים הנוספים:
                    </p>
                    <div className="math-pill">
                      {whole * denominator} + {remainder} = <strong>{totalNumerator}</strong> חלקים בסך הכל
                    </div>
                  </div>
                </div>

                <div className="step-card">
                  <div className="step-number">3</div>
                  <div className="step-body">
                    <h4>כתיבת השבר המדומה:</h4>
                    <p>
                      המונה החדש הוא <strong>{totalNumerator}</strong>, והמכנה נשאר <strong>{denominator}</strong>:
                    </p>
                    <div className="math-pill highlight">
                      תוצאה: <strong>{totalNumerator}/{denominator}</strong>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Visual Demonstrator */}
          <div className="modal-visual-section">
            <h4 className="visual-title">
              <Lightbulb size={18} />
              המחשה גרפית (כך זה נראה בעיגולים):
            </h4>
            <div className="preview-shapes-row">
              {previewWholes.map((slices, idx) => (
                <CircleManipulative
                  key={idx}
                  wholeIndex={idx}
                  denominator={denominator}
                  slices={slices}
                  onToggleSlice={() => { }}
                  onFillWhole={() => { }}
                  onClearWhole={() => { }}
                  readOnly={true}
                />
              ))}
            </div>
            <p className="visual-note">
              רואים בבירור: {whole} עיגולים שלמים ומלאים + {remainder} חלקים מתוך {denominator} בעיגול האחרון = {totalNumerator} חלקים בסך הכל!
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button type="button" className="understand-btn" onClick={onClose}>
            <CheckCircle size={18} />
            <span>הבנתי, תודה!</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

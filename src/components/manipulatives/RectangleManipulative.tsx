import React from 'react';
import { soundManager } from '../../utils/audio';

interface RectangleManipulativeProps {
  wholeIndex: number;
  denominator: number;
  slices: boolean[];
  onToggleSlice: (wholeIndex: number, sliceIndex: number) => void;
  onFillWhole: (wholeIndex: number) => void;
  onClearWhole: (wholeIndex: number) => void;
  readOnly?: boolean;
}

export const RectangleManipulative: React.FC<RectangleManipulativeProps> = ({
  wholeIndex,
  denominator,
  slices,
  onToggleSlice,
  onFillWhole,
  onClearWhole,
  readOnly = false,
}) => {
  const filledCount = slices.filter(Boolean).length;
  const isFullyFilled = filledCount === denominator;

  return (
    <div className={`manipulative-card rectangle-card ${isFullyFilled ? 'whole-completed' : ''}`}>
      <div className="card-header">
        <span className="whole-tag">שלם #{wholeIndex + 1}</span>
        <span className="fraction-tag">
          {filledCount}/{denominator}
        </span>
      </div>

      <div className="bar-container">
        <div
          className="fraction-bar"
          style={{
            gridTemplateColumns: `repeat(${denominator}, 1fr)`,
          }}
        >
          {Array.from({ length: denominator }).map((_, i) => {
            const isFilled = slices[i] || false;
            return (
              <button
                key={i}
                type="button"
                className={`bar-segment ${isFilled ? 'segment-filled' : 'segment-empty'} ${readOnly ? 'read-only' : 'interactive'}`}
                onClick={() => {
                  if (!readOnly) {
                    soundManager.playPop();
                    onToggleSlice(wholeIndex, i);
                  }
                }}
                disabled={readOnly}
                title={`חלק ${i + 1} מתוך ${denominator}`}
              >
                {denominator <= 12 && (
                  <span className="segment-label">1/{denominator}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {!readOnly && (
        <div className="card-actions">
          <button
            type="button"
            className="action-btn small fill-btn"
            onClick={() => {
              soundManager.playPop();
              onFillWhole(wholeIndex);
            }}
            title="צבע את כל השלם"
          >
            צבע שלם
          </button>
          <button
            type="button"
            className="action-btn small clear-btn"
            onClick={() => {
              soundManager.playPop();
              onClearWhole(wholeIndex);
            }}
            title="רוקן שלם זה"
          >
            נקה
          </button>
        </div>
      )}
    </div>
  );
};

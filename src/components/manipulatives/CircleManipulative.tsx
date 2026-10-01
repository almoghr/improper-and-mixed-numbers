import React from 'react';
import { soundManager } from '../../utils/audio';

interface CircleManipulativeProps {
  wholeIndex: number;
  denominator: number;
  // Array of boolean indicating which slice in this whole is filled (length = denominator)
  slices: boolean[];
  onToggleSlice: (wholeIndex: number, sliceIndex: number) => void;
  onFillWhole: (wholeIndex: number) => void;
  onClearWhole: (wholeIndex: number) => void;
  readOnly?: boolean;
}

export const CircleManipulative: React.FC<CircleManipulativeProps> = ({
  wholeIndex,
  denominator,
  slices,
  onToggleSlice,
  onFillWhole,
  onClearWhole,
  readOnly = false,
}) => {
  const size = 180;
  const center = size / 2;
  const radius = 75;

  const filledCount = slices.filter(Boolean).length;
  const isFullyFilled = filledCount === denominator;

  // Generate SVG path for each slice
  const renderSlices = () => {
    // If denominator is 1 (edge case)
    if (denominator === 1) {
      const isFilled = slices[0];
      return (
        <circle
          cx={center}
          cy={center}
          r={radius}
          className={`slice-path ${isFilled ? 'slice-filled' : 'slice-empty'}`}
          onClick={() => {
            if (!readOnly) {
              soundManager.playPop();
              onToggleSlice(wholeIndex, 0);
            }
          }}
        />
      );
    }

    const sliceAngle = (2 * Math.PI) / denominator;

    return Array.from({ length: denominator }).map((_, i) => {
      const startAngle = i * sliceAngle - Math.PI / 2;
      const endAngle = (i + 1) * sliceAngle - Math.PI / 2;

      const x1 = center + radius * Math.cos(startAngle);
      const y1 = center + radius * Math.sin(startAngle);
      const x2 = center + radius * Math.cos(endAngle);
      const y2 = center + radius * Math.sin(endAngle);

      // largeArcFlag is 0 because denominator >= 2 (angle <= 180 deg)
      const pathD = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

      const isFilled = slices[i] || false;

      // Centroid for slice label
      const midAngle = (startAngle + endAngle) / 2;
      const textRadius = radius * 0.65;
      const tx = center + textRadius * Math.cos(midAngle);
      const ty = center + textRadius * Math.sin(midAngle) + 4; // slight vertical adjust

      return (
        <g key={i} className="slice-group">
          <path
            d={pathD}
            className={`slice-path ${isFilled ? 'slice-filled' : 'slice-empty'} ${readOnly ? 'read-only' : 'interactive'}`}
            onClick={() => {
              if (!readOnly) {
                soundManager.playPop();
                onToggleSlice(wholeIndex, i);
              }
            }}
          >
            <title>{`חלק ${i + 1} מתוך ${denominator}`}</title>
          </path>
          {denominator <= 10 && (
            <text
              x={tx}
              y={ty}
              textAnchor="middle"
              className={`slice-label ${isFilled ? 'label-filled' : 'label-empty'}`}
              pointerEvents="none"
            >
              1/{denominator}
            </text>
          )}
        </g>
      );
    });
  };

  return (
    <div className={`manipulative-card ${isFullyFilled ? 'whole-completed' : ''}`}>
      <div className="card-header">
        <span className="whole-tag">שלם #{wholeIndex + 1}</span>
        <span className="fraction-tag">
          {filledCount}/{denominator}
        </span>
      </div>

      <div className="svg-container">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="manipulative-svg"
        >
          {/* Subtle outer guide ring */}
          <circle
            cx={center}
            cy={center}
            r={radius + 4}
            fill="none"
            stroke="var(--color-ring-border, rgba(99, 102, 241, 0.2))"
            strokeWidth="3"
            strokeDasharray="4 4"
          />
          {renderSlices()}
          {/* Center pin circle */}
          <circle cx={center} cy={center} r={6} className="center-pin" />
        </svg>
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

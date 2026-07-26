import React from 'react';

/**
 * RiskGauge — Visual risk score gauge with prediction details.
 */
function RiskGauge({ prediction }) {
  if (!prediction) {
    return (
      <div className="risk-gauge-empty">
        <div className="gauge-placeholder">
          <svg viewBox="0 0 200 120" width="200" height="120">
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#2a2a4a" strokeWidth="12" strokeLinecap="round" />
          </svg>
          <p className="gauge-label">Submit an event to see results</p>
        </div>
      </div>
    );
  }

  const score = prediction.risk_score;
  const maxAngle = 180;
  const angle = (score / 100) * maxAngle;

  // Color based on risk level
  let color = '#66bb6a'; // green
  let level = 'Low Risk';
  if (score >= 70) {
    color = '#ef5350'; // red
    level = 'Critical';
  } else if (score >= 50) {
    color = '#ffa726'; // orange
    level = 'High Risk';
  } else if (score >= 30) {
    color = '#ffee58'; // yellow
    level = 'Medium Risk';
  }

  // SVG arc calculation
  const cx = 100, cy = 100, r = 80;
  const startAngle = -180;
  const endAngle = startAngle + angle;
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  const largeArc = angle > 180 ? 1 : 0;
  const arcPath = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;

  return (
    <div className="risk-gauge">
      <div className="gauge-visual">
        <svg viewBox="0 0 200 120" width="220" height="130">
          {/* Background arc */}
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#2a2a4a" strokeWidth="12" strokeLinecap="round" />
          {/* Score arc */}
          {score > 0 && (
            <path d={arcPath} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" />
          )}
          {/* Score text */}
          <text x="100" y="85" textAnchor="middle" fontSize="28" fontWeight="700" fill={color}>
            {score}
          </text>
          <text x="100" y="110" textAnchor="middle" fontSize="11" fill="#8892a4">
            {level}
          </text>
        </svg>
      </div>

      <div className="prediction-details">
        <div className="detail-row">
          <span className="detail-label">Prediction:</span>
          <span className={`detail-value ${prediction.is_anomaly ? 'anomaly' : 'normal'}`}>
            {prediction.prediction}
          </span>
        </div>
        {prediction.confidence && (
          <div className="detail-row">
            <span className="detail-label">Confidence:</span>
            <span className="detail-value">{(prediction.confidence * 100).toFixed(0)}%</span>
          </div>
        )}
        <div className="detail-row">
          <span className="detail-label">Status:</span>
          <span className={`badge ${prediction.is_anomaly ? 'badge-danger' : 'badge-success'}`}>
            {prediction.is_anomaly ? '⚠️ ANOMALY' : '✓ Normal'}
          </span>
        </div>
        {prediction.reasons && prediction.reasons.length > 0 && (
          <div className="reasons-list">
            <span className="detail-label">Reasons:</span>
            <ul>
              {prediction.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <style>{`
        .risk-gauge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .risk-gauge-empty {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
        }
        .gauge-placeholder {
          text-align: center;
        }
        .gauge-label {
          color: #5a6577;
          font-size: 0.85rem;
          margin-top: 0.5rem;
        }
        .gauge-visual {
          display: flex;
          justify-content: center;
        }
        .prediction-details {
          width: 100%;
          font-size: 0.85rem;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.4rem 0;
          border-bottom: 1px solid #2a2a4a;
        }
        .detail-label {
          color: #8892a4;
          font-weight: 500;
        }
        .detail-value {
          font-weight: 600;
        }
        .detail-value.anomaly {
          color: #ef5350;
        }
        .detail-value.normal {
          color: #66bb6a;
        }
        .badge {
          padding: 0.2rem 0.6rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .badge-danger {
          background: rgba(239, 83, 80, 0.15);
          color: #ef5350;
        }
        .badge-success {
          background: rgba(102, 187, 106, 0.15);
          color: #66bb6a;
        }
        .reasons-list {
          margin-top: 0.8rem;
        }
        .reasons-list ul {
          list-style: none;
          margin-top: 0.4rem;
        }
        .reasons-list li {
          padding: 0.3rem 0;
          padding-left: 1rem;
          position: relative;
          color: #e0e0e0;
          font-size: 0.8rem;
        }
        .reasons-list li::before {
          content: '→';
          position: absolute;
          left: 0;
          color: #ffa726;
        }
      `}</style>
    </div>
  );
}

export default RiskGauge;

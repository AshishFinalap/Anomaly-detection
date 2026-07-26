import React from 'react';

/**
 * AlertTable — Displays recent alerts in a sortable table with risk indicators.
 */
function AlertTable({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="alert-table-empty">
        <p>No alerts yet. Submit a login event to generate predictions.</p>
        <style>{`
          .alert-table-empty {
            text-align: center;
            padding: 2rem;
            color: #5a6577;
            font-size: 0.9rem;
          }
        `}</style>
      </div>
    );
  }

  const getRiskColor = (score) => {
    if (score >= 70) return '#ef5350';
    if (score >= 50) return '#ffa726';
    if (score >= 30) return '#ffee58';
    return '#66bb6a';
  };

  const getRiskLabel = (score) => {
    if (score >= 70) return 'Critical';
    if (score >= 50) return 'High';
    if (score >= 30) return 'Medium';
    return 'Low';
  };

  return (
    <div className="alert-table-wrapper">
      <table className="alert-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Prediction</th>
            <th>Risk Score</th>
            <th>Confidence</th>
            <th>Status</th>
            <th>Key Indicators</th>
          </tr>
        </thead>
        <tbody>
          {alerts.slice(0, 50).map((alert) => (
            <tr key={alert.id} className={alert.is_anomaly ? 'row-anomaly' : ''}>
              <td className="mono">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </td>
              <td>
                <span className={`prediction-tag ${alert.is_anomaly ? 'danger' : 'safe'}`}>
                  {alert.prediction}
                </span>
              </td>
              <td>
                <div className="risk-bar-container">
                  <div
                    className="risk-bar"
                    style={{
                      width: `${alert.risk_score}%`,
                      backgroundColor: getRiskColor(alert.risk_score),
                    }}
                  />
                  <span className="risk-score-text" style={{ color: getRiskColor(alert.risk_score) }}>
                    {alert.risk_score} ({getRiskLabel(alert.risk_score)})
                  </span>
                </div>
              </td>
              <td>
                {alert.confidence ? `${(alert.confidence * 100).toFixed(0)}%` : '—'}
              </td>
              <td>
                <span className={`status-dot ${alert.is_anomaly ? 'anomaly' : 'normal'}`}>
                  {alert.is_anomaly ? '⚠️' : '✓'}
                </span>
              </td>
              <td className="reasons-cell">
                {alert.reasons && alert.reasons.slice(0, 2).join('; ')}
                {alert.reasons && alert.reasons.length > 2 && '...'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <style>{`
        .alert-table-wrapper {
          overflow-x: auto;
        }
        .alert-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8rem;
        }
        .alert-table th {
          text-align: left;
          padding: 0.7rem 0.5rem;
          color: #8892a4;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.7rem;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #2a2a4a;
        }
        .alert-table td {
          padding: 0.6rem 0.5rem;
          border-bottom: 1px solid #1a1a2e;
          vertical-align: middle;
        }
        .row-anomaly {
          background: rgba(239, 83, 80, 0.05);
        }
        .mono {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
        }
        .prediction-tag {
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.72rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .prediction-tag.danger {
          background: rgba(239, 83, 80, 0.15);
          color: #ef5350;
        }
        .prediction-tag.safe {
          background: rgba(102, 187, 106, 0.15);
          color: #66bb6a;
        }
        .risk-bar-container {
          position: relative;
          width: 100%;
          min-width: 120px;
        }
        .risk-bar {
          height: 4px;
          border-radius: 2px;
          margin-bottom: 4px;
        }
        .risk-score-text {
          font-size: 0.72rem;
          font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
        }
        .status-dot {
          font-size: 1rem;
        }
        .reasons-cell {
          color: #8892a4;
          max-width: 250px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}

export default AlertTable;

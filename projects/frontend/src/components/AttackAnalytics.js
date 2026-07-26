import React from 'react';

/**
 * AttackAnalytics — Bar chart showing attack type distribution.
 */
function AttackAnalytics({ stats }) {
  if (!stats || !stats.attack_type_counts || Object.keys(stats.attack_type_counts).length === 0) {
    return (
      <div className="analytics-empty">
        <p>No attacks detected yet. Data will appear as anomalies are identified.</p>
        <style>{`
          .analytics-empty {
            text-align: center;
            padding: 2rem;
            color: #5a6577;
            font-size: 0.9rem;
          }
        `}</style>
      </div>
    );
  }

  const types = Object.entries(stats.attack_type_counts).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...types.map(([, count]) => count));

  const colors = {
    'Brute Force': '#ef5350',
    'Credential Misuse': '#ffa726',
    'Device Spoofing': '#ab47bc',
    'Impossible Travel': '#4fc3f7',
    'Lateral Movement': '#66bb6a',
  };

  return (
    <div className="attack-analytics">
      {types.map(([type, count]) => (
        <div key={type} className="bar-row">
          <div className="bar-label">{type}</div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{
                width: `${(count / maxCount) * 100}%`,
                backgroundColor: colors[type] || '#4fc3f7',
              }}
            />
          </div>
          <div className="bar-count">{count}</div>
        </div>
      ))}

      <style>{`
        .attack-analytics {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }
        .bar-row {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }
        .bar-label {
          width: 140px;
          font-size: 0.8rem;
          color: #e0e0e0;
          text-align: right;
          flex-shrink: 0;
        }
        .bar-track {
          flex: 1;
          height: 20px;
          background: #0d1b2a;
          border-radius: 4px;
          overflow: hidden;
        }
        .bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        .bar-count {
          width: 30px;
          font-size: 0.85rem;
          font-weight: 700;
          color: #e0e0e0;
          font-family: 'JetBrains Mono', monospace;
        }
      `}</style>
    </div>
  );
}

export default AttackAnalytics;

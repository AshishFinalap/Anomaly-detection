import React from 'react';

/**
 * StatsCards — Summary statistics displayed as metric cards.
 */
function StatsCards({ stats }) {
  if (!stats) {
    return (
      <div className="stats-cards">
        <div className="stat-card"><div className="stat-loading">Loading...</div></div>
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Events',
      value: stats.total_events,
      icon: '📊',
      color: '#4fc3f7',
    },
    {
      label: 'Anomalies Detected',
      value: stats.total_anomalies,
      icon: '🚨',
      color: '#ef5350',
    },
    {
      label: 'Anomaly Rate',
      value: `${(stats.anomaly_rate * 100).toFixed(1)}%`,
      icon: '📈',
      color: '#ffa726',
    },
    {
      label: 'Avg Risk Score',
      value: stats.avg_risk_score.toFixed(1),
      icon: '⚡',
      color: '#ab47bc',
    },
    {
      label: 'High Risk (≥70)',
      value: stats.high_risk_count,
      icon: '🔥',
      color: '#ef5350',
    },
  ];

  return (
    <div className="stats-cards">
      {cards.map((card, idx) => (
        <div key={idx} className="stat-card" style={{ borderTop: `3px solid ${card.color}` }}>
          <div className="stat-icon">{card.icon}</div>
          <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
          <div className="stat-label">{card.label}</div>
        </div>
      ))}

      <style>{`
        .stats-cards {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .stat-card {
          flex: 1;
          min-width: 150px;
          background: #0d1b2a;
          border-radius: 10px;
          padding: 1.2rem;
          text-align: center;
          border: 1px solid #2a2a4a;
        }
        .stat-icon {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .stat-value {
          font-size: 1.8rem;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
        }
        .stat-label {
          font-size: 0.75rem;
          color: #8892a4;
          margin-top: 0.3rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .stat-loading {
          color: #5a6577;
          padding: 2rem;
        }
      `}</style>
    </div>
  );
}

export default StatsCards;

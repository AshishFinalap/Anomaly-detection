import React, { useState, useEffect, useCallback } from 'react';
import RiskGauge from './components/RiskGauge';
import AlertTable from './components/AlertTable';
import AttackAnalytics from './components/AttackAnalytics';
import EventForm from './components/EventForm';
import StatsCards from './components/StatsCards';
import './App.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [latestPrediction, setLatestPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [healthy, setHealthy] = useState(false);

  // Health check
  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then(res => res.json())
      .then(() => setHealthy(true))
      .catch(() => setHealthy(false));
  }, []);

  // Fetch alerts and stats
  const refreshData = useCallback(() => {
    fetch(`${API_BASE}/alerts?limit=100`)
      .then(res => res.json())
      .then(data => setAlerts(data))
      .catch(err => console.error('Failed to fetch alerts:', err));

    fetch(`${API_BASE}/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Failed to fetch stats:', err));
  }, []);

  useEffect(() => {
    if (healthy) {
      refreshData();
      const interval = setInterval(refreshData, 5000);
      return () => clearInterval(interval);
    }
  }, [healthy, refreshData]);

  // Submit event for prediction
  const submitEvent = async (event) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Prediction failed');
      }
      const data = await res.json();
      setLatestPrediction(data);
      refreshData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Clear alerts
  const clearAlerts = async () => {
    await fetch(`${API_BASE}/alerts/clear`, { method: 'POST' });
    refreshData();
    setLatestPrediction(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="logo">🛡️</div>
          <div>
            <h1>SOC Dashboard</h1>
            <p className="subtitle">AI-Powered Behavioral Anomaly Detection</p>
          </div>
        </div>
        <div className="header-right">
          <span className={`status-badge ${healthy ? 'healthy' : 'unhealthy'}`}>
            {healthy ? '● Connected' : '● Disconnected'}
          </span>
        </div>
      </header>

      <main className="app-main">
        {!healthy && (
          <div className="connection-warning">
            ⚠️ Cannot connect to backend API at <code>{API_BASE}</code>. 
            Please ensure the FastAPI server is running.
          </div>
        )}

        <div className="dashboard-grid">
          {/* Stats Cards */}
          <section className="section stats-section">
            <StatsCards stats={stats} />
          </section>

          {/* Risk Gauge */}
          <section className="section gauge-section">
            <h2>Latest Prediction</h2>
            <RiskGauge prediction={latestPrediction} />
          </section>

          {/* Event Form */}
          <section className="section form-section">
            <h2>Submit Login Event</h2>
            <EventForm onSubmit={submitEvent} loading={loading} />
            {error && <div className="error-msg">❌ {error}</div>}
          </section>

          {/* Attack Analytics */}
          <section className="section analytics-section">
            <h2>Attack Type Distribution</h2>
            <AttackAnalytics stats={stats} />
          </section>

          {/* Alert Table */}
          <section className="section alerts-section">
            <div className="section-header">
              <h2>Recent Alerts</h2>
              <button className="btn-clear" onClick={clearAlerts}>Clear History</button>
            </div>
            <AlertTable alerts={alerts} />
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <p>AI-Powered Behavioral Anomaly Detection • Isolation Forest + XGBoost Pipeline</p>
      </footer>
    </div>
  );
}

export default App;

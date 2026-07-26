import React, { useState } from 'react';

/**
 * EventForm — Form to submit a login event for prediction.
 * Includes preset scenarios for quick testing.
 */

const PRESETS = {
  normal: {
    label: '✓ Normal Login',
    data: {
      login_hour: 10,
      failed_attempts: 0,
      new_device: 0,
      country_changed: 0,
      travel_speed_kmph: 0,
      session_duration_min: 90,
      unique_resources: 4,
      resource: 'CRM',
    },
  },
  brute_force: {
    label: '🔨 Brute Force',
    data: {
      login_hour: 2,
      failed_attempts: 8,
      new_device: 0,
      country_changed: 0,
      travel_speed_kmph: 0,
      session_duration_min: 5,
      unique_resources: 1,
      resource: 'Finance Portal',
    },
  },
  impossible_travel: {
    label: '✈️ Impossible Travel',
    data: {
      login_hour: 14,
      failed_attempts: 1,
      new_device: 1,
      country_changed: 1,
      travel_speed_kmph: 1200,
      session_duration_min: 45,
      unique_resources: 3,
      resource: 'GitLab',
    },
  },
  credential_misuse: {
    label: '🔑 Credential Misuse',
    data: {
      login_hour: 3,
      failed_attempts: 4,
      new_device: 1,
      country_changed: 0,
      travel_speed_kmph: 0,
      session_duration_min: 200,
      unique_resources: 8,
      resource: 'Payroll',
    },
  },
  lateral_movement: {
    label: '🔄 Lateral Movement',
    data: {
      login_hour: 1,
      failed_attempts: 2,
      new_device: 1,
      country_changed: 1,
      travel_speed_kmph: 900,
      session_duration_min: 300,
      unique_resources: 12,
      resource: 'Finance Portal',
    },
  },
};

const RESOURCES = ['CRM', 'GitLab', 'Payroll', 'Finance Portal', 'Email', 'VPN'];

function EventForm({ onSubmit, loading }) {
  const [form, setForm] = useState(PRESETS.normal.data);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePreset = (key) => {
    setForm(PRESETS[key].data);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="event-form">
      {/* Preset buttons */}
      <div className="presets">
        {Object.entries(PRESETS).map(([key, { label }]) => (
          <button
            key={key}
            type="button"
            className="preset-btn"
            onClick={() => handlePreset(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Login Hour (0–23)</label>
            <input
              type="number"
              min="0"
              max="23"
              value={form.login_hour}
              onChange={(e) => handleChange('login_hour', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="form-group">
            <label>Failed Attempts</label>
            <input
              type="number"
              min="0"
              value={form.failed_attempts}
              onChange={(e) => handleChange('failed_attempts', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="form-group">
            <label>New Device</label>
            <select value={form.new_device} onChange={(e) => handleChange('new_device', parseInt(e.target.value))}>
              <option value={0}>No</option>
              <option value={1}>Yes</option>
            </select>
          </div>
          <div className="form-group">
            <label>Country Changed</label>
            <select value={form.country_changed} onChange={(e) => handleChange('country_changed', parseInt(e.target.value))}>
              <option value={0}>No</option>
              <option value={1}>Yes</option>
            </select>
          </div>
          <div className="form-group">
            <label>Travel Speed (km/h)</label>
            <input
              type="number"
              min="0"
              value={form.travel_speed_kmph}
              onChange={(e) => handleChange('travel_speed_kmph', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="form-group">
            <label>Session Duration (min)</label>
            <input
              type="number"
              min="0"
              value={form.session_duration_min}
              onChange={(e) => handleChange('session_duration_min', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="form-group">
            <label>Unique Resources</label>
            <input
              type="number"
              min="0"
              value={form.unique_resources}
              onChange={(e) => handleChange('unique_resources', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="form-group">
            <label>Resource</label>
            <select value={form.resource} onChange={(e) => handleChange('resource', e.target.value)}>
              {RESOURCES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? '⏳ Analyzing...' : '🔍 Analyze Event'}
        </button>
      </form>

      <style>{`
        .event-form {
          font-size: 0.85rem;
        }
        .presets {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }
        .preset-btn {
          background: #0d1b2a;
          border: 1px solid #2a2a4a;
          color: #e0e0e0;
          padding: 0.4rem 0.7rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.75rem;
          transition: all 0.2s;
        }
        .preset-btn:hover {
          border-color: #4fc3f7;
          color: #4fc3f7;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.8rem;
          margin-bottom: 1rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .form-group label {
          font-size: 0.72rem;
          color: #8892a4;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .form-group input,
        .form-group select {
          background: #0d1b2a;
          border: 1px solid #2a2a4a;
          color: #e0e0e0;
          padding: 0.5rem 0.7rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-family: 'JetBrains Mono', monospace;
        }
        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #4fc3f7;
        }
        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #4fc3f7, #2196f3);
          border: none;
          color: #fff;
          padding: 0.7rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(79, 195, 247, 0.3);
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default EventForm;

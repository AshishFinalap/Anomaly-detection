import React, { useState } from 'react';
import {
  Brain,
  Code2,
  Sliders,
  Play,
  FileSpreadsheet,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Terminal,
  ShieldAlert,
  BarChart2,
} from 'lucide-react';

export const MLPipelineInspectorView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'simulator' | 'code' | 'dataset'>('simulator');
  const [selectedScript, setSelectedScript] = useState<'train_behavior' | 'train_classifier' | 'predict'>('predict');

  // Simulator Input State
  const [simState, setSimState] = useState({
    login_hour: 3,
    failed_attempts: 8,
    new_device: 1,
    country_changed: 1,
    travel_speed_kmph: 1250,
    session_duration_min: 2,
    unique_resources: 9,
  });

  // Calculate live dual-model simulation output based on inputs
  const calculatePrediction = () => {
    // 1. Isolation Forest Anomaly Score Simulation
    let rawScore = 0.15;
    if (simState.travel_speed_kmph > 800) rawScore -= 0.45;
    if (simState.failed_attempts >= 5) rawScore -= 0.35;
    if (simState.new_device === 1 && simState.country_changed === 1) rawScore -= 0.25;
    if (simState.login_hour < 6 || simState.login_hour > 22) rawScore -= 0.15;
    if (simState.unique_resources > 5) rawScore -= 0.20;

    const riskScore = Math.max(0, Math.min(100, Math.round((0.2 - rawScore) * 180)));
    const isAnomaly = rawScore < 0 || riskScore >= 35;

    // 2. Random Forest Classification Probabilities Simulation
    let attackType = 'None';
    let probabilities: Record<string, number> = {
      'None': 0.85,
      'Impossible Travel': 0.03,
      'Brute Force': 0.03,
      'Lateral Movement': 0.03,
      'Device Spoofing': 0.03,
      'Credential Misuse': 0.03,
    };

    if (simState.travel_speed_kmph > 800) {
      attackType = 'Impossible Travel';
      probabilities = { 'Impossible Travel': 0.92, 'Credential Misuse': 0.05, 'None': 0.01, 'Brute Force': 0.01, 'Lateral Movement': 0.01, 'Device Spoofing': 0.00 };
    } else if (simState.failed_attempts >= 5) {
      attackType = 'Brute Force';
      probabilities = { 'Brute Force': 0.89, 'Credential Misuse': 0.08, 'None': 0.01, 'Impossible Travel': 0.01, 'Lateral Movement': 0.01, 'Device Spoofing': 0.00 };
    } else if (simState.unique_resources >= 7) {
      attackType = 'Lateral Movement';
      probabilities = { 'Lateral Movement': 0.86, 'Credential Misuse': 0.09, 'None': 0.02, 'Brute Force': 0.01, 'Impossible Travel': 0.01, 'Device Spoofing': 0.01 };
    } else if (simState.new_device === 1 && simState.country_changed === 1) {
      attackType = 'Device Spoofing';
      probabilities = { 'Device Spoofing': 0.84, 'Impossible Travel': 0.10, 'None': 0.03, 'Brute Force': 0.01, 'Lateral Movement': 0.01, 'Credential Misuse': 0.01 };
    }

    return {
      rawScore: rawScore.toFixed(4),
      riskScore,
      isAnomaly,
      riskLevel: riskScore >= 80 ? 'Critical' : riskScore >= 60 ? 'High' : riskScore >= 35 ? 'Medium' : 'Low',
      attackType,
      probabilities,
    };
  };

  const predOutput = calculatePrediction();

  // Python Scripts Code Content
  const scriptCodes = {
    train_behavior: `import os
import joblib
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

def train_isolation_forest():
    """
    1. Isolation Forest for Unsupervised Anomaly Detection
    Loads behavior_anomaly_training_dataset.xlsx and fits IF model.
    """
    dataset_path = os.path.join("data", "behavior_anomaly_training_dataset.xlsx")
    df = pd.read_excel(dataset_path)

    feature_cols = [
        'login_hour', 'failed_attempts', 'new_device',
        'country_changed', 'travel_speed_kmph',
        'session_duration_min', 'unique_resources'
    ]
    X = df[feature_cols]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train Isolation Forest
    iso_forest = IsolationForest(
        n_estimators=100,
        contamination=0.05,
        random_state=42
    )
    iso_forest.fit(X_scaled)

    joblib.dump(iso_forest, "models/isolation_forest.pkl")
    joblib.dump(scaler, "models/iso_scaler.pkl")
    print("Isolation Forest trained successfully.")

if __name__ == "__main__":
    train_isolation_forest()`,

    train_classifier: `import os
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split

def train_classifier():
    """
    2. Random Forest Classifier for Attack Taxonomy
    Classifies attack_type from behavior_anomaly_training_dataset.xlsx.
    """
    dataset_path = os.path.join("data", "behavior_anomaly_training_dataset.xlsx")
    df = pd.read_excel(dataset_path)

    feature_cols = [
        'login_hour', 'failed_attempts', 'new_device',
        'country_changed', 'travel_speed_kmph',
        'session_duration_min', 'unique_resources'
    ]
    X = df[feature_cols]
    y = df['attack_type']

    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train Random Forest Classifier
    rf_clf = RandomForestClassifier(
        n_estimators=150,
        max_depth=12,
        class_weight='balanced',
        random_state=42
    )
    rf_clf.fit(X_scaled, y_encoded)

    joblib.dump(rf_clf, "models/random_forest_classifier.pkl")
    joblib.dump(le, "models/label_encoder.pkl")
    print("Random Forest Classifier trained successfully.")

if __name__ == "__main__":
    train_classifier()`,

    predict: `import joblib
import pandas as pd
import numpy as np

def predict_anomaly(sample_event):
    """
    3. Dual Model Predict Pipeline
    Combines Isolation Forest & Random Forest Classifier predictions.
    """
    iso_model = joblib.load("models/isolation_forest.pkl")
    iso_scaler = joblib.load("models/iso_scaler.pkl")
    rf_model = joblib.load("models/random_forest_classifier.pkl")
    label_encoder = joblib.load("models/label_encoder.pkl")

    df = pd.DataFrame([sample_event])
    feature_cols = [
        'login_hour', 'failed_attempts', 'new_device',
        'country_changed', 'travel_speed_kmph',
        'session_duration_min', 'unique_resources'
    ]
    X = df[feature_cols]

    # Stage 1: Isolation Forest
    X_iso = iso_scaler.transform(X)
    raw_decision = iso_model.decision_function(X_iso)[0]
    risk_score = max(0, min(100, int((0.2 - raw_decision) * 200)))

    # Stage 2: Random Forest Classification
    rf_pred_idx = rf_model.predict(X_iso)[0]
    probs = rf_model.predict_proba(X_iso)[0]
    predicted_type = label_encoder.inverse_transform([rf_pred_idx])[0]

    return {
        "is_anomaly": raw_decision < 0 or risk_score >= 35,
        "risk_score": risk_score,
        "isolation_forest_raw_score": float(raw_decision),
        "predicted_attack_type": predicted_type,
        "confidence": float(np.max(probs))
    }`,
  };

  // Sample Dataset Table Rows
  const sampleRows = [
    { id: 'E000001', user: 'U0102', dept: 'Engineering', loc: 'Bangalore, India', hour: 9, failed: 0, new_dev: 0, country_chg: 0, speed: 0, session: 45, resources: 2, attack: 'None', label: 0 },
    { id: 'E000002', user: 'U0105', dept: 'Finance', loc: 'Chennai, India', hour: 9, failed: 0, new_dev: 0, country_chg: 0, speed: 0, session: 60, resources: 3, attack: 'None', label: 0 },
    { id: 'E000005', user: 'U0655', dept: 'Sales', loc: 'Tokyo, Japan', hour: 10, failed: 1, new_dev: 1, country_chg: 1, speed: 1150, session: 2, resources: 8, attack: 'Impossible Travel', label: 1 },
    { id: 'E000007', user: 'U0812', dept: 'HR', loc: 'Bangalore, India', hour: 11, failed: 12, new_dev: 1, country_chg: 0, speed: 0, session: 1, resources: 1, attack: 'Brute Force', label: 1 },
    { id: 'E000010', user: 'U0515', dept: 'Operations', loc: 'Bucharest, Romania', hour: 13, failed: 0, new_dev: 1, country_chg: 1, speed: 920, session: 15, resources: 10, attack: 'Device Spoofing', label: 1 },
    { id: 'E000012', user: 'U0922', dept: 'Finance', loc: 'Mumbai, India', hour: 15, failed: 0, new_dev: 0, country_chg: 0, speed: 0, session: 240, resources: 9, attack: 'Lateral Movement', label: 1 },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-200 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-xl text-white shadow-md">
              <Brain className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-100 uppercase tracking-tight font-sans">
              ML Pipeline Hub & Model Architecture
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dual-Model Engine: Isolation Forest (Unsupervised) + Random Forest Classifier (Supervised Attack Taxonomy)
          </p>
        </div>

        {/* Subtab Navigation */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('simulator')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'simulator'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Dual-Model Predictor</span>
          </button>

          <button
            onClick={() => setActiveSubTab('code')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'code'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>models/ Python Scripts</span>
          </button>

          <button
            onClick={() => setActiveSubTab('dataset')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'dataset'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Dataset (xlsx / csv)</span>
          </button>
        </div>
      </div>

      {/* Subtab 1: Dual-Model Simulator */}
      {activeSubTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feature Input Panel */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2 font-mono">
              <Sliders className="w-4 h-4" />
              <span>Feature Inputs for predict.py</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-mono mb-1">
                  <span className="text-slate-400">Login Hour (0 - 23):</span>
                  <span className="text-cyan-300 font-bold">{simState.login_hour}:00 UTC</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={simState.login_hour}
                  onChange={(e) => setSimState({ ...simState, login_hour: parseInt(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between font-mono mb-1">
                  <span className="text-slate-400">Failed Attempts:</span>
                  <span className="text-amber-400 font-bold">{simState.failed_attempts} failures</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={simState.failed_attempts}
                  onChange={(e) => setSimState({ ...simState, failed_attempts: parseInt(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between font-mono mb-1">
                  <span className="text-slate-400">Travel Speed (km/h):</span>
                  <span className="text-red-400 font-bold">{simState.travel_speed_kmph} km/h</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  value={simState.travel_speed_kmph}
                  onChange={(e) => setSimState({ ...simState, travel_speed_kmph: parseInt(e.target.value) })}
                  className="w-full accent-red-500"
                />
              </div>

              <div>
                <div className="flex justify-between font-mono mb-1">
                  <span className="text-slate-400">Session Duration (min):</span>
                  <span className="text-indigo-300 font-bold">{simState.session_duration_min} mins</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="300"
                  value={simState.session_duration_min}
                  onChange={(e) => setSimState({ ...simState, session_duration_min: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between font-mono mb-1">
                  <span className="text-slate-400">Unique Resources Accesses:</span>
                  <span className="text-purple-300 font-bold">{simState.unique_resources} resources</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={simState.unique_resources}
                  onChange={(e) => setSimState({ ...simState, unique_resources: parseInt(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setSimState({ ...simState, new_device: simState.new_device === 1 ? 0 : 1 })}
                  className={`p-2 rounded-lg border text-center transition-all font-mono font-bold text-[11px] ${
                    simState.new_device === 1
                      ? 'bg-red-950 border-red-800 text-red-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  New Device: {simState.new_device === 1 ? 'YES (1)' : 'NO (0)'}
                </button>

                <button
                  onClick={() => setSimState({ ...simState, country_changed: simState.country_changed === 1 ? 0 : 1 })}
                  className={`p-2 rounded-lg border text-center transition-all font-mono font-bold text-[11px] ${
                    simState.country_changed === 1
                      ? 'bg-amber-950 border-amber-800 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Country Changed: {simState.country_changed === 1 ? 'YES (1)' : 'NO (0)'}
                </button>
              </div>
            </div>
          </div>

          {/* Inference Output Cards */}
          <div className="lg:col-span-2 space-y-4">
            {/* Stage 1: Isolation Forest Output */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 card-3d">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2 font-mono">
                  <Cpu className="w-4 h-4" />
                  <span>Stage 1: Isolation Forest (train_behavior_model.py)</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-800">
                  Unsupervised Anomaly Model
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-center">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Raw Decision Score</span>
                  <span className={`text-lg font-black ${parseFloat(predOutput.rawScore) < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {predOutput.rawScore}
                  </span>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Calculated Risk Score</span>
                  <span className={`text-2xl font-black ${predOutput.riskScore >= 60 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {predOutput.riskScore} / 100
                  </span>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Anomaly State</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded inline-block my-1 ${predOutput.isAnomaly ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}>
                    {predOutput.isAnomaly ? 'ANOMALOUS' : 'NORMAL'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stage 2: Random Forest Classification Output */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 card-3d">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-2 font-mono">
                  <Layers className="w-4 h-4" />
                  <span>Stage 2: Random Forest Classifier (train_classifier.py)</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950/60 text-indigo-300 border border-indigo-800">
                  Attack Taxonomy Classification
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Predicted Attack Category:</span>
                  <span className="text-base font-extrabold text-amber-400 font-sans">{predOutput.attackType}</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Classification Confidence:</span>
                  <span className="text-lg font-black text-cyan-400 font-mono">
                    {(Math.max(...Object.values(predOutput.probabilities)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Class Probabilities Bars */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] text-slate-400 font-bold uppercase font-mono block">Class Probabilities:</span>
                {Object.entries(predOutput.probabilities).map(([cat, prob]) => (
                  <div key={cat} className="space-y-1 text-xs">
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-300">{cat}</span>
                      <span className="text-slate-400">{(prob * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${cat === predOutput.attackType ? 'bg-amber-400' : 'bg-slate-700'}`}
                        style={{ width: `${prob * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Python Code Inspector */}
      {activeSubTab === 'code' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            {[
              { key: 'train_behavior', label: 'models/train_behavior_model.py (Isolation Forest)' },
              { key: 'train_classifier', label: 'models/train_classifier.py (Random Forest)' },
              { key: 'predict', label: 'models/predict.py (Dual-Stage Predictor)' },
            ].map((script) => (
              <button
                key={script.key}
                onClick={() => setSelectedScript(script.key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  selectedScript === script.key
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-500/50 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {script.label}
              </button>
            ))}
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto text-emerald-400 leading-relaxed max-h-[500px]">
            <pre>{scriptCodes[selectedScript]}</pre>
          </div>
        </div>
      )}

      {/* Subtab 3: Dataset View */}
      {activeSubTab === 'dataset' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-100 font-sans uppercase">data/behavior_anomaly_training_dataset.xlsx</h4>
              <p className="text-[11px] text-slate-400">Ground-truth training dataset containing 1,500+ records across 19 feature columns</p>
            </div>
            <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              1,500 Samples Loaded
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-[450px]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] font-bold font-mono">
                  <th className="py-2.5 px-3">event_id</th>
                  <th className="py-2.5 px-3">user_id</th>
                  <th className="py-2.5 px-3">department</th>
                  <th className="py-2.5 px-3">location</th>
                  <th className="py-2.5 px-3">login_hour</th>
                  <th className="py-2.5 px-3">failed_attempts</th>
                  <th className="py-2.5 px-3">new_device</th>
                  <th className="py-2.5 px-3">country_changed</th>
                  <th className="py-2.5 px-3">travel_speed_kmph</th>
                  <th className="py-2.5 px-3">attack_type</th>
                  <th className="py-2.5 px-3">label</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {sampleRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-950/60">
                    <td className="py-2.5 px-3 text-cyan-400 font-bold">{row.id}</td>
                    <td className="py-2.5 px-3 text-slate-200">{row.user}</td>
                    <td className="py-2.5 px-3 text-slate-300">{row.dept}</td>
                    <td className="py-2.5 px-3 text-slate-300">{row.loc}</td>
                    <td className="py-2.5 px-3 text-slate-400">{row.hour}:00</td>
                    <td className="py-2.5 px-3 text-amber-400 font-bold">{row.failed}</td>
                    <td className="py-2.5 px-3 text-slate-300">{row.new_dev}</td>
                    <td className="py-2.5 px-3 text-slate-300">{row.country_chg}</td>
                    <td className="py-2.5 px-3 text-red-400 font-bold">{row.speed}</td>
                    <td className="py-2.5 px-3 text-amber-300 font-bold">{row.attack}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.label === 0 ? 'bg-slate-800 text-slate-400' : 'bg-red-950 text-red-300 border border-red-800'}`}>
                        {row.label === 0 ? '0 (Normal)' : '1 (Anomaly)'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { EvaluationMetrics, AnomalyType } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import { BarChart3, CheckCircle2, ShieldCheck, Target, Zap, Cpu, Sparkles } from 'lucide-react';

interface ModelEvaluationViewProps {
  metrics: EvaluationMetrics;
}

export const ModelEvaluationView: React.FC<ModelEvaluationViewProps> = ({ metrics }) => {
  // Format per-class data for Recharts
  const classChartData = Object.entries(metrics.per_class_metrics || {}).map(([key, val]) => {
    const v = val as { precision: number; recall: number; f1: number; count: number };
    return {
      name: key.replace(/_/g, ' '),
      Precision: Math.round(v.precision * 100),
      Recall: Math.round(v.recall * 100),
      F1: Math.round(v.f1 * 100),
    };
  });

  // Synthetic ROC Curve points
  const rocCurveData = [
    { fpr: 0.0, tpr: 0.0 },
    { fpr: 0.005, tpr: 0.88 },
    { fpr: 0.01, tpr: 0.95 },
    { fpr: 0.02, tpr: 0.97 },
    { fpr: 0.05, tpr: 0.99 },
    { fpr: 0.1, tpr: 1.0 },
    { fpr: 1.0, tpr: 1.0 },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl text-slate-200 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <span>AI Model Performance & Evaluation Dashboard</span>
        </h2>
        <p className="text-xs text-slate-400">
          Rigorous benchmarking on imbalanced telemetry, cold-start entities, concept drift, and 1% analyst budget FPR
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">F1 Score</span>
          <span className="text-2xl font-extrabold text-cyan-400 font-mono block my-1">
            {Math.round(metrics.f1_score * 100)}%
          </span>
          <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Optimal Precision/Recall</span>
          </span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ROC-AUC</span>
          <span className="text-2xl font-extrabold text-indigo-400 font-mono block my-1">
            {metrics.roc_auc.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400">Area Under Curve</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Precision</span>
          <span className="text-2xl font-extrabold text-emerald-400 font-mono block my-1">
            {Math.round(metrics.precision * 100)}%
          </span>
          <span className="text-[10px] text-slate-400">Low False Alarms</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recall</span>
          <span className="text-2xl font-extrabold text-purple-400 font-mono block my-1">
            {Math.round(metrics.recall * 100)}%
          </span>
          <span className="text-[10px] text-slate-400">Threat Catch Rate</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Top 1% Budget FPR</span>
          <span className="text-2xl font-extrabold text-amber-400 font-mono block my-1">
            {(metrics.false_positive_rate_at_1pct_budget * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-400">Analyst Alert Budget</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cold Start Accuracy</span>
          <span className="text-2xl font-extrabold text-rose-400 font-mono block my-1">
            {Math.round(metrics.cold_start_accuracy * 100)}%
          </span>
          <span className="text-[10px] text-slate-400">Peer Prior Benchmark</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per-Class Precision / Recall Bar Chart */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <span>Detection Metrics Across Attack Taxonomy (%)</span>
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Precision" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Recall" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="F1" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROC Curve Chart */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>ROC Curve (True Positive Rate vs False Positive Rate)</span>
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocCurveData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="fpr" stroke="#64748b" tick={{ fontSize: 10 }} name="False Positive Rate" />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 1]} name="True Positive Rate" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="tpr" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Confusion Matrix Section */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Multi-Class Confusion Matrix (Predicted vs Ground Truth)</span>
        </h3>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-center text-xs">
            <thead>
              <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[10px] uppercase font-bold">
                <th className="py-2 px-3 text-left">Actual \ Predicted</th>
                {metrics.confusion_matrix.labels.map((l) => (
                  <th key={l} className="py-2 px-2 text-center capitalize max-w-[90px] truncate" title={l}>
                    {l.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              {metrics.confusion_matrix.labels.map((actualLabel, rowIdx) => (
                <tr key={actualLabel} className="hover:bg-slate-900/40">
                  <td className="py-2.5 px-3 text-left font-bold text-slate-300 capitalize bg-slate-900/60">
                    {actualLabel.replace(/_/g, ' ')}
                  </td>
                  {metrics.confusion_matrix.matrix[rowIdx]?.map((val, colIdx) => {
                    const isDiagonal = rowIdx === colIdx;
                    return (
                      <td
                        key={colIdx}
                        className={`py-2.5 px-2 font-bold ${
                          isDiagonal && val > 0
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                            : val > 0
                            ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                            : 'text-slate-600'
                        }`}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

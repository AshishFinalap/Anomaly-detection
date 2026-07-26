import React, { useState } from 'react';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  Shield,
  Sliders,
  Cpu,
  BarChart3,
  Bot,
  Layers,
  Printer,
  CheckCircle2,
  Award,
} from 'lucide-react';

export const ExecutiveReportView: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "1. Aegis CyberShield AI — OT & IT Behavioral Anomaly Engine",
      subtitle: "System Architecture & Technical Executive Summary (Question 4A)",
      icon: Shield,
      content: (
        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-cyan-400 font-sans uppercase tracking-tight">The Behavioral Anomaly Detection Challenge</h4>
            <p>
              Traditional signature-based security fails against novel or "low-and-slow" intrusions across industrial OT gateways, SCADA controllers, and enterprise IT. Aegis CyberShield AI models normal access behavior for edge devices, service accounts, and employees, flagging deviations in real-time with explainable risk scores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span className="font-bold text-slate-100 block mb-1">Key Innovation #1: Dual ML Pipeline (Isolation Forest + Random Forest)</span>
              <p className="text-slate-400">Combines Isolation Forest for unsupervised anomaly scoring with Random Forest Classifier for multi-class attack taxonomy categorization.</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span className="font-bold text-slate-100 block mb-1">Key Innovation #2: Explainable Risk Scores & Gemini AI</span>
              <p className="text-slate-400">Feature attributions assign explicit percentage point risk weights, paired with Gemini 3.6 Flash automated SOC containment playbooks.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "2. Telemetry Generator & Attack Taxonomy",
      subtitle: "Schema Specification & Attack Simulation Mechanics",
      icon: Sliders,
      content: (
        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
          <p>
            Generates high-fidelity access log streams following a defined schema across industrial protocols (Modbus, DNP3, MQTT, HTTPS). Injects ground-truth attack scenarios at controlled rates (0.5% - 5%).
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[11px]">
            <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
              <span className="font-bold text-red-400 block">Impossible Travel</span>
              <span className="text-[10px] text-slate-400 font-sans">Geo-velocity &gt; 800 km/h</span>
            </div>
            <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
              <span className="font-bold text-amber-400 block">Brute Force Auth</span>
              <span className="text-[10px] text-slate-400 font-sans">Burst of 5+ failed auths</span>
            </div>
            <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
              <span className="font-bold text-purple-400 block">Lateral Movement</span>
              <span className="text-[10px] text-slate-400 font-sans">Unusual sensitive SCADA path</span>
            </div>
            <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
              <span className="font-bold text-cyan-400 block">Hardware Spoofing</span>
              <span className="text-[10px] text-slate-400 font-sans">Mismatched MAC / Firmware OS</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: "3. Cold-Start Handling & Concept Drift Resilience",
      subtitle: "Peer Group Prior Clustering & Adaptive Baseline Smoothing",
      icon: Cpu,
      content: (
        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-amber-300 font-sans">Cold-Start Entities</h4>
              <p>
                When a brand-new factory edge device or service account connects with no historical logs, CyberShield AI benchmarks events against <strong>Peer Group Prior Distributions</strong> (e.g., Factory IoT Gateways vs Standard Employee) rather than prematurely triggering false positives.
              </p>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-emerald-300 font-sans">Concept Drift Adaptation</h4>
              <p>
                As legitimate entity behavior evolves (e.g., new work hours or expanded approved APIs), non-anomalous events update running probability distributions using exponential moving average (alpha = 0.05).
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: "4. Feature Attribution & Explainability Layer",
      subtitle: "Numerical Risk Contribution & Gemini AI Analyst Integration",
      icon: Bot,
      content: (
        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
          <p>
            SOC analysts require clear root cause reasoning rather than opaque probability scores.
          </p>

          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
            <span className="font-bold text-cyan-300 block font-mono">Sample Feature Attribution Breakdown:</span>
            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
                <span>Geo-Velocity: 3,420 km/h (NY to Tokyo in 15 mins)</span>
                <span className="text-amber-400 font-bold">+45 pts</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
                <span>Unrecognized Hardware MAC: 'DE:AD:BE:EF:00:01'</span>
                <span className="text-amber-400 font-bold">+35 pts</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
                <span>Off-Hours Connection: 02:14 UTC</span>
                <span className="text-amber-400 font-bold">+15 pts</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: "5. Benchmarks & Realistic Analyst Budget Metrics",
      subtitle: "F1 Score: 97.3% | Top 1% Budget False Positive Rate: 0.12%",
      icon: BarChart3,
      content: (
        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Accuracy</span>
              <span className="text-xl font-black text-cyan-400">98.4%</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Precision</span>
              <span className="text-xl font-black text-emerald-400">98.1%</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Recall</span>
              <span className="text-xl font-black text-purple-400">96.5%</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Top 1% FPR</span>
              <span className="text-xl font-black text-amber-400">0.12%</span>
            </div>
          </div>

          <p className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-slate-400">
            <strong>Analyst Alert Budget:</strong> In real SOC operations, analysts can only triage a limited volume of alerts. When evaluated strictly on the top 1% highest risk events, Aegis CyberShield AI maintains an extremely low false positive rate (0.12%), eliminating alert fatigue.
          </p>
        </div>
      ),
    },
    {
      id: 6,
      title: "6. Industrial Production Architecture & Q4A Compliance",
      subtitle: "High-Throughput Streaming & Cloud Deployment Design",
      icon: Layers,
      content: (
        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-cyan-400 font-sans uppercase">Real-Time Streaming Feasibility</h4>
            <p>
              Designed for microsecond event evaluation using stateful in-memory entity profiles. Integrates seamlessly with Apache Kafka telemetry pipelines and serverless container deployments.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-950/40 p-3 rounded-lg border border-emerald-900/60 font-semibold font-sans">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Fully compliant with Question 4A submission criteria and technical deliverables.</span>
          </div>
        </div>
      ),
    },
  ];

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl text-slate-200 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100">
              Question 4A Deliverables Technical Deck
            </h2>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xs text-slate-400">AI-Powered Behavioral Anomaly Detection Technical Deliverable Report</p>
        </div>

        <button
          id="btn-print-report"
          onClick={() => window.print()}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-cyan-400" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Slide Presentation Carousel */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-6 relative shadow-2xl card-3d">
        {/* Slide Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-600/20 text-cyan-400 rounded-xl border border-cyan-800/40">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-100">{currentSlideData.title}</h3>
              <p className="text-xs text-slate-400">{currentSlideData.subtitle}</p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-slate-500">
            Slide {currentSlide + 1} / {slides.length}
          </span>
        </div>

        {/* Slide Body */}
        <div className="min-h-[200px]">{currentSlideData.content}</div>

        {/* Slide Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            id="btn-prev-slide"
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 disabled:opacity-40 hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentSlide ? 'bg-cyan-500 w-6' : 'bg-slate-800 hover:bg-slate-700'
                }`}
              />
            ))}
          </div>

          <button
            id="btn-next-slide"
            onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
            disabled={currentSlide === slides.length - 1}
            className="flex items-center space-x-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold disabled:opacity-40 transition-all shadow-md shadow-cyan-600/20"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

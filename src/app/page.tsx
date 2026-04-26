"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, XCircle, ShieldAlert, Loader2 } from "lucide-react";
import { checkAdCopy, CheckResult, RiskLevel } from "@/lib/mockChecker";

// ── helpers ────────────────────────────────────────────────────────────────

function riskColor(level: RiskLevel) {
  return {
    low: "text-green-600",
    medium: "text-yellow-500",
    high: "text-red-600",
  }[level];
}

function riskBg(level: RiskLevel) {
  return {
    low: "bg-green-50 border-green-200",
    medium: "bg-yellow-50 border-yellow-200",
    high: "bg-red-50 border-red-200",
  }[level];
}

function riskLabel(level: RiskLevel) {
  return { low: "低リスク", medium: "中リスク", high: "高リスク" }[level];
}

function RiskIcon({ level }: { level: RiskLevel }) {
  if (level === "low") return <CheckCircle className="w-5 h-5 text-green-600" />;
  if (level === "medium") return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
  return <XCircle className="w-5 h-5 text-red-600" />;
}

function categoryColor(cat: string) {
  return (
    {
      薬機法: "bg-red-100 text-red-700",
      景表法: "bg-orange-100 text-orange-700",
      SNS規約: "bg-blue-100 text-blue-700",
    }[cat] ?? "bg-gray-100 text-gray-700"
  );
}

// ── meter ──────────────────────────────────────────────────────────────────

function RiskMeter({ score }: { score: number }) {
  const pct = score;
  const color =
    pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-yellow-400" : "bg-red-500";

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>高リスク</span>
        <span>低リスク</span>
      </div>
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-center mt-2 text-3xl font-bold text-gray-800">
        {score}<span className="text-base font-normal text-gray-500"> / 100</span>
      </div>
    </div>
  );
}

// ── main page ──────────────────────────────────────────────────────────────

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    // Simulate async processing (mock)
    await new Promise((r) => setTimeout(r, 800));
    setResult(checkAdCopy(text));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center gap-3">
        <ShieldAlert className="w-6 h-6 text-indigo-600" />
        <h1 className="text-lg font-bold text-gray-900">AI広告コンプライアンスチェッカー</h1>
        <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">MOCK MODE</span>
      </header>

      {/* main */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-10 space-y-6">
        {/* input */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              広告原稿を入力してください
            </label>
            <textarea
              className="w-full h-40 rounded-xl border border-gray-300 p-3 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="例：このサプリメントを飲めば確実に治ります！業界No.1の実績！"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">{text.length} 文字</p>
          </div>
          <button
            onClick={handleCheck}
            disabled={!text.trim() || loading}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                診断中…
              </>
            ) : (
              "コンプライアンス診断を実行"
            )}
          </button>
        </section>

        {/* result */}
        {result && (
          <section className={`bg-white rounded-2xl border shadow-sm p-6 space-y-6 ${riskBg(result.riskLevel)}`}>
            {/* score */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <RiskIcon level={result.riskLevel} />
                <span className={`font-bold text-lg ${riskColor(result.riskLevel)}`}>
                  {riskLabel(result.riskLevel)}
                </span>
              </div>
              <RiskMeter score={result.score} />
              <p className="text-sm text-gray-700">{result.summary}</p>
            </div>

            {/* issues */}
            {result.issues.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">検出された問題</h2>
                {result.issues.map((issue, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColor(issue.category)}`}>
                        {issue.category}
                      </span>
                      <RiskIcon level={issue.severity} />
                    </div>
                    <p className="text-sm text-gray-800">{issue.description}</p>
                    <p className="text-xs text-gray-500">
                      <span className="font-medium text-gray-600">改善提案：</span>
                      {issue.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {result.issues.length === 0 && (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-xl p-4">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">リスクワードは検出されませんでした。</span>
              </div>
            )}
          </section>
        )}
      </main>

      {/* footer / legal guard */}
      <footer className="bg-gray-100 border-t border-gray-200 py-5 px-6 text-center space-y-1">
        <p className="text-xs font-semibold text-gray-600">
          ⚠️ 免責事項
        </p>
        <p className="text-xs text-gray-500 max-w-xl mx-auto">
          本ツールの診断結果は <strong>AIによる推定</strong> であり、法的助言・法的見解を構成するものではありません。
          薬機法・景表法等への最終的な適合判断は、必ず資格を有する法律専門家または行政機関にご確認ください。
        </p>
        <p className="text-xs text-gray-400">© 2025 AI Compliance Ad-Checker MVP — Powered by Mock Engine</p>
      </footer>
    </div>
  );
}

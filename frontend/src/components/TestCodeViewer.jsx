import React, { useState } from 'react';
import { Code, Play, Copy, Check, ShieldCheck, Zap } from 'lucide-react';

export function TestCodeViewer({
  script,
  healedScript,
  isHealed,
  onRunTest,
  isRunning,
  isRefactored,
  onToggleRefactor
}) {
  const [activeTab, setActiveTab] = useState('current');
  const [copied, setCopied] = useState(false);

  const displayCode = activeTab === 'healed' && healedScript ? healedScript : script;

  const handleCopy = () => {
    if (displayCode) {
      navigator.clipboard.writeText(displayCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-[#0f0f0f] border border-[#222222] rounded-lg p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 border-b border-[#222] pb-3">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-gray-300" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">2. Playwright Test Script</h2>
        </div>

        <div className="flex items-center gap-2">
          {isHealed && (
            <div className="flex bg-[#1a1a1a] rounded p-0.5 border border-[#333]">
              <button
                onClick={() => setActiveTab('current')}
                className={`px-2 py-0.5 text-[10px] font-mono rounded ${activeTab === 'current' ? 'bg-white text-black font-bold' : 'text-gray-400'}`}
              >
                Original
              </button>
              <button
                onClick={() => setActiveTab('healed')}
                className={`px-2 py-0.5 text-[10px] font-mono rounded ${activeTab === 'healed' ? 'bg-white text-black font-bold' : 'text-gray-400'}`}
              >
                Healed &check;
              </button>
            </div>
          )}

          <button
            onClick={handleCopy}
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1 font-mono bg-[#1a1a1a] px-2 py-1 rounded border border-[#333]"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'COPIED' : 'COPY'}</span>
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="flex-1 bg-[#050505] border border-[#222222] rounded p-4 overflow-auto max-h-[340px] font-mono text-xs leading-relaxed text-gray-300">
        {displayCode ? (
          <pre className="whitespace-pre-wrap">{displayCode}</pre>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-600 font-mono text-xs text-center">
            [No test generated yet. Select a Jira ticket above and click Generate.]
          </div>
        )}
      </div>

      {/* Execution Control Action Bar */}
      <div className="mt-4 pt-3 border-t border-[#222] flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => onRunTest(false)}
          disabled={isRunning || !script}
          className="flex-1 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] text-white font-mono text-xs font-bold py-2.5 px-3 rounded flex items-center justify-center gap-2 disabled:opacity-40 transition-colors"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run Baseline (Normal UI)</span>
        </button>

        <button
          onClick={() => onRunTest(true)}
          disabled={isRunning || !script}
          className="flex-1 bg-white hover:bg-gray-200 text-black font-mono text-xs font-bold py-2.5 px-3 rounded flex items-center justify-center gap-2 disabled:opacity-40 transition-colors shadow-md"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Run Against Mutated UI (Self-Heal Demo)</span>
        </button>
      </div>
    </div>
  );
}


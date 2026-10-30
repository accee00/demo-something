import React from 'react';
import { GitCompare, CheckCircle, ArrowRight, ShieldCheck, FileCode, Send } from 'lucide-react';

export function SelfHealingDiffViewer({ healedData, onSyncJira, isSyncing, syncSuccess }) {
  if (!healedData) return null;

  return (
    <div className="bg-[#0f0f0f] border border-[#222222] rounded-lg p-5">
      <div className="flex items-center justify-between mb-4 border-b border-[#222] pb-3">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-gray-300" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">4. Autonomous Locator Repair &amp; Code Diff</h2>
        </div>
        <span className="text-[11px] font-mono text-black bg-white font-bold px-2 py-0.5 rounded">
          {(healedData.confidence * 100).toFixed(1)}% Confidence Score
        </span>
      </div>

      {/* Before / After Selector Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="bg-[#1c0f0f] border border-[#441a1a] rounded p-3">
          <div className="text-[10px] font-mono uppercase text-red-400 font-bold mb-1">Original Broken Locator:</div>
          <div className="font-mono text-xs text-red-200 line-through">
            {healedData.originalSelector}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">Failed on DOM mutation (Timeout)</div>
        </div>

        <div className="bg-[#0d1c12] border border-[#1a4428] rounded p-3">
          <div className="text-[10px] font-mono uppercase text-green-400 font-bold mb-1">Autonomous Replacement Locator:</div>
          <div className="font-mono text-xs text-green-200 font-bold">
            {healedData.healedSelector}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">{healedData.reason}</div>
        </div>
      </div>

      {/* Unified Git Diff View */}
      {healedData.patchDiff && (
        <div className="mb-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-2">
            <FileCode className="w-3.5 h-3.5" />
            <span>Unified AST Script Diff:</span>
          </div>
          <div className="bg-[#050505] border border-[#222] rounded p-3 font-mono text-xs overflow-auto max-h-48 text-gray-300">
            {healedData.patchDiff.split('\n').map((line, idx) => {
              if (line.startsWith('+') && !line.startsWith('+++')) {
                return <div key={idx} className="text-green-400 bg-[#0d2112] px-1">{line}</div>;
              }
              if (line.startsWith('-') && !line.startsWith('---')) {
                return <div key={idx} className="text-red-400 bg-[#240c0c] px-1">{line}</div>;
              }
              if (line.startsWith('@@')) {
                return <div key={idx} className="text-gray-500 bg-[#161616] px-1">{line}</div>;
              }
              return <div key={idx} className="text-gray-400 px-1">{line}</div>;
            })}
          </div>
        </div>
      )}

      {/* Sync with Jira Button (Bonus PS.8 Objective) */}
      <div className="pt-3 border-t border-[#222] flex items-center justify-between">
        <span className="text-xs text-gray-400 font-mono">
          Bonus Goal: Post report &amp; self-healed audit diff to Jira ticket
        </span>
        <button
          onClick={onSyncJira}
          disabled={isSyncing}
          className="bg-white hover:bg-gray-200 text-black font-mono text-xs font-bold py-2 px-4 rounded flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isSyncing ? 'Syncing...' : syncSuccess ? 'Jira Updated ✓' : 'Push Results to Jira'}</span>
        </button>
      </div>
    </div>
  );
}


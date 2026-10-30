import React from 'react';
import { History, ShieldCheck, CheckCircle, Clock } from 'lucide-react';

export function AuditReport({ runs, onSelectRun, activeRunId }) {
  if (!runs || runs.length === 0) return null;

  const totalRuns = runs.length;
  const healedCount = runs.filter(r => r.status === 'HEALED').length;
  const passedCount = runs.filter(r => r.status === 'PASSED' || r.status === 'HEALED').length;

  return (
    <div className="bg-[#0f0f0f] border border-[#222222] rounded-lg p-5">
      <div className="flex items-center justify-between mb-4 border-b border-[#222] pb-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-gray-300" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">5. Execution History &amp; Audit Trail</h2>
        </div>

        {/* Aggregate Stats */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-gray-400">Total Runs: <b className="text-white">{totalRuns}</b></span>
          <span className="text-gray-400">Self-Healed: <b className="text-white">{healedCount}</b></span>
          <span className="text-gray-400">Reliability: <b className="text-white">{Math.round((passedCount / totalRuns) * 100)}%</b></span>
        </div>
      </div>

      <div className="space-y-2 max-h-48 overflow-auto">
        {runs.map((run) => (
          <div
            key={run.runId}
            onClick={() => onSelectRun(run)}
            className={`p-3 rounded border font-mono text-xs cursor-pointer transition-all flex items-center justify-between ${
              activeRunId === run.runId
                ? 'bg-[#181818] border-white text-white'
                : 'bg-[#121212] border-[#252525] text-gray-300 hover:border-gray-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="font-bold text-white">[{run.ticketKey}]</span>
              <span className="text-gray-400 truncate max-w-xs">{run.ticketSummary}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3" />
                {run.durationMs}ms
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  run.status === 'HEALED'
                    ? 'bg-white text-black'
                    : run.status === 'PASSED'
                    ? 'bg-[#222] text-gray-200 border border-[#444]'
                    : 'bg-red-900 text-white'
                }`}
              >
                {run.status === 'HEALED' ? 'Healed &check;' : run.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


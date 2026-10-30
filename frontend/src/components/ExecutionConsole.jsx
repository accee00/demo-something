import React, { useRef, useEffect } from 'react';
import { Terminal, CheckCircle2, XCircle, Wrench, Clock, Activity } from 'lucide-react';

export function ExecutionConsole({ logs, isRunning, runSummary }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-[#0f0f0f] border border-[#222222] rounded-lg p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 border-b border-[#222] pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-gray-300" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">3. Live Execution &amp; Telemetry Stream</h2>
        </div>

        {runSummary && (
          <div className="flex items-center gap-2 font-mono text-xs">
            <span
              className={`px-2.5 py-0.5 rounded font-bold uppercase ${
                runSummary.status === 'HEALED'
                  ? 'bg-white text-black'
                  : runSummary.status === 'PASSED'
                  ? 'bg-gray-200 text-black'
                  : 'bg-red-500 text-white'
              }`}
            >
              {runSummary.status === 'HEALED' ? 'Passed (Self-Healed)' : runSummary.status}
            </span>
            <span className="text-gray-400">{runSummary.durationMs}ms</span>
          </div>
        )}
      </div>

      {/* Terminal View */}
      <div
        ref={scrollRef}
        className="flex-1 bg-[#050505] border border-[#222222] rounded p-4 overflow-auto max-h-[380px] font-mono text-xs space-y-2"
      >
        {logs.length === 0 ? (
          <div className="h-44 flex items-center justify-center text-gray-600 text-center">
            [Awaiting execution... Select a ticket and click "Run Test Suite"]
          </div>
        ) : (
          logs.map((log, index) => {
            if (log.type === 'STEP_STARTED') {
              return (
                <div key={index} className="flex items-start gap-2 text-gray-400">
                  <Activity className="w-3.5 h-3.5 text-blue-400 animate-spin mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-gray-500">Step {log.step}:</span> {log.description}
                    {log.selector && <code className="ml-2 text-gray-400 text-[10px]">[{log.selector}]</code>}
                  </div>
                </div>
              );
            }

            if (log.type === 'STEP_PASSED') {
              return (
                <div key={index} className="flex items-start gap-2 text-gray-200 pl-4 border-l border-gray-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gray-200 mt-0.5 flex-shrink-0" />
                  <div className="flex items-center justify-between w-full">
                    <span>{log.description}</span>
                    <span className="text-[10px] text-gray-500">{log.durationMs}ms</span>
                  </div>
                </div>
              );
            }

            if (log.type === 'STEP_FAILED') {
              return (
                <div key={index} className="bg-[#240a0a] border border-[#521c1c] rounded p-2 text-red-300">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span>LOCATOR FAILURE DETECTED &mdash; Step {log.step}</span>
                  </div>
                  <div className="text-[11px] text-red-200">{log.error}</div>
                  <div className="text-[10px] text-gray-400 mt-1">Failed Selector: <code>{log.selector}</code></div>
                </div>
              );
            }

            if (log.type === 'HEALING_STARTED') {
              return (
                <div key={index} className="bg-[#181818] border border-white rounded p-2.5 text-white animate-pulse">
                  <div className="flex items-center gap-1.5 font-bold mb-0.5">
                    <Wrench className="w-4 h-4 text-white" />
                    <span>AUTONOMOUS SELF-HEALING ENGINE ACTIVATED</span>
                  </div>
                  <p className="text-[11px] text-gray-300">
                    Inspecting live DOM candidates... Found {log.domCandidatesCount} interactive elements.
                  </p>
                </div>
              );
            }

            if (log.type === 'HEALING_COMPLETED') {
              return (
                <div key={index} className="bg-[#101010] border border-gray-400 rounded p-3 text-white">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs uppercase tracking-wider text-white">
                      &check; Locator Successfully Healed
                    </span>
                    <span className="text-[10px] bg-white text-black font-bold px-1.5 py-0.2 rounded">
                      {(log.confidence * 100).toFixed(0)}% Match
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-300 mb-1">
                    <span className="line-through text-red-400 mr-2">{log.originalSelector}</span>
                    &rarr; <span className="font-bold text-white underline ml-1">{log.healedSelector}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 italic">{log.reason}</div>
                </div>
              );
            }

            if (log.type === 'STEP_RETRY_PASS') {
              return (
                <div key={index} className="flex items-start gap-2 text-white font-bold pl-4 border-l-2 border-white">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white mt-0.5 flex-shrink-0" />
                  <div className="flex items-center justify-between w-full">
                    <span>{log.description}</span>
                    <span className="text-[10px] text-gray-400">{log.durationMs}ms</span>
                  </div>
                </div>
              );
            }

            if (log.type === 'RUN_COMPLETED') {
              return (
                <div key={index} className="mt-3 pt-3 border-t border-[#333] flex items-center justify-between text-xs text-gray-300">
                  <span className="font-bold uppercase tracking-wider">
                    {log.status === 'HEALED' ? '🟢 Execution Succeeded (Autonomous Recovery)' : '🟢 All Tests Passed'}
                  </span>
                  <span className="font-mono text-gray-400">Total: {log.durationMs}ms</span>
                </div>
              );
            }

            return (
              <div key={index} className="text-gray-400 text-[11px]">
                {log.message || JSON.stringify(log)}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}


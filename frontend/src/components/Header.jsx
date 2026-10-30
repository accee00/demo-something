import React from 'react';
import { Shield, Cpu, RefreshCw, Radio, CheckCircle, Terminal } from 'lucide-react';

export function Header({ isConnected, isRunning, systemInfo }) {
  return (
    <header className="border-b border-[#222222] bg-[#0c0c0c] px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-white text-black flex items-center justify-center font-black shadow-md">
            <Shield className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white">SENTINEL<span className="text-gray-400">QA</span></h1>
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded bg-[#1f1f1f] text-gray-300 border border-[#333]">
                v1.0 Hackathon Edition
              </span>
            </div>
            <p className="text-xs text-gray-400">Autonomous Acceptance Criteria &rarr; Playwright UI Test Generation &amp; Self-Healing</p>
          </div>
        </div>

        {/* Telemetry and System Status Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#161616] border border-[#2b2b2b] text-xs">
            <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-green-400 animate-pulse' : 'text-gray-500'}`} />
            <span className="font-mono text-[11px] text-gray-300">
              {isConnected ? 'LIVE WS CONNECTED' : 'CONNECTING...'}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#161616] border border-[#2b2b2b] text-xs">
            <Cpu className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-mono text-[11px] text-gray-300">
              {systemInfo?.aiModel || 'Gemini 2.5 / Heuristic Engine'}
            </span>
          </div>

          {isRunning && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-black text-xs font-bold font-mono">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>TEST SUITE RUNNING</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


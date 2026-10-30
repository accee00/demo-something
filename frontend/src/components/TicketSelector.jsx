import React, { useState } from 'react';
import { Ticket, ArrowRight, Sparkles, CheckSquare, Layers, Search } from 'lucide-react';

export function TicketSelector({
  tickets,
  selectedTicket,
  onSelectTicket,
  onFetchJira,
  onGenerateTest,
  isGenerating
}) {
  const [customKey, setCustomKey] = useState('');

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customKey.trim()) {
      onFetchJira(customKey.trim());
    }
  };

  return (
    <div className="bg-[#0f0f0f] border border-[#222222] rounded-lg p-5">
      <div className="flex items-center justify-between mb-4 border-b border-[#222] pb-3">
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-gray-300" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">1. Jira Ticket &amp; Acceptance Criteria</h2>
        </div>
        <span className="text-[11px] font-mono text-gray-400 bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#333]">
          Input Source
        </span>
      </div>

      {/* Ticket Selector Dropdown & Custom Search */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="flex-1">
          <label className="block text-[11px] uppercase font-mono text-gray-400 mb-1">Select Preset Mock Ticket:</label>
          <select
            value={selectedTicket?.key || ''}
            onChange={(e) => {
              const found = tickets.find(t => t.key === e.target.value);
              if (found) onSelectTicket(found.key);
            }}
            className="w-full bg-[#161616] border border-[#333333] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white font-mono"
          >
            {tickets.map((t) => (
              <option key={t.key} value={t.key}>
                [{t.key}] {t.summary}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:w-48">
          <label className="block text-[11px] uppercase font-mono text-gray-400 mb-1">Or Jira Issue Key:</label>
          <form onSubmit={handleCustomSubmit} className="flex gap-1">
            <input
              type="text"
              placeholder="e.g. SHOP-101"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              className="w-full bg-[#161616] border border-[#333333] rounded px-2.5 py-2 text-xs text-white focus:outline-none focus:border-white font-mono uppercase"
            />
            <button
              type="submit"
              className="bg-[#262626] hover:bg-[#333] text-white px-2.5 rounded border border-[#3a3a3a] text-xs font-mono"
              title="Fetch Jira issue"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Selected Ticket Card */}
      {selectedTicket && (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-md p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-white text-black px-2 py-0.5 rounded">
                {selectedTicket.key}
              </span>
              <span className="text-xs font-mono text-gray-400">
                Priority: {selectedTicket.priority} &bull; {selectedTicket.issueType}
              </span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#202020] text-gray-300 border border-[#333]">
              {selectedTicket.status}
            </span>
          </div>

          <h3 className="text-sm font-semibold text-white mb-3">
            {selectedTicket.summary}
          </h3>

          {/* Acceptance Criteria List */}
          <div className="space-y-1.5 mb-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-1">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Acceptance Criteria (AC):</span>
            </div>
            {selectedTicket.acceptanceCriteria?.map((ac, idx) => (
              <div
                key={idx}
                className="text-xs bg-[#0b0b0b] border border-[#242424] rounded px-3 py-2 text-gray-300 font-mono leading-relaxed"
              >
                {ac}
              </div>
            ))}
          </div>

          {/* Generate Button */}
          <button
            onClick={onGenerateTest}
            disabled={isGenerating}
            className="w-full bg-white hover:bg-gray-200 text-black font-bold py-2.5 px-4 rounded text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Synthesizing Playwright Test...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Playwright Test Suite &rarr;</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}


import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { TicketSelector } from './components/TicketSelector';
import { TestCodeViewer } from './components/TestCodeViewer';
import { DemoStoreTarget } from './components/DemoStoreTarget';
import { ExecutionConsole } from './components/ExecutionConsole';
import { SelfHealingDiffViewer } from './components/SelfHealingDiffViewer';
import { AuditReport } from './components/AuditReport';

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [script, setScript] = useState('');
  const [healedScript, setHealedScript] = useState('');
  const [healedData, setHealedData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefactored, setIsRefactored] = useState(false);
  const [runs, setRuns] = useState([]);
  const [activeRunSummary, setActiveRunSummary] = useState(null);
  const [systemInfo, setSystemInfo] = useState(null);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const wsRef = useRef(null);

  // Initial load
  useEffect(() => {
    fetchSystemInfo();
    fetchTickets();
    setupWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const fetchSystemInfo = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setSystemInfo(data);
      }
    } catch (e) {
      console.warn('Backend offline or starting up...');
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets');
      if (res.ok) {
        const data = await res.json();
        if (data.tickets && data.tickets.length > 0) {
          setTickets(data.tickets);
          loadTicketDetails(data.tickets[0].key);
        }
      }
    } catch (e) {
      console.warn('Failed to load tickets:', e.message);
    }
  };

  const loadTicketDetails = async (key) => {
    try {
      const res = await fetch(`/api/tickets/${key}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data.ticket);
        // Automatically generate initial script for seamless quick start
        generateScriptForTicket(data.ticket);
      }
    } catch (e) {
      console.warn('Failed to load ticket details:', e.message);
    }
  };

  const setupWebSocket = () => {
    // In local dev, connect directly to backend port 5001 to bypass Vite proxy socket pipe issues
    const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const wsHost = isLocalDev ? 'localhost:5001' : window.location.host;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${wsHost}/ws`;

    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLogs((prev) => [...prev, data]);

          if (data.type === 'HEALING_COMPLETED') {
            setHealedData({
              originalSelector: data.originalSelector,
              healedSelector: data.healedSelector,
              confidence: data.confidence,
              reason: data.reason,
              patchDiff: data.patchDiff
            });
          }

          if (data.type === 'RUN_COMPLETED') {
            setIsRunning(false);
            setActiveRunSummary({
              status: data.status,
              durationMs: data.durationMs,
              stepsCount: data.stepsCount
            });
            fetchRuns();
          }
        } catch (err) {
          console.error('Error parsing WS message:', err);
        }
      };

      ws.onclose = () => {
        setIsWsConnected(false);
        // Try reconnect in 3s
        setTimeout(setupWebSocket, 3000);
      };

      ws.onerror = () => {
        setIsWsConnected(false);
      };
    } catch (e) {
      console.warn('WebSocket setup error:', e.message);
    }
  };

  const generateScriptForTicket = async (ticket) => {
    if (!ticket) return;
    setIsGenerating(true);
    setHealedData(null);
    setHealedScript('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket })
      });
      const data = await res.json();
      if (data.script) {
        setScript(data.script);
      }
    } catch (e) {
      console.error('Test generation error:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchRuns = async () => {
    try {
      const res = await fetch('/api/runs');
      if (res.ok) {
        const data = await res.json();
        setRuns(data.runs || []);
      }
    } catch (e) {
      console.warn('Failed to load runs:', e.message);
    }
  };

  // Run Test Suite
  const handleRunTest = async (overrideRefactorState) => {
    if (!selectedTicket || !script || isRunning) return;

    // If running against mutated UI, toggle the refactor flag
    const targetRefactor = typeof overrideRefactorState === 'boolean' ? overrideRefactorState : isRefactored;
    setIsRefactored(targetRefactor);
    setIsRunning(true);
    setLogs([]);
    setHealedData(null);
    setActiveRunSummary(null);
    setSyncSuccess(false);

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket: selectedTicket,
          script,
          isRefactored: targetRefactor
        })
      });

      const data = await res.json();
      if (data.run) {
        if (data.run.healedScript) {
          setHealedScript(data.run.healedScript);
        }
        if (data.run.healed) {
          setHealedData({
            ...data.run.healed,
            patchDiff: data.run.patchDiff
          });
        }
        setActiveRunSummary({
          status: data.run.status,
          durationMs: data.run.durationMs,
          stepsCount: data.run.steps.length
        });
      }
    } catch (e) {
      console.error('Execution error:', e);
    } finally {
      setIsRunning(false);
      fetchRuns();
    }
  };

  const handleSyncJira = async () => {
    if (!selectedTicket || !activeRunSummary) return;
    setIsSyncing(true);
    try {
      const res = await fetch('/api/jira/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueKey: selectedTicket.key,
          runSummary: {
            runId: runs[0]?.runId || 'RUN-001',
            status: activeRunSummary.status,
            durationMs: activeRunSummary.durationMs,
            stepsCount: activeRunSummary.stepsCount,
            healed: healedData
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setSyncSuccess(true);
      }
    } catch (e) {
      console.error('Jira sync error:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Header
        isConnected={isWsConnected}
        isRunning={isRunning}
        systemInfo={systemInfo}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Top Split: Ticket Input & Target Store Sandbox */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TicketSelector
            tickets={tickets}
            selectedTicket={selectedTicket}
            onSelectTicket={(key) => loadTicketDetails(key)}
            onFetchJira={(key) => loadTicketDetails(key)}
            onGenerateTest={() => generateScriptForTicket(selectedTicket)}
            isGenerating={isGenerating}
          />

          <DemoStoreTarget
            isRefactored={isRefactored}
            onToggleRefactor={() => setIsRefactored(!isRefactored)}
          />
        </div>

        {/* Middle Split: Playwright Script & Live Execution Console */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TestCodeViewer
            script={script}
            healedScript={healedScript}
            isHealed={Boolean(healedData)}
            onRunTest={handleRunTest}
            isRunning={isRunning}
            isRefactored={isRefactored}
            onToggleRefactor={() => setIsRefactored(!isRefactored)}
          />

          <ExecutionConsole
            logs={logs}
            isRunning={isRunning}
            runSummary={activeRunSummary}
          />
        </div>

        {/* Bottom Section: Self-Healing Diff & Audit Trail */}
        {healedData && (
          <SelfHealingDiffViewer
            healedData={healedData}
            onSyncJira={handleSyncJira}
            isSyncing={isSyncing}
            syncSuccess={syncSuccess}
          />
        )}

        <AuditReport
          runs={runs}
          onSelectRun={(run) => {
            setActiveRunSummary(run);
            if (run.healed) setHealedData({ ...run.healed, patchDiff: run.patchDiff });
          }}
          activeRunId={runs[0]?.runId}
        />
      </main>

      <footer className="border-t border-[#1a1a1a] bg-[#080808] py-4 text-center text-xs font-mono text-gray-500">
        SentinelQA Autonomous UI Testing System &bull; INNOVISTA 36-Hour Hackathon &bull; Problem Statement 08
      </footer>
    </div>
  );
}


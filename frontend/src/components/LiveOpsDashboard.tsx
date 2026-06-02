import { useState, useEffect, useRef, type FormEvent } from 'react';
import styles from './LiveOpsDashboard.module.css';

interface LogEntry {
  id: string;
  time: string;
  tag: 'system' | 'build' | 'ai';
  msg: string;
}

const INITIAL_LOGS: LogEntry[] = [
  { id: '1', time: '14:40:02', tag: 'system', msg: 'Virtual telemetry sandbox initialized.' },
  { id: '2', time: '14:40:03', tag: 'build', msg: 'Compiling standalone game engine shaders (virtual environment)...' },
  { id: '3', time: '14:40:05', tag: 'ai', msg: 'Tuning NPC pathfinding logic in standalone project testbed.' },
  { id: '4', time: '14:40:06', tag: 'ai', msg: 'Mock training set active. Virtual GPU cluster allocated.' },
];

const MOCK_EVENTS = [
  { tag: 'build' as const, msg: 'Merged gaming mod "advanced-boss-ai" assets into sandbox build.' },
  { tag: 'system' as const, msg: 'Synchronized simulated physics collision grid... OK.' },
  { tag: 'ai' as const, msg: 'Trained NPC parser on 5,000 gaming dialogue nodes.' },
  { tag: 'build' as const, msg: 'Packaging custom gaming mod JAR library... success.' },
  { tag: 'system' as const, msg: 'Sweeping virtual memory caches... simulated space cleared.' },
  { tag: 'ai' as const, msg: 'Simulated neural agent completed puzzle solver in 14 steps.' },
  { tag: 'build' as const, msg: 'Optimized particle emitter files for standalone game build.' },
  { tag: 'system' as const, msg: 'Simulated bandwidth benchmark: 10 Gbps. Latency: 0.1ms.' },
  { tag: 'ai' as const, msg: 'Testing reinforcement model: agent succeeded in beating simulated level 3.' },
  { tag: 'build' as const, msg: 'Hot-reloading standalone game main loop... success.' },
];

export default function LiveOpsDashboard() {
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [inputValue, setInputValue] = useState('');
  
  // AI training states
  const [epoch, setEpoch] = useState(12);
  const [loss, setLoss] = useState(0.485);
  const [accuracy, setAccuracy] = useState(81.2);
  const [gpuTemp, setGpuTemp] = useState(74);
  const [gpuLoad, setGpuLoad] = useState(88);
  const [vram, setVram] = useState(72.8);

  const consoleBodyRef = useRef<HTMLDivElement>(null);

  // Auto scroll logs container
  useEffect(() => {
    const el = consoleBodyRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [logs]);

  // Periodic AI Training updates: ticks the epoch state
  useEffect(() => {
    const aiInterval = setInterval(() => {
      setEpoch((prev) => (prev < 100 ? prev + 1 : 1));
    }, 3000);

    return () => clearInterval(aiInterval);
  }, []);

  // Update telemetry and logs when epoch changes
  useEffect(() => {
    const progress = epoch / 100;
    
    // Calculate new values locally
    const nextLoss = parseFloat((0.95 * Math.exp(-3 * progress) + 0.02 * Math.random()).toFixed(4));
    const nextAccuracy = parseFloat((50 + 49 * (1 - Math.exp(-4 * progress)) + 0.5 * Math.random()).toFixed(1));
    const nextGpuTemp = Math.floor(70 + Math.random() * 8);
    const nextGpuLoad = Math.floor(80 + Math.random() * 15);
    const nextVram = parseFloat((71.2 + Math.random() * 2.8).toFixed(1));

    setLoss(nextLoss);
    setAccuracy(nextAccuracy);
    setGpuTemp(nextGpuTemp);
    setGpuLoad(nextGpuLoad);
    setVram(nextVram);

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newEntry: LogEntry = {
      id: `ai-${epoch}-${now.getTime()}-${Math.floor(Math.random() * 10000)}`,
      time: timeStr,
      tag: 'ai',
      msg: `Epoch ${epoch}/100 complete. training_loss: ${nextLoss.toFixed(4)} | accuracy: ${nextAccuracy.toFixed(1)}%`,
    };
    setLogs((prevLogs) => [...prevLogs, newEntry].slice(-30));
  }, [epoch]);

  // Periodic system/build logs
  useEffect(() => {
    const systemInterval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const randomEvent = MOCK_EVENTS[Math.floor(Math.random() * MOCK_EVENTS.length)];
      
      const newEntry: LogEntry = {
        id: `sys-${now.getTime()}-${Math.floor(Math.random() * 10000)}`,
        time: timeStr,
        tag: randomEvent.tag,
        msg: randomEvent.msg,
      };
      setLogs((prevLogs) => [...prevLogs, newEntry].slice(-30));
    }, 4500);

    return () => clearInterval(systemInterval);
  }, []);

  const handleCommand = (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const cmd = inputValue.trim().toLowerCase();
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    // User input echo
    const userEntry: LogEntry = {
      id: `user-${now.getTime()}`,
      time: timeStr,
      tag: 'system',
      msg: `visitor@dzd:~$ ${inputValue}`,
    };
    const newLogs = [...logs, userEntry];

    const responseMsg = (() => {
      switch (cmd) {
        case 'help':
          return 'Available commands: help, gems, ai, whois, clear';
        case 'whois':
          return 'DemonZ Development: A collective of creators training AI models and publishing open source gems.';
        case 'gems':
          return 'Gems in Database: 1. dzd-auth (worker template), 2. plugin-framework-api, 3. web-canvas-matrix. Click "Projects" in Navbar to view all.';
        case 'ai':
          return 'AI Operations status: Active training of deep reasoning models. Deploying containerized agents.';
        case 'clear':
          return null;
        default:
          return `Command not found: "${cmd}". Type "help" for a list of commands.`;
      }
    })();

    if (responseMsg === null) {
      setLogs([]);
      setInputValue('');
      return;
    }

    const respEntry: LogEntry = {
      id: `resp-${now.getTime()}`,
      time: timeStr,
      tag: 'system',
      msg: `>> ${responseMsg}`,
    };
    setLogs([...newLogs, respEntry].slice(-30));

    setInputValue('');
  };

  return (
    <div className={styles.dashboard}>
      {/* Console log Panel */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>
            <div className={styles.glowDot} />
            Live Build & ML Activity Logs
          </div>
          <div className={styles.panelHeaderRight}>
            <span
              className={styles.simulatedBadge}
              title="This panel shows simulated data for demonstration purposes."
            >
              Simulated
            </span>
            <div className={styles.panelSubtitle}>status: streaming</div>
          </div>
        </div>

        <div ref={consoleBodyRef} className={styles.consoleBody}>
          {logs.map((log) => (
            <div key={log.id} className={styles.logLine}>
              <span className={styles.timestamp}>[{log.time}]</span>
              <span className={`${styles.tag} ${
                log.tag === 'system' ? styles.tagSystem : log.tag === 'build' ? styles.tagBuild : styles.tagAi
              }`}>
                {log.tag.toUpperCase()}:
              </span>
              <span className={styles.logMsg}>{log.msg}</span>
            </div>
          ))}
        </div>

        {/* Input prompt */}
        <form onSubmit={handleCommand} className={styles.promptWrap}>
          <span className={styles.promptSymbol}>visitor@dzd:~$</span>
          <input
            className={styles.promptInput}
            type="text"
            placeholder="Type 'help', 'gems', 'whois'..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </form>
      </div>

      {/* AI stats widget */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>AI Training Status</div>
          <div className={styles.panelSubtitle}>gpu-cluster: ACTIVE</div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statVal}>#{epoch}</div>
            <div className={styles.statLbl}>Epoch</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statVal}>{loss.toFixed(4)}</div>
            <div className={styles.statLbl}>Train Loss</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statVal}>{accuracy.toFixed(1)}%</div>
            <div className={styles.statLbl}>Val Accuracy</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statVal}>{gpuTemp}°C</div>
            <div className={styles.statLbl}>GPU Temp</div>
          </div>
        </div>

        <div className={styles.progressWrap}>
          <div className={styles.progressLabel}>
            <span>Epoch Progress</span>
            <span>{epoch}%</span>
          </div>
          <div className={styles.progressBarOuter}>
            <div className={styles.progressBarInner} style={{ width: `${epoch}%` }} />
          </div>
        </div>

        <div className={styles.hardwareStats}>
          <div className={styles.hwRow}>
            <span>GPU Cluster Load:</span>
            <span className={styles.hwVal}>{gpuLoad}%</span>
          </div>
          <div className={styles.hwRow}>
            <span>VRAM Utilization:</span>
            <span className={styles.hwVal}>{vram} GB / 80.0 GB (H100 SXM5)</span>
          </div>
          <div className={styles.hwRow}>
            <span>Nodes Running:</span>
            <span className={styles.hwVal}>8x H100 SXM5 (Cluster)</span>
          </div>
          <div className={styles.hwRow}>
            <span>Model Parameters:</span>
            <span className={styles.hwVal}>8.4B (FP16)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

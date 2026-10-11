import React, { useState, useEffect } from 'react';
import type { AuditEntry, ModelInfo } from '../types';
import { fetchLogs } from '../api';
import GradientWaves from './GradientWaves';
import { WobbleCard } from './ui/wobble-card';

interface Props {
  models: ModelInfo[];
  onBack: () => void;
}

export default function DetailedAnalysisPage({ models, onBack }: Props) {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchLogs()
      .then((data) => setLogs(data))
      .catch((err) => console.warn('Failed to load logs:', err))
      .finally(() => setLoading(false));
  }, []);

  const totalReqs = logs.length;
  const successfulReqs = logs.filter((l) => l.success !== false).length;
  const successRate = totalReqs > 0 ? Math.round((successfulReqs / totalReqs) * 100) : 100;
  const avgLatency =
    totalReqs > 0
      ? Math.round(
          logs.reduce((acc, l) => acc + (l.response_time_ms || 0), 0) / totalReqs
        )
      : 0;

  // 1. Model Selection Distribution
  const modelUsageCounts: Record<string, number> = {};
  logs.forEach((l) => {
    const m = l.model_used || l.model || 'Unknown';
    modelUsageCounts[m] = (modelUsageCounts[m] || 0) + 1;
  });
  const modelUsageList = Object.entries(modelUsageCounts).sort((a, b) => b[1] - a[1]);

  // 2. Latency Breakdown by Model
  const modelLatencyMap: Record<string, { total: number; count: number }> = {};
  logs.forEach((l) => {
    const m = l.model_used || l.model || 'Unknown';
    if (!modelLatencyMap[m]) modelLatencyMap[m] = { total: 0, count: 0 };
    modelLatencyMap[m].total += l.response_time_ms || 0;
    modelLatencyMap[m].count += 1;
  });

  // 3. Recent 12 Inferences for Trend Chart
  const recentLogs = [...logs].slice(-14);
  const maxRecentLatency = Math.max(...recentLogs.map((l) => l.response_time_ms || 0), 100);

  return (
    <div style={styles.page}>
      {/* Background Gradient Waves - Exactly matching main page */}
      <div style={styles.wavesBg}>
        <GradientWaves
          horizonColor="#5227FF"
          waveColor="#FF9FFC"
          crestColor="#FFFFFF"
          speed={0.4}
          amplitude={2.5}
          waveScale={0.6}
          waveRatio={0.9}
          swell={35}
          turbulence={15.5}
          tilt={1.11}
          zoom={1.0}
          height={5.5}
          fogDepth={15}
          detail="medium"
          brightness={1.0}
          opacity={0.5}
          mouseInteraction={true}
          parallaxStrength={0.5}
          grain={true}
          grainIntensity={0.05}
        />
      </div>

      {/* Main Content Container */}
      <div style={styles.contentWrap}>
        {/* Navigation / Top Header */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <button
              type="button"
              style={styles.backBtn}
              onClick={onBack}
              title="Return to Model Router"
              aria-label="Back to chat"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Back to Chat</span>
            </button>

            <div style={styles.dividerV} />

            <div style={styles.brandRow}>
              <img src="/logo-icon.png" alt="Model Router Logo" style={styles.logoImg} />
              <div>
                <h1 style={styles.title}>Detailed Routing Analysis</h1>
                <p style={styles.subtitle}>Autonomous telemetry, model efficiency curves & visual audit metrics</p>
              </div>
            </div>
          </div>

          <div style={styles.headerRight}>
            <span style={styles.livePill}>
              <span style={styles.pulseDot} />
              Live Gateway Telemetry
            </span>
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <main style={styles.scrollArea}>
          {/* Top Metric Cards */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Total Inferences</span>
              <span style={styles.statVal}>{totalReqs}</span>
              <span style={styles.statSub}>Audit queries routed</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Success Rate</span>
              <span style={{ ...styles.statVal, color: '#34d399' }}>{successRate}%</span>
              <span style={styles.statSub}>{successfulReqs} of {totalReqs} completed</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Average Latency</span>
              <span style={{ ...styles.statVal, color: '#8ab4f8' }}>{avgLatency}ms</span>
              <span style={styles.statSub}>End-to-end execution</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Registered Engines</span>
              <span style={styles.statVal}>{models.length}</span>
              <span style={styles.statSub}>{models.filter((m) => m.availability && m.enabled).length} online & active</span>
            </div>
          </div>

          {/* Wobble Cards Visual Grid (Relying heavily on interactive visual charts) */}
          <div style={styles.wobbleGrid}>
            {/* Card 1: Live Response Time / Latency Trend Line-Bar Chart */}
            <WobbleCard containerClassName="col-span-1 lg:col-span-2 min-h-[340px] bg-slate-900 border border-white/10">
              <div style={styles.cardInner}>
                <div style={styles.cardHeader}>
                  <div>
                    <h2 style={styles.cardTitle}>Inference Latency Timeline (Recent Queries)</h2>
                    <p style={styles.cardDesc}>Visual distribution of millisecond response times per routed prompt</p>
                  </div>
                  <span style={styles.tagBadge}>Timeline Trend</span>
                </div>

                {recentLogs.length === 0 ? (
                  <div style={styles.emptyGraph}>No recent queries recorded. Send prompts to observe response curves.</div>
                ) : (
                  <div style={styles.trendGraphContainer}>
                    <div style={styles.barsRow}>
                      {recentLogs.map((log, i) => {
                        const lat = log.response_time_ms || 0;
                        const heightPct = Math.max(12, Math.min(100, (lat / maxRecentLatency) * 100));
                        const isHigh = lat > 2000;
                        const barColor = isHigh ? '#f59e0b' : '#8ab4f8';

                        return (
                          <div key={log.log_id || i} style={styles.barCol} title={`#${i + 1}: ${lat}ms (${log.model_used || 'Auto'})`}>
                            <span style={styles.barValueText}>{lat}ms</span>
                            <div style={styles.barTrack}>
                              <div
                                style={{
                                  ...styles.barFill,
                                  height: `${heightPct}%`,
                                  background: `linear-gradient(180deg, ${barColor} 0%, rgba(138, 180, 248, 0.25) 100%)`,
                                }}
                              />
                            </div>
                            <span style={styles.barLabelText}>#{i + 1}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </WobbleCard>

            {/* Card 2: Model Routing Distribution Doughnut/Bar Comparison */}
            <WobbleCard containerClassName="col-span-1 min-h-[340px] bg-indigo-950/70 border border-white/10">
              <div style={styles.cardInner}>
                <div style={styles.cardHeader}>
                  <div>
                    <h2 style={styles.cardTitle}>Engine Allocation</h2>
                    <p style={styles.cardDesc}>Share of queries chosen by router</p>
                  </div>
                </div>

                <div style={styles.allocationList}>
                  {modelUsageList.length === 0 ? (
                    <div style={styles.emptyGraph}>Awaiting prompt telemetry…</div>
                  ) : (
                    modelUsageList.map(([name, count]) => {
                      const share = Math.round((count / (totalReqs || 1)) * 100);
                      return (
                        <div key={name} style={styles.allocationRow}>
                          <div style={styles.allocHeader}>
                            <span style={styles.allocName}>{name}</span>
                            <span style={styles.allocCount}>{count} ({share}%)</span>
                          </div>
                          <div style={styles.progressTrack}>
                            <div
                              style={{
                                ...styles.progressFill,
                                width: `${share}%`,
                                background: 'linear-gradient(90deg, #8ab4f8 0%, #c084fc 100%)',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </WobbleCard>

            {/* Card 3: Model Capability vs Latency Tradeoff Radar Grid */}
            <WobbleCard containerClassName="col-span-1 lg:col-span-3 min-h-[320px] bg-neutral-900 border border-white/10">
              <div style={styles.cardInner}>
                <div style={styles.cardHeader}>
                  <div>
                    <h2 style={styles.cardTitle}>Registered Engines: Capability vs Latency Matrix</h2>
                    <p style={styles.cardDesc}>Visual intelligence matrix comparing model power, speed benchmark, and context window limits</p>
                  </div>
                  <span style={styles.tagBadge}>Radar Matrix</span>
                </div>

                <div style={styles.matrixGrid}>
                  {models.map((m) => {
                    const avgLat = modelLatencyMap[m.model_key]?.count
                      ? Math.round(modelLatencyMap[m.model_key].total / modelLatencyMap[m.model_key].count)
                      : m.avg_latency_ms;
                    const capPct = (m.capability_score / 10) * 100;
                    const contextK = Math.round(m.context_length / 1024);

                    return (
                      <div key={m.model_key} style={styles.matrixCard}>
                        <div style={styles.matrixTop}>
                          <span style={styles.matrixName}>{m.name}</span>
                          <span style={styles.matrixRole}>{m.role}</span>
                        </div>

                        {/* Capability Bar */}
                        <div style={styles.matrixStatGroup}>
                          <div style={styles.matrixStatRow}>
                            <span style={styles.matrixStatKey}>Intelligence</span>
                            <span style={styles.matrixStatVal}>{m.capability_score}/10</span>
                          </div>
                          <div style={styles.progressTrack}>
                            <div style={{ ...styles.progressFill, width: `${capPct}%`, background: '#8ab4f8' }} />
                          </div>
                        </div>

                        {/* Benchmark Speed */}
                        <div style={styles.matrixStatGroup}>
                          <div style={styles.matrixStatRow}>
                            <span style={styles.matrixStatKey}>Speed Profile</span>
                            <span style={{ ...styles.matrixStatVal, color: '#34d399' }}>{avgLat}ms</span>
                          </div>
                          <div style={styles.progressTrack}>
                            <div
                              style={{
                                ...styles.progressFill,
                                width: `${Math.max(10, Math.min(100, 100 - (avgLat / 5000) * 100))}%`,
                                background: '#34d399',
                              }}
                            />
                          </div>
                        </div>

                        <div style={styles.matrixFooterRow}>
                          <span style={styles.matrixPill}>Context: {contextK}K</span>
                          <span style={styles.matrixPill}>Cost: ${(m.cost_per_1k_tokens / 1000).toFixed(4)}/tok</span>
                          <span style={{ ...styles.matrixPill, color: m.availability ? '#34d399' : '#f87171' }}>
                            {m.availability ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </WobbleCard>
          </div>

          {/* Historical Audit Trail Table */}
          <div style={styles.tableCard}>
            <div style={styles.tableTop}>
              <div>
                <h3 style={styles.tableTitle}>Inference Logs & Execution Audit</h3>
                <p style={styles.tableSub}>Complete chronological trace of prompt routing decisions</p>
              </div>
            </div>

            <div style={styles.tableScroll}>
              <div style={styles.tableHeader}>
                <span style={{ width: 100 }}>Time</span>
                <span style={{ width: 140 }}>Request ID</span>
                <span style={{ flex: 1, minWidth: 200 }}>Prompt Snapshot</span>
                <span style={{ width: 150 }}>Model Used</span>
                <span style={{ width: 100 }}>Latency</span>
                <span style={{ width: 100, textAlign: 'right' }}>Status</span>
              </div>

              {loading ? (
                <div style={styles.tableEmpty}>Loading historical audit records…</div>
              ) : logs.length === 0 ? (
                <div style={styles.tableEmpty}>No audit events yet. Try sending a prompt from the main chat.</div>
              ) : (
                <div style={styles.tableRows}>
                  {logs.map((log, idx) => {
                    const isOk = log.success !== false;
                    const timeStr = log.timestamp_iso
                      ? new Date(log.timestamp_iso).toLocaleTimeString()
                      : '--:--:--';
                    const reqId = log.request_id || log.log_id || `#${idx + 1}`;

                    return (
                      <div key={log.log_id || idx} style={styles.tableRow}>
                        <span style={{ width: 100, color: '#9aa0a6', fontSize: 12 }}>{timeStr}</span>
                        <span style={{ width: 140, color: '#8ab4f8', fontSize: 12, fontFamily: 'monospace' }}>
                          {reqId}
                        </span>
                        <span style={{ flex: 1, minWidth: 200, color: '#e3e3e3', fontSize: 13 }} title={log.prompt_preview}>
                          {log.prompt_preview ? `"${log.prompt_preview}"` : '—'}
                        </span>
                        <div style={{ width: 150, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ color: '#f0f0f0', fontWeight: 500, fontSize: 12 }}>
                            {log.model_used || log.model || 'Auto'}
                          </span>
                          {log.simulated && <span style={styles.simBadge}>SIM</span>}
                        </div>
                        <span style={{ width: 100, color: '#e3e3e3', fontSize: 12, fontFamily: 'monospace' }}>
                          {log.response_time_ms ?? 0}ms
                        </span>
                        <div style={{ width: 100, textAlign: 'right' }}>
                          <span
                            style={{
                              ...styles.statusTag,
                              background: isOk ? 'rgba(52,211,153,0.14)' : 'rgba(248,113,113,0.14)',
                              color: isOk ? '#34d399' : '#f87171',
                            }}
                          >
                            {isOk ? 'SUCCESS' : 'FAILED'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: '100vw',
    height: '100vh',
    position: 'relative',
    overflow: 'hidden',
    background: '#0b0c10',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  wavesBg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    pointerEvents: 'none',
  },
  contentWrap: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 28px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(18, 19, 22, 0.8)',
    backdropFilter: 'blur(16px)',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#e3e3e3',
    padding: '8px 14px',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    transition: 'all 0.15s ease',
  },
  dividerV: {
    width: 1,
    height: 32,
    background: 'rgba(255, 255, 255, 0.1)',
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logoImg: {
    width: 40,
    height: 40,
    objectFit: 'contain',
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: '#f5f5f5',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  subtitle: {
    fontSize: 12,
    color: '#9aa0a6',
    margin: '2px 0 0',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  livePill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    background: 'rgba(52, 211, 153, 0.1)',
    border: '1px solid rgba(52, 211, 153, 0.25)',
    color: '#34d399',
    fontSize: 11,
    fontWeight: 500,
    padding: '5px 10px',
    borderRadius: 20,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#34d399',
    boxShadow: '0 0 8px #34d399',
  },
  scrollArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 32px 48px',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    maxWidth: 1380,
    width: '100%',
    margin: '0 auto',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
  },
  statCard: {
    background: 'rgba(28, 29, 34, 0.75)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  },
  statLabel: {
    fontSize: 11,
    color: '#9aa0a6',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 500,
  },
  statVal: {
    fontSize: 28,
    fontWeight: 700,
    color: '#f5f5f5',
    letterSpacing: '-0.02em',
  },
  statSub: {
    fontSize: 11,
    color: '#71767b',
  },
  wobbleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: 18,
  },
  cardInner: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    gap: 16,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#f5f5f5',
    margin: 0,
  },
  cardDesc: {
    fontSize: 12,
    color: '#9aa0a6',
    margin: '4px 0 0',
  },
  tagBadge: {
    fontSize: 10,
    fontWeight: 600,
    color: '#8ab4f8',
    background: 'rgba(138, 180, 248, 0.12)',
    border: '1px solid rgba(138, 180, 248, 0.25)',
    padding: '3px 8px',
    borderRadius: 6,
    textTransform: 'uppercase',
  },
  emptyGraph: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#71767b',
    fontSize: 13,
    padding: '30px 0',
  },
  trendGraphContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    minHeight: 180,
  },
  barsRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 12,
    height: 180,
    paddingTop: 24,
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  barCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    gap: 6,
  },
  barValueText: {
    fontSize: 10,
    color: '#8ab4f8',
    fontWeight: 600,
    fontFamily: 'monospace',
  },
  barTrack: {
    width: '100%',
    maxWidth: 28,
    flex: 1,
    display: 'flex',
    alignItems: 'flex-end',
    background: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: '6px 6px 0 0',
    transition: 'height 0.3s ease',
  },
  barLabelText: {
    fontSize: 10,
    color: '#71767b',
  },
  allocationList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    flex: 1,
    justifyContent: 'center',
  },
  allocationRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  allocHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  allocName: {
    fontSize: 13,
    fontWeight: 500,
    color: '#e3e3e3',
  },
  allocCount: {
    fontSize: 12,
    color: '#8ab4f8',
    fontWeight: 600,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.4s ease',
  },
  matrixGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 14,
  },
  matrixCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  matrixTop: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  matrixName: {
    fontSize: 14,
    fontWeight: 600,
    color: '#f0f0f0',
  },
  matrixRole: {
    fontSize: 11,
    color: '#9aa0a6',
  },
  matrixStatGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  matrixStatRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matrixStatKey: {
    fontSize: 11,
    color: '#9aa0a6',
  },
  matrixStatVal: {
    fontSize: 11,
    fontWeight: 600,
    color: '#8ab4f8',
  },
  matrixFooterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    paddingTop: 8,
  },
  matrixPill: {
    fontSize: 10,
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#c4c7c5',
    padding: '2px 6px',
    borderRadius: 4,
  },
  tableCard: {
    background: 'rgba(28, 29, 34, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  },
  tableTop: {
    padding: '18px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#f5f5f5',
    margin: 0,
  },
  tableSub: {
    fontSize: 12,
    color: '#9aa0a6',
    margin: '3px 0 0',
  },
  tableScroll: {
    overflowX: 'auto',
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    background: 'rgba(0, 0, 0, 0.25)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    fontSize: 11,
    fontWeight: 600,
    color: '#9aa0a6',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  tableRows: {
    maxHeight: 400,
    overflowY: 'auto',
  },
  tableRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    gap: 8,
  },
  tableEmpty: {
    padding: '36px',
    textAlign: 'center',
    color: '#71767b',
    fontSize: 13,
  },
  simBadge: {
    fontSize: 9,
    color: '#9aa0a6',
    background: 'rgba(255, 255, 255, 0.06)',
    padding: '1px 5px',
    borderRadius: 4,
  },
  statusTag: {
    fontSize: 10,
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: 4,
    display: 'inline-block',
  },
};

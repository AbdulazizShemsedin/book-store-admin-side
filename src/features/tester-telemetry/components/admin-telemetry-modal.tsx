'use client';

import React, { useState, useEffect } from 'react';
import { getTelemetrySupabase } from '../lib/supabase';
import { getOrCreateSessionId, setTesterCustomName } from '../lib/device-info';
import { markMessageSentByMe } from '../hooks/use-tester-listener';
import { TesterSessionRow, AdminMessage } from '../types';
import {
  X,
  DeviceMobile,
  Desktop,
  DeviceTablet,
  Cursor,
  PaperPlaneTilt,
  Trash,
  ArrowsClockwise,
  Eye,
  Info,
  DownloadSimple,
  Copy,
  Check,
  Broadcast,
  CheckCircle,
  Clock,
  Compass,
  PencilSimple,
  Cpu,
  WifiHigh,
  Globe,
  Sparkle,
  Speedometer,
  Pulse,
  HardDrives,
  MouseSimple,
  HandTap,
  WheelchairMotion,
  Lightning,
  WarningCircle,
  Lock,
  Key,
} from '@phosphor-icons/react';

interface AdminTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminTelemetryModal({ isOpen, onClose }: AdminTelemetryModalProps) {
  const [sessions, setSessions] = useState<TesterSessionRow[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageStatus, setMessageStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Rename tester state
  const [isEditingName, setIsEditingName] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');

  // Click Stream Filter state
  const [clickFilter, setClickFilter] = useState<'all' | 'interactive' | 'rage' | 'dead'>('all');
  const [clickSearch, setClickSearch] = useState('');

  // Webhook and Export states
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);

  // Security PIN Lock states
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const REQUIRED_PIN = process.env.NEXT_PUBLIC_HUD_PIN || '2026';

  // Restore unlock state from current browser tab session
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('tewba_hud_unlocked');
      if (saved === 'true') {
        setIsUnlocked(true);
      }
    }
  }, [isOpen]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === REQUIRED_PIN) {
      setIsUnlocked(true);
      setPinError(false);
      setPinInput('');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('tewba_hud_unlocked', 'true');
      }
      fetchSessions();
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setPinInput('');
    setPinError(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('tewba_hud_unlocked');
    }
    setSessions([]);
  };

  const mySessionId = typeof window !== 'undefined' ? getOrCreateSessionId() : '';

  // Fetch Sessions from Supabase
  const fetchSessions = async () => {
    const supabase = getTelemetrySupabase();
    if (!supabase) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tester_sessions')
        .select('*')
        .order('last_updated', { ascending: false });

      if (!error && data) {
        const rows = data as TesterSessionRow[];
        setSessions(rows);

        // Auto-select other tester if available
        if (!selectedSessionId && rows.length > 0) {
          const otherTester = rows.find((s) => s.session_id !== mySessionId);
          setSelectedSessionId(otherTester ? otherTester.session_id : rows[0].session_id);
        }
      }
    } catch (err) {
      console.warn('[TesterTelemetry] Failed to fetch sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isUnlocked) {
      fetchSessions();
      const interval = setInterval(fetchSessions, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen, isUnlocked]);

  const currentSession = sessions.find((s) => s.session_id === selectedSessionId);
  const telemetry = currentSession?.telemetry;
  const isSelectedSelf = selectedSessionId === mySessionId;

  // Save Custom Nickname
  const handleSaveNickname = async () => {
    if (!currentSession || !telemetry) return;
    const cleanName = nicknameInput.trim();
    const supabase = getTelemetrySupabase();
    if (!supabase) return;

    const updatedTelemetry = {
      ...telemetry,
      hardware: {
        ...telemetry.hardware,
        customName: cleanName || undefined,
        displayPillName: cleanName
          ? `${cleanName} (${telemetry.hardware.os})`
          : telemetry.hardware.displayPillName,
      },
    };

    if (currentSession.session_id === mySessionId) {
      setTesterCustomName(cleanName);
    }

    try {
      await supabase
        .from('tester_sessions')
        .update({ telemetry: updatedTelemetry })
        .eq('session_id', currentSession.session_id);

      setSessions((prev) =>
        prev.map((s) =>
          s.session_id === currentSession.session_id
            ? { ...s, telemetry: updatedTelemetry }
            : s
        )
      );
      setIsEditingName(false);
    } catch (err) {
      console.warn('Failed to save nickname:', err);
    }
  };

  // Send Direct Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId || !messageText.trim()) return;

    if (selectedSessionId === mySessionId) {
      setMessageStatus('Select a tester device above to send them a message.');
      return;
    }

    const supabase = getTelemetrySupabase();
    if (!supabase) return;

    setIsSendingMessage(true);
    setMessageStatus(null);

    const adminMsg: AdminMessage = {
      id: `msg_${Date.now()}`,
      text: messageText.trim(),
      sentAt: new Date().toISOString(),
    };

    markMessageSentByMe(adminMsg.id);

    try {
      const { error } = await supabase
        .from('tester_sessions')
        .update({ admin_message: adminMsg })
        .eq('session_id', selectedSessionId);

      if (!error) {
        setMessageStatus('Message sent live to tester device!');
        setMessageText('');
        setTimeout(() => setMessageStatus(null), 3500);
      } else {
        setMessageStatus('Failed to send message: ' + error.message);
      }
    } catch {
      setMessageStatus('Failed to deliver message.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Copy JSON Export
  const handleCopyJson = () => {
    if (!currentSession) return;
    navigator.clipboard.writeText(JSON.stringify(currentSession, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Download JSON file
  const handleDownloadJson = () => {
    if (!currentSession) return;
    const blob = new Blob([JSON.stringify(currentSession, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tewba_tester_${currentSession.session_id}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Dispatch Webhook (Discord / Slack)
  const handleSendWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim() || !currentSession || !telemetry) return;

    setIsSendingWebhook(true);
    setWebhookStatus(null);

    const name = telemetry.hardware.customName || currentSession.os;
    const gpu = telemetry.hardware.gpu || 'GPU';
    const ram = telemetry.hardware.memoryGb ? `${telemetry.hardware.memoryGb}GB RAM` : '';

    try {
      const isDiscord = webhookUrl.includes('discord.com');
      const vitalsInfo = telemetry.vitals
        ? `\n**Performance:** ${telemetry.vitals.currentFps} FPS (avg ${telemetry.vitals.avgFps}) • Heap: ${telemetry.vitals.usedJsHeapMb}MB • Freezes: ${telemetry.vitals.uiFreezesCount} (max ${telemetry.vitals.maxFreezeDurationMs}ms)`
        : '';
      const a11yInfo = telemetry.inputAndA11y
        ? `\n**Input/A11y:** Pointer: ${telemetry.inputAndA11y.pointerType} • Hover: ${telemetry.inputAndA11y.canHover ? 'Yes' : 'No'} • Reduced Motion: ${telemetry.inputAndA11y.prefersReducedMotion ? 'Yes' : 'No'}`
        : '';

      const payload = isDiscord
        ? {
            content: `📊 **TEWBA Tester Telemetry: ${name}**\n**Specs:** ${currentSession.os} • ${currentSession.browser} • ${gpu} • ${ram}\n**Active Time:** ${Math.floor(telemetry.time.activeReadingSeconds / 60)}m ${telemetry.time.activeReadingSeconds % 60}s\n**Tab Away:** ${Math.floor(telemetry.time.backgroundAwaySeconds / 60)}m (${telemetry.time.tabSwitchCount} switches)\n**Rage Clicks:** ${telemetry.rageClicksCount} | **Dead Clicks:** ${telemetry.deadClicksCount}\n**Scroll Depth:** ${telemetry.maxScrollDepthPercent}%\n**Current Route:** \`${telemetry.currentPath}\`${vitalsInfo}${a11yInfo}`,
          }
        : {
            text: `TEWBA Tester: ${name} (${currentSession.os} / ${gpu}) - Active: ${Math.floor(telemetry.time.activeReadingSeconds / 60)}m, Rage Clicks: ${telemetry.rageClicksCount}${vitalsInfo ? `, FPS: ${telemetry.vitals?.currentFps}` : ''}`,
          };

      await fetch(webhookUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors',
      });

      setWebhookStatus('Webhook dispatched successfully!');
      setTimeout(() => setWebhookStatus(null), 3500);
    } catch (err: any) {
      setWebhookStatus('Webhook error: ' + (err?.message || 'Check URL'));
    } finally {
      setIsSendingWebhook(false);
    }
  };

  // Delete Single Session
  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const supabase = getTelemetrySupabase();
    if (!supabase) return;

    await supabase.from('tester_sessions').delete().eq('session_id', sessionId);
    setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
    if (selectedSessionId === sessionId) {
      const remaining = sessions.filter((s) => s.session_id !== sessionId);
      setSelectedSessionId(remaining.length > 0 ? remaining[0].session_id : null);
    }
  };

  // Clear Inactive Sessions
  const handleClearInactive = async () => {
    const supabase = getTelemetrySupabase();
    if (!supabase) return;

    const cutoff = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    await supabase.from('tester_sessions').delete().lt('last_updated', cutoff);
    fetchSessions();
  };

  if (!isOpen) return null;

  // Render PIN Lock Screen if not unlocked
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
        <div className="bg-white dark:bg-[#0d121d] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-3">
            <Lock className="w-6 h-6" weight="bold" />
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Admin Telemetry HUD
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
            Enter admin security PIN to access live tester telemetry and device inspection.
          </p>

          <form onSubmit={handleUnlock} className="w-full space-y-3">
            <input
              type="password"
              inputMode="numeric"
              maxLength={12}
              placeholder="••••"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
              autoFocus
              className={`w-full h-11 text-center font-mono text-lg tracking-[0.35em] rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 transition-all ${
                pinError
                  ? 'border-red-500 focus:ring-red-500/20'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500/20 focus:border-emerald-500'
              }`}
            />

            {pinError && (
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                Incorrect PIN. Access Denied.
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-9 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!pinInput.trim()}
                className="flex-1 h-9 rounded-lg bg-[#1e4634] hover:bg-[#153426] disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Unlock HUD</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const isSessionActive = (lastUpdated: string) => {
    const diffSeconds = (Date.now() - new Date(lastUpdated).getTime()) / 1000;
    return diffSeconds <= 15;
  };

  const getDeviceIcon = (type: string) => {
    if (type === 'mobile') return <DeviceMobile className="w-4 h-4" />;
    if (type === 'tablet') return <DeviceTablet className="w-4 h-4" />;
    return <Desktop className="w-4 h-4" />;
  };

  // Filtered Clicks
  const clicks = telemetry?.clicks || [];
  const filteredClicks = clicks.filter((click) => {
    if (clickFilter === 'interactive' && click.isDead) return false;
    if (clickFilter === 'rage' && !click.isRage) return false;
    if (clickFilter === 'dead' && !click.isDead) return false;
    if (clickSearch.trim()) {
      const q = clickSearch.toLowerCase();
      return click.label.toLowerCase().includes(q) || click.tag.toLowerCase().includes(q);
    }
    return true;
  });

  const pageAttention = telemetry?.pageAttention || {};
  const pageEntries = Object.entries(pageAttention).sort((a, b) => b[1] - a[1]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs select-none">
      <div className="bg-white dark:bg-[#0d121d] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/40 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1e4634] text-white flex items-center justify-center">
              <Eye className="w-4 h-4" weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Live Multi-Device Tester Hub
                </h2>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-semibold">
                  Supabase Live Sync
                </span>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3" weight="bold" />
                  <span>Secured</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Hardware inspection, attention heatmap, click streams, rage clicks & direct messaging
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchSessions}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              title="Refresh Devices"
            >
              <ArrowsClockwise className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleLock}
              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              title="Lock HUD Session"
            >
              <Lock className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top Tester Device Switcher Bar (Rich Hardware Badges) */}
        <div className="px-5 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d121d] flex items-center justify-between gap-3 overflow-x-auto flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex-shrink-0 mr-1">
              Devices ({sessions.length}):
            </span>

            {sessions.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No tester devices connected yet.</span>
            ) : (
              sessions.map((s) => {
                const isSelected = selectedSessionId === s.session_id;
                const isMe = s.session_id === mySessionId;
                const active = isSessionActive(s.last_updated);
                const hw = s.telemetry?.hardware;
                const customName = hw?.customName;
                const gpuLabel = hw?.gpu && hw.gpu !== 'Standard GPU' ? hw.gpu : '';
                const ramLabel = hw?.memoryGb ? `${hw.memoryGb}GB` : '';

                return (
                  <button
                    key={s.session_id}
                    onClick={() => {
                      setSelectedSessionId(s.session_id);
                      setIsEditingName(false);
                      setNicknameInput(hw?.customName || '');
                    }}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 border ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500/60 text-[#1e4634] dark:text-emerald-300 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {getDeviceIcon(s.device_type)}
                      {customName ? (
                        <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                          <Sparkle className="w-3 h-3 text-amber-500" weight="fill" />
                          <span>{customName}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({s.os})</span>
                        </span>
                      ) : (
                        <span className="font-semibold flex items-center gap-1">
                          <span>{s.os}</span>
                          {(gpuLabel || ramLabel) && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({[gpuLabel, ramLabel].filter(Boolean).join(' • ')})
                            </span>
                          )}
                        </span>
                      )}
                    </span>

                    {isMe ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        You
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                        Tester
                      </span>
                    )}

                    <span
                      className={`w-2 h-2 rounded-full ${
                        active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                      }`}
                      title={active ? 'Active now' : 'Inactive'}
                    />

                    {!isMe && (
                      <span
                        onClick={(e) => handleDeleteSession(s.session_id, e)}
                        className="text-slate-400 hover:text-red-500 ml-1 p-0.5 rounded"
                        title="Remove session"
                      >
                        <X className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {sessions.length > 1 && (
            <button
              onClick={handleClearInactive}
              className="text-[11px] font-medium text-slate-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 flex-shrink-0 ml-2"
            >
              <Trash className="w-3 h-3" />
              <span>Clear Inactive</span>
            </button>
          )}
        </div>

        {/* Main Content Area */}
        {currentSession && telemetry ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Tester Nickname Banner */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Device Identifier:</span>
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nicknameInput}
                      onChange={(e) => setNicknameInput(e.target.value)}
                      placeholder="e.g. Mensur (Laptop)"
                      className="h-7 px-2 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveNickname}
                      className="px-2.5 h-7 bg-[#1e4634] text-white text-xs font-semibold rounded hover:bg-[#153426]"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="px-2 h-7 text-xs text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {telemetry.hardware.customName || 'Anonymous Tester'}
                    </span>
                    <button
                      onClick={() => {
                        setNicknameInput(telemetry.hardware.customName || '');
                        setIsEditingName(true);
                      }}
                      className="text-slate-400 hover:text-[#1e4634] dark:hover:text-emerald-400 p-1 rounded"
                      title="Rename Tester"
                    >
                      <PencilSimple className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-400 font-mono">
                Session ID: {currentSession.session_id}
              </div>
            </div>

            {/* 1. Top Analytics Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Active Reading Time
                </span>
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {Math.floor(telemetry.time.activeReadingSeconds / 60)}m {telemetry.time.activeReadingSeconds % 60}s
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  Total Session: {Math.floor(telemetry.time.totalDurationSeconds / 60)}m {telemetry.time.totalDurationSeconds % 60}s
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Tab Away (e.g. YouTube)
                </span>
                <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {Math.floor(telemetry.time.backgroundAwaySeconds / 60)}m {telemetry.time.backgroundAwaySeconds % 60}s
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {telemetry.time.tabSwitchCount} tab switches
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Rage Clicks
                </span>
                <span
                  className={`text-xl font-bold ${
                    telemetry.rageClicksCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {telemetry.rageClicksCount}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {telemetry.deadClicksCount} dead clicks
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Max Scroll Depth
                </span>
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {telemetry.maxScrollDepthPercent}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5 truncate font-mono">
                  Route: {telemetry.currentPath}
                </span>
              </div>
            </div>

            {/* 2. Live System Vitals & Performance Health (6 Advanced Browser Goldmines) */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4 space-y-3.5 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Lightning className="w-3.5 h-3.5" weight="fill" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider block">
                      Live System Vitals &amp; Browser Health
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Real-time FPS, Long-Tasks UI freeze detection, JS heap memory leak tracker, and input/a11y capabilities
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Metrics
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* 1. Real-time FPS & Smoothness */}
                {(() => {
                  const fps = telemetry.vitals?.currentFps ?? 60;
                  const avgFps = telemetry.vitals?.avgFps ?? 60;
                  const isSmooth = fps >= 55;
                  const isJank = fps < 30;

                  return (
                    <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Speedometer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-[11px] font-bold uppercase tracking-wider">Rendering FPS</span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            isSmooth
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : isJank
                              ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {isSmooth ? 'Buttery Smooth' : isJank ? 'Heavy Stutter' : 'Moderate Jank'}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                            {fps}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">FPS</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Avg: {avgFps} FPS
                        </span>
                      </div>

                      {/* Mini visual gauge bar */}
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isSmooth ? 'bg-emerald-500' : isJank ? 'bg-red-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.round((fps / 60) * 100))}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Main-Thread UI Freezes (Long Tasks API) */}
                {(() => {
                  const freezeCount = telemetry.vitals?.uiFreezesCount ?? 0;
                  const maxFreeze = telemetry.vitals?.maxFreezeDurationMs ?? 0;
                  const hasFreezes = freezeCount > 0;

                  return (
                    <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Pulse className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-[11px] font-bold uppercase tracking-wider">UI Freezes (&gt;50ms)</span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            hasFreezes
                              ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {hasFreezes ? `${freezeCount} Detected` : '0 Freezes (Fluid)'}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-1.5">
                          <span
                            className={`text-xl font-bold font-mono ${
                              hasFreezes ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {freezeCount}
                          </span>
                          <span className="text-xs text-slate-400">blocked events</span>
                        </div>
                        {hasFreezes ? (
                          <span className="text-[10px] text-red-600 dark:text-red-400 font-mono font-semibold">
                            Max: {maxFreeze}ms
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            No thread locks
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-slate-400 truncate">
                        {hasFreezes
                          ? `Long Task API flagged JS locking UI for up to ${maxFreeze}ms.`
                          : 'Main thread responsive for clicks & transitions.'}
                      </p>
                    </div>
                  );
                })()}

                {/* 3. Live JS Memory & Leak Tracker */}
                {(() => {
                  const usedMb = telemetry.vitals?.usedJsHeapMb ?? 0;
                  const limitMb = telemetry.vitals?.jsHeapLimitMb ?? 0;
                  const isChromium = usedMb > 0 || limitMb > 0;
                  const isHighUsage = usedMb > 400;

                  return (
                    <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-[11px] font-bold uppercase tracking-wider">JS Heap Memory</span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            !isChromium
                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                              : isHighUsage
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {!isChromium ? 'Safari/FF N/A' : isHighUsage ? 'Elevated Heap' : 'Healthy Heap'}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                            {isChromium ? usedMb : '—'}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {isChromium ? 'MB used' : 'Restricted'}
                          </span>
                        </div>
                        {isChromium && limitMb > 0 && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Limit: {limitMb} MB
                          </span>
                        )}
                      </div>

                      {/* Heap usage bar */}
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isHighUsage ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{
                            width:
                              isChromium && limitMb > 0
                                ? `${Math.min(100, Math.round((usedMb / limitMb) * 100))}%`
                                : '0%',
                          }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* 4. Hard Drive Storage Quota & Usage */}
                {(() => {
                  const usageMb = telemetry.vitals?.storageUsageMb ?? 0;
                  const quotaMb = telemetry.vitals?.storageQuotaMb ?? 0;
                  const quotaGb = quotaMb > 0 ? (quotaMb / 1024).toFixed(1) : '—';

                  return (
                    <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <HardDrives className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-[11px] font-bold uppercase tracking-wider">Browser Storage</span>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {quotaGb !== '—' ? `${quotaGb} GB Quota` : 'Available'}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                            {usageMb}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">MB indexed/cached</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400 truncate">
                        Local IndexedDB, cache &amp; offline quota headroom.
                      </p>
                    </div>
                  );
                })()}

                {/* 5. Pointer & Hover Capabilities */}
                {(() => {
                  const a11y = telemetry.inputAndA11y;
                  const isFine = a11y?.pointerType === 'fine';
                  const canHover = a11y?.canHover ?? true;

                  return (
                    <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          {canHover ? (
                            <MouseSimple className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <HandTap className="w-4 h-4 text-amber-500" />
                          )}
                          <span className="text-[11px] font-bold uppercase tracking-wider">Pointer &amp; Hover</span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            canHover
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {canHover ? 'Hover Capable' : 'Touch Only'}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {isFine ? 'Precision Mouse / Trackpad' : 'Touchscreen Finger'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          pointer: {a11y?.pointerType || 'fine'}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          hover: {canHover ? 'hover' : 'none'}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* 6. Accessibility & Contrast Preferences */}
                {(() => {
                  const a11y = telemetry.inputAndA11y;
                  const reducedMotion = a11y?.prefersReducedMotion ?? false;
                  const forcedColors = a11y?.forcedColorsHighContrast ?? false;

                  return (
                    <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <WheelchairMotion className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-[11px] font-bold uppercase tracking-wider">A11y Preferences</span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            reducedMotion || forcedColors
                              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {reducedMotion || forcedColors ? 'Custom A11y Active' : 'Default OS Styles'}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {reducedMotion ? 'Prefers Reduced Motion' : 'Standard Animations'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            reducedMotion
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {reducedMotion ? 'Reduced Motion: ON' : 'Motion: Standard'}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            forcedColors
                              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {forcedColors ? 'High Contrast: Active' : 'Colors: Default'}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* 3. Section Attention Breakdown & Features Explored */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Section Attention Breakdown */}
              <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#1e4634] dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      Section Attention Breakdown (Where did they spend time?)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Active: {Math.floor(telemetry.time.activeReadingSeconds / 60)}m
                  </span>
                </div>

                {pageEntries.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    Navigating between pages will populate route attention times here.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {pageEntries.map(([route, seconds]) => {
                      const mins = Math.floor(seconds / 60);
                      const secs = seconds % 60;
                      const isCurrent = route === telemetry.currentPath;

                      return (
                        <div
                          key={route}
                          className={`p-2.5 rounded-lg border text-xs transition-all ${
                            isCurrent
                              ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/60 shadow-2xs'
                              : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-[11px] font-semibold truncate text-slate-800 dark:text-slate-200">
                              {route === '/' ? '/dashboard' : route}
                            </span>
                            {isCurrent && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            )}
                          </div>
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block">
                            {mins > 0 ? `${mins}m ${secs}s` : `${secs}s`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Features Explored Checklist */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#1e4634] dark:text-emerald-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Feature Exploration
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {[
                    { label: 'Books Catalog', done: telemetry.featuresExplored?.browsedBooks },
                    { label: 'Series & Volumes', done: telemetry.featuresExplored?.viewedSeries },
                    { label: 'Categories Taxonomy', done: telemetry.featuresExplored?.viewedCategories },
                    { label: 'Author Directory', done: telemetry.featuresExplored?.viewedAuthors },
                    { label: 'Publisher Directory', done: telemetry.featuresExplored?.viewedPublishers },
                    { label: 'Theme Toggle (Dark/Light)', done: telemetry.featuresExplored?.usedThemeToggle },
                    { label: 'Catalog Search Bar', done: telemetry.featuresExplored?.usedSearch },
                  ].map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80 text-[11px]"
                    >
                      <span className="text-slate-600 dark:text-slate-300">{feat.label}</span>
                      {feat.done ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" weight="fill" />
                          <span>Visited</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Not Visited</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Click Stream & Direct Messaging Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Click Stream with Filters */}
              <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 overflow-hidden flex flex-col">
                <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Cursor className="w-4 h-4 text-[#1e4634] dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Chronological Click Stream ({filteredClicks.length} / {clicks.length})
                    </span>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1">
                    {[
                      { key: 'all', label: `All (${clicks.length})` },
                      { key: 'interactive', label: 'Interactive' },
                      { key: 'rage', label: `Rage (${telemetry.rageClicksCount})` },
                      { key: 'dead', label: `Dead (${telemetry.deadClicksCount})` },
                    ].map((btn) => (
                      <button
                        key={btn.key}
                        onClick={() => setClickFilter(btn.key as any)}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                          clickFilter === btn.key
                            ? 'bg-[#1e4634] text-white font-bold'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {filteredClicks.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No matching click actions logged for this filter.
                    </div>
                  ) : (
                    filteredClicks.map((click, i) => (
                      <div
                        key={i}
                        className={`px-4 py-2 flex items-center justify-between gap-3 ${
                          click.isRage
                            ? 'bg-red-50/60 dark:bg-red-950/40 text-red-900 dark:text-red-200'
                            : click.isDead
                            ? 'bg-amber-50/40 dark:bg-amber-950/20 text-slate-700 dark:text-slate-300'
                            : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex-shrink-0">
                            {click.tag}
                          </span>

                          <span className="truncate font-medium">
                            {click.label || '<unlabeled element>'}
                          </span>

                          {click.isRage && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-600 text-white flex-shrink-0">
                              Rage Click
                            </span>
                          )}

                          {click.isDead && (
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 flex-shrink-0">
                              Dead Click
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-shrink-0 font-mono">
                          {click.route && <span className="text-[10px] text-slate-500">{click.route}</span>}
                          <span>({click.x}, {click.y})</span>
                          <span>{new Date(click.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Direct Message & Rich Hardware Info */}
              <div className="space-y-4">
                {/* Direct Message Box */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <PaperPlaneTilt className="w-4 h-4 text-[#1e4634] dark:text-emerald-400" weight="bold" />
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Direct Message to Tester
                    </span>
                  </div>

                  {isSelectedSelf ? (
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                        <Info className="w-4 h-4 flex-shrink-0" weight="bold" />
                        <span>This is your own browser</span>
                      </div>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400">
                        Select a <strong>Tester</strong> device above to message them.
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Pushes a floating card onto this tester&apos;s screen.
                      </p>

                      <form onSubmit={handleSendMessage} className="space-y-2">
                        <textarea
                          rows={2}
                          placeholder="e.g. Try creating a book or series next!"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                        />

                        {messageStatus && (
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                            {messageStatus}
                          </p>
                        )}

                        <button
                          type="submit"
                          disabled={isSendingMessage || !messageText.trim()}
                          className="w-full h-8 bg-[#1e4634] hover:bg-[#153426] disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                        >
                          <PaperPlaneTilt className="w-3.5 h-3.5" />
                          <span>{isSendingMessage ? 'Sending...' : 'Send Live Message'}</span>
                        </button>
                      </form>
                    </>
                  )}
                </div>

                {/* Rich Hardware & System Specs */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Hardware & System Fingerprint
                    </span>
                    <Cpu className="w-4 h-4 text-slate-400" />
                  </div>

                  <div className="space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
                    <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">GPU / Graphics</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[180px]" title={telemetry.hardware.gpu}>
                        {telemetry.hardware.gpu}
                      </span>
                    </div>

                    <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">CPU & Memory</span>
                      <span className="font-semibold">
                        {telemetry.hardware.cpuCores ? `${telemetry.hardware.cpuCores} cores` : 'Multi-core'}
                        {telemetry.hardware.memoryGb ? ` • ${telemetry.hardware.memoryGb}GB RAM` : ''}
                      </span>
                    </div>

                    <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">Network Speed</span>
                      <span className="font-semibold flex items-center gap-1">
                        <WifiHigh className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{telemetry.hardware.networkType} ({telemetry.hardware.networkDownlink})</span>
                      </span>
                    </div>

                    <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">Timezone</span>
                      <span className="font-semibold flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[150px]">{telemetry.hardware.timezone}</span>
                      </span>
                    </div>

                    <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">Screen & Scaling</span>
                      <span className="font-mono">
                        {telemetry.hardware.screenWidth}x{telemetry.hardware.screenHeight} ({telemetry.hardware.pixelRatio}x DPR)
                      </span>
                    </div>

                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Touch Interface</span>
                      <span>
                        {telemetry.hardware.touchPoints > 0
                          ? `Touchscreen (${telemetry.hardware.touchPoints} pts)`
                          : 'Mouse / Trackpad'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Export & Webhook Dispatch Section */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Broadcast className="w-4 h-4 text-[#1e4634] dark:text-emerald-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Export & Webhook Dispatch
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyJson}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedJson ? 'Copied!' : 'Copy JSON'}</span>
                  </button>

                  <button
                    onClick={handleDownloadJson}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <DownloadSimple className="w-3.5 h-3.5" />
                    <span>Download .json</span>
                  </button>
                </div>
              </div>

              {/* Webhook input */}
              <form onSubmit={handleSendWebhook} className="flex gap-2">
                <input
                  type="url"
                  placeholder="Paste Discord / Slack / Zapier Webhook URL to dispatch session data..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="submit"
                  disabled={isSendingWebhook || !webhookUrl.trim()}
                  className="px-4 py-2 bg-[#1e4634] hover:bg-[#153426] disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Broadcast className="w-3.5 h-3.5" />
                  <span>{isSendingWebhook ? 'Sending...' : 'Send Webhook'}</span>
                </button>
              </form>

              {webhookStatus && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {webhookStatus}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <DeviceMobile className="w-12 h-12 mb-2 stroke-1" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No tester session selected
            </p>
            <p className="text-xs max-w-sm mt-1">
              Select an active device from the top bar to inspect live hardware specs, section attention, clicks, and send direct messages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

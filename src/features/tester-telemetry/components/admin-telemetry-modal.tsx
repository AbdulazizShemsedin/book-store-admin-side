'use client';

import React, { useState, useEffect } from 'react';
import { getTelemetrySupabase } from '../lib/supabase';
import { getOrCreateSessionId } from '../lib/device-info';
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
} from '@phosphor-icons/react';

export function AdminTelemetryModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<TesterSessionRow[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageStatus, setMessageStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mySessionId = typeof window !== 'undefined' ? getOrCreateSessionId() : '';

  // 1. Hotkey Listener: Ctrl+Shift+A or Cmd+Shift+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 2. Fetch Sessions from Supabase
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

        // Prefer auto-selecting another tester device instead of the admin's own device
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
    if (isOpen) {
      fetchSessions();
      // Auto poll every 4 seconds when modal is open
      const interval = setInterval(fetchSessions, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // 3. Send Direct Message to Selected Tester
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId || !messageText.trim()) return;

    // Guard against sending to self
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

    // Mark sent message so this client never pops up its own message
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

  // 4. Delete Single Session
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

  // 5. Clear Inactive Sessions
  const handleClearInactive = async () => {
    const supabase = getTelemetrySupabase();
    if (!supabase) return;

    const cutoff = new Date(Date.now() - 5 * 60 * 1000).toISOString(); // 5 min inactive
    await supabase.from('tester_sessions').delete().lt('last_updated', cutoff);
    fetchSessions();
  };

  if (!isOpen) return null;

  const currentSession = sessions.find((s) => s.session_id === selectedSessionId);
  const telemetry = currentSession?.telemetry;
  const isSelectedSelf = selectedSessionId === mySessionId;

  const isSessionActive = (lastUpdated: string) => {
    const diffSeconds = (Date.now() - new Date(lastUpdated).getTime()) / 1000;
    return diffSeconds <= 15;
  };

  const getDeviceIcon = (type: string) => {
    if (type === 'mobile') return <DeviceMobile className="w-4 h-4" />;
    if (type === 'tablet') return <DeviceTablet className="w-4 h-4" />;
    return <Desktop className="w-4 h-4" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
      <div className="bg-white dark:bg-[#0d121d] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/40 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1e4634] text-white flex items-center justify-center">
              <Eye className="w-4 h-4" weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Live Tester Telemetry & Intercom
                </h2>
                <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                  Ctrl+Shift+A
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Real-time multi-device hardware inspection, click streams & direct messaging
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchSessions}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              title="Refresh"
            >
              <ArrowsClockwise className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top Tester Device Switcher Bar */}
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

                return (
                  <button
                    key={s.session_id}
                    onClick={() => setSelectedSessionId(s.session_id)}
                    className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 border ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500/50 text-[#1e4634] dark:text-emerald-300 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      {getDeviceIcon(s.device_type)}
                      <span className="font-semibold">{s.os}</span>
                    </span>

                    {/* Badge clarifying if it is Admin (You) or a Tester */}
                    {isMe ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        This Device (You)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
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
          <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left 2 Columns: Analytics & Click Stream */}
            <div className="lg:col-span-2 space-y-4">
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Active Time
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {Math.floor(telemetry.time.activeReadingSeconds / 60)}m {telemetry.time.activeReadingSeconds % 60}s
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                    Total: {Math.floor(telemetry.time.totalDurationSeconds / 60)}m
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Tab Away
                  </span>
                  <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    {Math.floor(telemetry.time.backgroundAwaySeconds / 60)}m {telemetry.time.backgroundAwaySeconds % 60}s
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {telemetry.time.tabSwitchCount} tab switches
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Rage Clicks
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      telemetry.rageClicksCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {telemetry.rageClicksCount}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {telemetry.deadClicksCount} dead clicks
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Max Scroll Depth
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {telemetry.maxScrollDepthPercent}%
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                    {telemetry.currentPath}
                  </span>
                </div>
              </div>

              {/* Click Stream Log */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/60">
                  <div className="flex items-center gap-2">
                    <Cursor className="w-4 h-4 text-[#1e4634] dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Chronological Click Stream ({telemetry.clicks?.length || 0})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Latest at bottom</span>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {(!telemetry.clicks || telemetry.clicks.length === 0) ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No clicks recorded yet on this session.
                    </div>
                  ) : (
                    telemetry.clicks.map((click, i) => (
                      <div
                        key={i}
                        className={`px-4 py-2 flex items-center justify-between gap-3 ${
                          click.isRage
                            ? 'bg-red-50/50 dark:bg-red-950/30 text-red-900 dark:text-red-200'
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
                          <span>
                            ({click.x}, {click.y})
                          </span>
                          <span>{new Date(click.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Hardware Specs & Direct Message Intercom */}
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
                      You are viewing your own device. To message a tester, click their <strong>Tester</strong> pill in the top bar.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Pushes a quiet floating message card onto this tester&apos;s screen.
                    </p>

                    <form onSubmit={handleSendMessage} className="space-y-2">
                      <textarea
                        rows={3}
                        placeholder="e.g. Hey, please try creating a Series next!"
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

              {/* Hardware Specifications */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4 space-y-3 text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Hardware Specifications
                </span>

                <div className="space-y-2 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Device Type</span>
                    <span className="font-semibold capitalize">{telemetry.hardware.deviceType}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">OS / Platform</span>
                    <span className="font-semibold">{telemetry.hardware.os}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Browser</span>
                    <span className="font-semibold">{telemetry.hardware.browser}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Viewport</span>
                    <span className="font-mono">
                      {telemetry.hardware.viewportWidth} &times; {telemetry.hardware.viewportHeight}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Screen Resolution</span>
                    <span className="font-mono">
                      {telemetry.hardware.screenWidth} &times; {telemetry.hardware.screenHeight}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Pixel Ratio</span>
                    <span className="font-mono">{telemetry.hardware.pixelRatio}x</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <DeviceMobile className="w-12 h-12 mb-2 stroke-1" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No tester session selected
            </p>
            <p className="text-xs max-w-sm mt-1">
              Select an active device from the top bar to inspect live hardware specs, clicks, and send direct messages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

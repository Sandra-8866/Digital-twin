import React, { useEffect, useRef } from 'react';
import { useGovernanceStore } from '../store/governanceStore';
import { Terminal } from 'lucide-react';

export const LiveTelemetryFeed: React.FC = () => {
  const { logs } = useGovernanceStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Style log messages by type
  const getLogStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-emerald-600 font-medium';
      case 'warning':
        return 'text-amber-600 font-medium';
      case 'info':
      default:
        return 'text-indigo-600 font-medium';
    }
  };

  return (
    <div className="w-full h-full bg-white border border-slate-200 p-4.5 rounded-2xl flex flex-col justify-between shadow-xs select-none">
      {/* Title Bar */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Activity Monitor</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Sync Live</span>
        </div>
      </div>

      {/* Terminal View area */}
      <div className="flex-grow bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 overflow-y-auto h-[120px] md:h-[140px] flex flex-col gap-1.5 scrollbar-thin">
        {logs.length === 0 ? (
          <div className="text-[11px] text-slate-400 italic">No events logged. Select a region or navigate nodes to generate records.</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="text-[11px] leading-relaxed flex items-start gap-2">
              <span className="text-slate-400 font-mono select-none">[{log.timestamp}]</span>
              <span className="text-slate-600 flex-grow font-sans">
                {/* Clean up logs to look non-technical if they have brackets */}
                {log.message.replace('[SYS]', '').replace('[SYNC]', '').replace('[AUDIT]', '').replace('[PING]', '').trim()}
              </span>
              <span className={`text-[9px] uppercase font-mono tracking-wider ${getLogStyle(log.type)}`}>
                {log.type}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Status */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-3 border-t border-slate-100 pt-2.5 font-medium">
        <span>Directory Status: Synced</span>
        <span>Log Stream Connected</span>
      </div>
    </div>
  );
};

export default LiveTelemetryFeed;

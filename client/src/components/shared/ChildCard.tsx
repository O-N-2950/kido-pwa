import { motion } from 'framer-motion';
import { Battery, MapPin } from 'lucide-react';
import type { ChildState } from '../../lib/store';
import { TrustBadge } from './TrustBloom';
import { useStore } from '../../lib/store';

interface Props { child: ChildState; index: number; }

export function ChildCard({ child, index }: Props) {
  const { setSelectedChild, setActiveTab } = useStore();

  const handleClick = () => {
    setSelectedChild(child.id);
    setActiveTab('map');
  };

  // ETA countdown
  const etaLeft = child.activeCountdown
    ? Math.max(0, child.activeCountdown.etaMinutes - Math.floor((Date.now() - new Date(child.activeCountdown.startedAt).getTime()) / 60000))
    : null;

  return (
    <motion.button onClick={handleClick}
      initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y:-2, boxShadow:'0 8px 32px rgba(0,0,0,0.1)' }}
      whileTap={{ scale:0.98 }}
      className="w-full bg-white rounded-2xl p-4 shadow-card text-left transition-all"
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-teal-50 border border-teal-100">
            {child.avatar || '🧒'}
          </div>
          {/* Mood indicator */}
          {child.mood && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-[11px] shadow-sm border border-slate-100">
              {child.mood.emoji}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-base">{child.name}</span>
            {child.age && <span className="text-xs text-slate-400">{child.age} ans</span>}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={11} className="text-teal-600 flex-shrink-0" />
            <span className="text-xs text-slate-500 truncate">
              {child.lastLocation ? 'Position connue' : 'Pas de position'}
            </span>
          </div>
          <div className="mt-2">
            <TrustBadge score={child.trustScore} />
          </div>
        </div>

        {/* Right side */}
        <div className="flex-shrink-0 text-right">
          {etaLeft !== null ? (
            <div className="flex flex-col items-end">
              <span className="text-[11px] text-slate-400">rentre dans</span>
              <span className={`text-2xl font-black font-display leading-none ${etaLeft < 3 ? 'text-red-500' : 'text-teal-700'}`}>
                {etaLeft}
              </span>
              <span className="text-[10px] text-slate-400">min</span>
            </div>
          ) : (
            <div className="flex flex-col items-end gap-1">
              {child.battery !== undefined && (
                <div className={`flex items-center gap-0.5 text-xs ${child.battery < 25 ? 'text-amber-500' : 'text-slate-400'}`}>
                  <Battery size={11} />
                  <span>{child.battery}%</span>
                </div>
              )}
              {child.pendingNegotiations > 0 && (
                <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 font-semibold">
                  {child.pendingNegotiations} demande{child.pendingNegotiations > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Countdown bar */}
      {etaLeft !== null && child.activeCountdown && (
        <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full"
            style={{ background: etaLeft < 3 ? '#ef4444' : '#0D9488' }}
            initial={{ width:'100%' }}
            animate={{ width: `${(etaLeft / child.activeCountdown.etaMinutes) * 100}%` }}
            transition={{ duration:1 }}
          />
        </div>
      )}
    </motion.button>
  );
}

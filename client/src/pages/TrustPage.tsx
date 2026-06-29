import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrustBloom } from '../components/shared/TrustBloom';
import { useStore } from '../lib/store';
import { getTrustLevel, TRUST_LEVELS, TRUST_ACTIONS } from '@kido/shared';

export function TrustPage() {
  const { children } = useStore();
  const [selected, setSelected] = useState<string|null>(children[0]?.id ?? null);
  const child = children.find(c => c.id === selected);

  if (!child) return (
    <div className="flex items-center justify-center h-screen text-slate-400">
      <p>Aucun enfant à afficher</p>
    </div>
  );

  const level = getTrustLevel(child.trustScore);
  const def = TRUST_LEVELS[level];
  const levels = Object.values(TRUST_LEVELS);

  return (
    <div className="min-h-screen bg-cream">
      <div className="pt-safe bg-white border-b border-slate-100 px-5 pb-4">
        <h1 className="font-display text-2xl font-bold text-slate-900 mt-4">Confiance</h1>
        <p className="text-slate-400 text-sm">Plus ton enfant est fiable, plus il gagne de liberté</p>
      </div>

      {/* Child selector */}
      {children.length > 1 && (
        <div className="flex gap-2 px-4 pt-4 overflow-x-auto">
          {children.map(c => (
            <button key={c.id} onClick={() => setSelected(c.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-semibold flex-shrink-0 transition-all ${
                selected===c.id ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-100 bg-white text-slate-600'
              }`}>
              <span>{c.avatar}</span> {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="px-4 py-6">
        {/* Bloom hero */}
        <motion.div initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}}
          className="flex flex-col items-center mb-6">
          <TrustBloom score={child.trustScore} size={160} animated />
          <h2 className="font-display text-2xl font-bold text-slate-900 mt-4">{child.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg">{def.icon}</span>
            <span className="font-semibold text-slate-700">{def.label}</span>
          </div>
        </motion.div>

        {/* Perks unlocked */}
        <div className="bg-white rounded-2xl shadow-card p-4 mb-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Avantages débloqués</p>
          {def.perks.map(p => (
            <div key={p} className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                <span className="text-teal-600 text-[10px] font-bold">✓</span>
              </div>
              <span className="text-sm text-slate-700">{p}</span>
            </div>
          ))}
        </div>

        {/* All levels */}
        <div className="bg-white rounded-2xl shadow-card p-4 mb-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Parcours de confiance</p>
          {levels.map(l => {
            const active = child.trustScore >= l.min;
            const current = l.min === def.min;
            return (
              <div key={l.label} className={`flex items-center gap-3 mb-3 ${!active ? 'opacity-40' : ''}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${active ? 'bg-teal-50' : 'bg-slate-50'}`}>
                  {active ? l.icon : '🔒'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${active ? 'text-slate-800' : 'text-slate-400'}`}>{l.label}</span>
                    {current && <span className="text-[10px] bg-teal-100 text-teal-700 rounded-full px-2 py-0.5 font-bold">Actuel</span>}
                  </div>
                  <p className="text-xs text-slate-400">{l.perks[0]}</p>
                </div>
                <span className="text-xs text-slate-300">{l.min}–{l.max}</span>
              </div>
            );
          })}
        </div>

        {/* What earns points */}
        <div className="bg-white rounded-2xl shadow-card p-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Comment gagner des points</p>
          {Object.entries(TRUST_ACTIONS).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">{val.label}</span>
              <span className={`text-sm font-bold ${val.points > 0 ? 'text-teal-600' : 'text-red-500'}`}>
                {val.points > 0 ? `+${val.points}` : val.points}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

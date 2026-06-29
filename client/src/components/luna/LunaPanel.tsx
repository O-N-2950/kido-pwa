import { motion } from 'framer-motion';
import { X, Moon } from 'lucide-react';
import { useStore } from '../../lib/store';

export function LunaPanel() {
  const { setLunaOpen, children, alerts } = useStore();
  const lunaAlerts = alerts.filter(a => a.type === 'luna');

  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end"
      onClick={() => setLunaOpen(false)}>
      <motion.div
        initial={{ y:'100%' }} animate={{ y:0 }} transition={{ type:'spring', stiffness:300, damping:30 }}
        className="w-full bg-white rounded-t-3xl shadow-2xl p-6 pb-safe max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-2xl flex items-center justify-center">
              <Moon size={18} className="text-violet-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Luna</p>
              <p className="text-xs text-slate-400">Votre agent gardien IA</p>
            </div>
          </div>
          <button onClick={() => setLunaOpen(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
            <X size={14} />
          </button>
        </div>

        {lunaAlerts.length > 0 ? (
          lunaAlerts.map(a => (
            <div key={a.id} className="bg-violet-50 border border-violet-200 rounded-2xl p-4 mb-3">
              <p className="font-semibold text-violet-900 text-sm">{a.title}</p>
              {a.body && <p className="text-sm text-violet-700 mt-1 leading-relaxed">{a.body}</p>}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🌙</div>
            <p className="font-semibold text-slate-700">Tout va bien ce soir</p>
            <p className="text-sm text-slate-400 mt-1">Luna observe et vous alertera si nécessaire</p>
            {children.length > 0 && (
              <div className="mt-4 text-left">
                {children.map(c => (
                  <div key={c.id} className="flex items-center gap-3 bg-teal-50 rounded-xl p-3 mb-2">
                    <span className="text-xl">{c.avatar}</span>
                    <div>
                      <p className="text-sm font-semibold text-teal-800">{c.name}</p>
                      <p className="text-xs text-teal-600">Trust Score: {c.trustScore} · {c.trustLevel}</p>
                    </div>
                    {c.mood && <span className="ml-auto text-xl">{c.mood.emoji}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

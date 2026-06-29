import { motion } from 'framer-motion';
import { useStore } from '../lib/store';

const TYPE_META: Record<string,{icon:string;color:string}> = {
  sos:   { icon:'🆘', color:'#ef4444' },
  mood:  { icon:'😊', color:'#22c55e' },
  geo:   { icon:'📍', color:'#0891b2' },
  luna:  { icon:'🤖', color:'#7c3aed' },
  speed: { icon:'⚡', color:'#f59e0b' },
  arrived:{ icon:'✅', color:'#22c55e' },
};

export function AlertsPage() {
  const { alerts, markRead, clearAlerts } = useStore();
  const unread = alerts.filter(a => !a.read).length;

  return (
    <div className="min-h-screen bg-cream">
      <div className="pt-safe bg-white border-b border-slate-100 px-5 pb-4">
        <div className="flex items-center justify-between mt-4">
          <h1 className="font-display text-2xl font-bold text-slate-900">Alertes</h1>
          {unread > 0 && (
            <button onClick={() => alerts.forEach(a=>markRead(a.id))}
              className="text-xs text-teal-600 font-semibold">Tout lire</button>
          )}
        </div>
      </div>
      <div className="px-4 py-4 pb-24">
        {alerts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🔔</div>
            <p className="font-display text-lg font-bold text-slate-700">Tout est calme</p>
            <p className="text-sm text-slate-400 mt-1">Les alertes apparaissent ici en temps réel</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {alerts.map((a, i) => {
                const meta = TYPE_META[a.type] || {icon:'⚡',color:'#0891b2'};
                return (
                  <motion.div key={a.id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}
                    onClick={() => markRead(a.id)}
                    className={`bg-white rounded-2xl shadow-card px-4 py-3 flex gap-3 cursor-pointer ${
                      a.type==='sos' ? 'border-2 border-red-300' : ''
                    }`}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: meta.color+'15' }}>
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${a.read?'text-slate-500':'text-slate-800 font-semibold'}`}>{a.title}</p>
                      {a.body && <p className="text-xs text-slate-400 mt-0.5">{a.body}</p>}
                      <p className="text-xs text-slate-300 mt-1">{new Date(a.at).toLocaleString('fr',{hour:'2-digit',minute:'2-digit',day:'numeric',month:'short'})}</p>
                    </div>
                    {!a.read && <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{background:meta.color}} />}
                  </motion.div>
                );
              })}
            </div>
            <button onClick={clearAlerts} className="mt-4 w-full text-xs text-slate-300 py-2">Effacer tout</button>
          </>
        )}
      </div>
    </div>
  );
}

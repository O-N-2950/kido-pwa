// ============================================================
// VIVOKID — Parent Home Dashboard
// ============================================================
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Moon, Sparkles } from 'lucide-react';
import { useStore } from '../lib/store';
import { ChildCard } from '../components/shared/ChildCard';
import { useFamily } from '../hooks/useFamily';

const GREETINGS = ['Bonjour', 'Buongiorno', 'Guten Morgen', 'Good morning'];

export function ParentHome() {
  const { user, children, alerts, setActiveTab, setLunaOpen } = useStore();
  const [greet] = useState(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
  const unread = alerts.filter(a => !a.read).length;
  const sosAlerts = alerts.filter(a => a.type === 'sos' && !a.read);
  useFamily();

  const hour = new Date().getHours();
  const timeGreet = hour < 12 ? greet : hour < 18 ? 'Bonjour' : 'Bonsoir';
  const allSafe = children.every(c => !alerts.some(a => a.childId === c.id && a.type === 'sos' && !a.read));

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      {/* Header */}
      <div className="pt-safe px-5 pb-4 bg-white border-b border-slate-100">
        <div className="flex items-start justify-between mt-3">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{timeGreet}</p>
            <h1 className="font-display text-2xl font-bold text-slate-900 leading-tight">
              {user?.name?.split(' ')[0]} <span className="text-teal-600">👋</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={() => setActiveTab('alerts')}
              className="relative w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
              <Bell size={18} className="text-slate-600" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Family status pill */}
        <motion.div
          animate={{ scale: allSafe ? 1 : [1,1.02,1], transition:{repeat:allSafe?0:Infinity,duration:1.5} }}
          className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold ${
            allSafe ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-700'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${allSafe ? 'bg-teal-500 pulse-glow' : 'bg-red-500'}`} />
          {allSafe ? `${children.length} enfant${children.length > 1?'s':''} en sécurité · LIVE` : '🆘 Alerte active'}
        </motion.div>
      </div>

      {/* SOS Banner */}
      <AnimatePresence>
        {sosAlerts.length > 0 && (
          <motion.div
            initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
            exit={{ height:0, opacity:0 }}
            className="bg-red-500 text-white px-5 py-3 flex items-center gap-3">
            <span className="text-2xl">🆘</span>
            <div className="flex-1">
              <p className="font-bold">ALERTE SOS DISCRÈTE</p>
              <p className="text-red-100 text-sm">Votre enfant a besoin de vous maintenant</p>
            </div>
            <button onClick={() => setActiveTab('map')}
              className="bg-white text-red-600 px-3 py-1.5 rounded-lg text-sm font-bold">
              Voir
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 px-4 py-5 pb-24 overflow-y-auto">
        {/* Luna suggestion */}
        <motion.button
          initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
          onClick={() => setLunaOpen(true)}
          className="w-full mb-4 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-2xl p-4 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Moon size={18} className="text-violet-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-violet-500 font-semibold uppercase tracking-wider">Luna · Agent gardien</p>
              <p className="text-sm font-semibold text-violet-900">Rapport de ce soir disponible</p>
            </div>
            <Sparkles size={16} className="text-violet-400" />
          </div>
        </motion.button>

        {/* Children */}
        <div className="mb-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Mes enfants</h2>
          <div className="flex flex-col gap-3">
            {children.length > 0
              ? children.map((c,i) => <ChildCard key={c.id} child={c} index={i} />)
              : <EmptyChildren />}
          </div>
        </div>

        {/* Recent feed */}
        {alerts.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Récent</h2>
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              {alerts.slice(0,5).map((a,i) => (
                <div key={a.id} className={`px-4 py-3 flex gap-3 items-start ${i>0?'border-t border-slate-50':''}`}>
                  <span className="text-lg flex-shrink-0">
                    {a.type==='sos'?'🆘':a.type==='mood'?'😊':a.type==='geo'?'📍':a.type==='luna'?'🤖':'⚡'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${a.read?'text-slate-500':'text-slate-800 font-medium'}`}>{a.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(a.at).toLocaleTimeString('fr',{hour:'2-digit',minute:'2-digit'})}</p>
                  </div>
                  {!a.read && <div className="w-2 h-2 bg-teal-500 rounded-full mt-1.5 flex-shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyChildren() {
  const { setActiveTab } = useStore();
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center py-12">
      <div className="text-5xl mb-3">👨‍👩‍👧</div>
      <h3 className="font-display text-lg font-bold text-slate-800">Ajoutez votre premier enfant</h3>
      <p className="text-sm text-slate-500 mt-1 mb-4">Créez ensemble votre premier Pacte Familial</p>
      <button onClick={() => setActiveTab('account')} className="bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold">
        Ajouter un enfant
      </button>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { Home, Map, Star, Bell, User } from 'lucide-react';
import { useStore } from '../../lib/store';

const TABS = [
  { id:'home',   icon:Home,  label:'Accueil' },
  { id:'map',    icon:Map,   label:'Carte'   },
  { id:'trust',  icon:Star,  label:'Confiance' },
  { id:'alerts', icon:Bell,  label:'Alertes' },
  { id:'account',icon:User,  label:'Compte'  },
];

export function BottomNav() {
  const { activeTab, setActiveTab, alerts } = useStore();
  const unread = alerts.filter(a => !a.read).length;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe">
      <div className="bg-white border-t border-slate-100 shadow-[0_-2px_16px_rgba(0,0,0,0.06)]">
        <div className="flex">
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex flex-col items-center gap-0.5 py-2.5 relative"
                style={{ WebkitTapHighlightColor: 'transparent' }}>
                {tab.id === 'alerts' && unread > 0 && (
                  <span className="absolute top-1.5 right-[calc(50%-10px)] w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
                <motion.div
                  animate={{ scale: active ? 1 : 0.9, y: active ? -1 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.8}
                    color={active ? '#0D9488' : '#94A3B8'} />
                </motion.div>
                <span className="text-[10px] font-semibold leading-none" style={{ color: active ? '#0D9488' : '#94A3B8' }}>
                  {tab.label}
                </span>
                {active && (
                  <motion.div layoutId="tab-dot"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-teal-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

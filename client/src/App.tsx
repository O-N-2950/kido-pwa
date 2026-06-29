// ============================================================
// VIVOKID — App Router
// ============================================================
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './lib/store';
import { Login } from './pages/Login';
import { ParentHome } from './pages/ParentHome';
import { ChildApp } from './pages/ChildApp';
import { TrustPage } from './pages/TrustPage';
import { AlertsPage } from './pages/AlertsPage';
import { MapPage } from './pages/MapPage';
import { BottomNav } from './components/shared/BottomNav';
import { LunaPanel } from './components/luna/LunaPanel';

export default function App() {
  const { user, activeTab, lunaOpen } = useStore();

  // GPS tracking for children
  useEffect(() => {
    if (!user || user.role !== 'child') return;
    const wid = navigator.geolocation?.watchPosition(
      pos => {
        fetch('/api/location', {
          method: 'POST',
          headers: { 'Content-Type':'application/json', Authorization:`Bearer ${localStorage.getItem('vk_token')}` },
          body: JSON.stringify({
            lat: pos.coords.latitude, lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy, speed: pos.coords.speed,
            heading: pos.coords.heading, recordedAt: new Date().toISOString(),
          }),
        }).catch(console.error);
      },
      null,
      { enableHighAccuracy: true, maximumAge: 30000 },
    );
    return () => { if (wid) navigator.geolocation.clearWatch(wid); };
  }, [user]);

  if (!user) return <Login />;

  // Child view — simple single screen
  if (user.role === 'child') return <ChildApp />;

  // Parent view — tabbed
  const PAGES: Record<string, JSX.Element> = {
    home:    <ParentHome />,
    map:     <MapPage />,
    trust:   <TrustPage />,
    alerts:  <AlertsPage />,
    account: <AccountPage />,
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div key={activeTab}
          initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-8 }}
          transition={{ duration: 0.18, ease:'easeOut' }}
          className="pb-20">
          {PAGES[activeTab] ?? <ParentHome />}
        </motion.div>
      </AnimatePresence>
      <BottomNav />
      {lunaOpen && <LunaPanel />}
    </div>
  );
}

// Simple account page
function AccountPage() {
  const { user, clearAuth } = useStore();
  return (
    <div className="min-h-screen bg-cream px-4 pt-safe">
      <div className="bg-white rounded-3xl shadow-card p-6 mt-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">
            {user?.avatar || '👤'}
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900">{user?.name}</h2>
          <p className="text-sm text-slate-400 mt-1">Compte parent · VIVOkid</p>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-100">
          <button onClick={clearAuth}
            className="w-full py-3 border-2 border-red-200 text-red-500 rounded-xl font-semibold text-sm">
            Se déconnecter
          </button>
        </div>
      </div>
      <p className="text-xs text-center text-slate-300 mt-6">vivokid.ch · PEP's Swiss SA 🇨🇭</p>
    </div>
  );
}

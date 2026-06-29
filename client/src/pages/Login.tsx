import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { useStore } from '../lib/store';

export function Login() {
  const { setAuth } = useStore();
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [form, setForm] = useState({ parentName:'', email:'', password:'', familyName:'', role:'parent' as 'parent'|'child', pin:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setLoading(true); setError('');
    try {
      if (mode === 'register') {
        const res = await api.post<{data:{accessToken:string;user:any}}>('/auth/register', {
          parentName: form.parentName, email: form.email, password: form.password,
          familyName: form.familyName, consentCGU: true,
        });
        setAuth(res.data.user, res.data.accessToken);
      } else {
        const res = await api.post<{data:{accessToken:string;user:any}}>('/auth/login', {
          email: form.email, password: form.password,
        });
        setAuth(res.data.user, res.data.accessToken);
      }
    } catch(e:any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-5">
      {/* Logo */}
      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}}
        className="text-center mb-8">
        <div className="w-20 h-20 bg-teal-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-3 shadow-teal">
          🛡️
        </div>
        <h1 className="font-display text-3xl font-black text-slate-900">VIVOkid</h1>
        <p className="text-slate-400 text-sm mt-1">La famille, connectée avec confiance</p>
      </motion.div>

      {/* Card */}
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
        className="w-full max-w-sm bg-white rounded-3xl shadow-card p-6">
        
        {/* Tabs */}
        <div className="flex bg-slate-50 rounded-xl p-1 mb-6">
          {(['login','register'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode===m?'bg-white text-slate-900 shadow-sm':'text-slate-400'}`}>
              {m==='login' ? 'Connexion' : 'Créer un compte'}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {mode === 'register' && (
            <>
              <input value={form.familyName} onChange={e=>setForm(f=>({...f,familyName:e.target.value}))}
                placeholder="Nom de famille (ex: Famille Martin)"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-500 transition-colors" />
              <input value={form.parentName} onChange={e=>setForm(f=>({...f,parentName:e.target.value}))}
                placeholder="Votre prénom"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-500 transition-colors" />
            </>
          )}
          <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}
            placeholder="Adresse e-mail"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-500 transition-colors" />
          <input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}
            placeholder={mode==='login' ? 'Mot de passe' : 'Mot de passe (8 caractères min.)'}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-500 transition-colors" />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <motion.button onClick={submit} disabled={loading} whileTap={{scale:0.98}}
            className="w-full bg-teal-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-teal transition-opacity"
            style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? '...' : mode==='login' ? 'Se connecter' : 'Créer mon compte'}
          </motion.button>
        </div>

        {mode==='register' && (
          <p className="text-xs text-slate-400 text-center mt-4 leading-relaxed">
            En créant un compte, vous acceptez nos <a href="https://vivokid.ch/cgv" className="text-teal-600 underline">conditions d'utilisation</a>.
            Données hébergées en Suisse 🇨🇭
          </p>
        )}
      </motion.div>

      <p className="text-xs text-slate-300 mt-6">vivokid.ch · PEP's Swiss SA · Jura, Suisse</p>
    </div>
  );
}

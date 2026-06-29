import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../lib/store';

export function MapPage() {
  const { children, selectedChildId, setSelectedChild } = useStore();
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 1500);
    return () => clearInterval(t);
  }, []);

  const active = children.find(c => c.id === selectedChildId) ?? children[0];

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <div className="pt-safe bg-white border-b border-slate-100 px-5 pb-4">
        <h1 className="font-display text-2xl font-bold text-slate-900 mt-4">Carte</h1>
      </div>

      {/* Fake live map */}
      <div className="relative mx-4 mt-4 rounded-3xl overflow-hidden shadow-card" style={{ height: 280 }}>
        <div className="absolute inset-0" style={{background:'linear-gradient(160deg,#1a2e4a 0%,#0f1e35 60%,#162540 100%)'}}>
          {[...Array(8)].map((_,i)=>(
            <div key={i} style={{position:'absolute',left:`${i*13}%`,top:0,bottom:0,width:1,background:'rgba(255,255,255,0.04)'}} />
          ))}
          {[...Array(6)].map((_,i)=>(
            <div key={i} style={{position:'absolute',top:`${i*18}%`,left:0,right:0,height:1,background:'rgba(255,255,255,0.04)'}} />
          ))}
          {/* Roads */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M10,70 Q40,50 60,40 Q75,32 90,28" stroke="#1e3a5f" strokeWidth="2" fill="none"/>
            <path d="M10,70 Q40,50 60,40 Q75,32 90,28" stroke={active ? '#0D9488' : '#3b82f6'} strokeWidth="1" fill="none" strokeDasharray="3,4" opacity="0.6"/>
          </svg>
        </div>

        {/* Child markers */}
        {children.map((c, i) => (
          <button key={c.id} onClick={() => setSelectedChild(c.id)}
            style={{position:'absolute', left:`${20+i*35}%`, top:`${35+i*15}%`, transform:'translate(-50%,-50%)', zIndex:2}}>
            <div style={{
              width:44, height:44, borderRadius:'50%',
              background: c.id===active?.id ? '#0D9488' : '#3b82f6',
              border:'3px solid white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20,
              boxShadow: c.id===active?.id && pulse ? '0 0 0 10px rgba(13,148,136,.3)' : 'none',
              transition:'box-shadow .6s',
            }}>{c.avatar||'🧒'}</div>
            <div style={{background:'rgba(0,0,0,.8)',color:'white',borderRadius:8,padding:'2px 8px',fontSize:11,fontWeight:600,textAlign:'center',marginTop:4,whiteSpace:'nowrap'}}>
              {c.name}
            </div>
          </button>
        ))}

        <div style={{position:'absolute',top:12,right:12,background:'rgba(0,0,0,.6)',borderRadius:20,padding:'4px 10px',display:'flex',alignItems:'center',gap:6}}>
          <div style={{width:7,height:7,borderRadius:'50%',background:'#22c55e',boxShadow:pulse?'0 0 6px #22c55e':'none',transition:'box-shadow .6s'}} />
          <span style={{fontSize:10,color:'#22c55e',fontWeight:700}}>GPS LIVE</span>
        </div>
      </div>

      {/* Selected child detail */}
      {active && (
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
          className="mx-4 mt-4 bg-white rounded-2xl shadow-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-2xl">{active.avatar||'🧒'}</div>
            <div className="flex-1">
              <p className="font-bold text-slate-900">{active.name}</p>
              <p className="text-xs text-slate-400">📍 {active.lastLocation ? 'Position connue · Mise à jour en cours' : 'En attente de position'}</p>
            </div>
            {active.mood && <div className="text-2xl">{active.mood.emoji}</div>}
          </div>
        </motion.div>
      )}

      {/* Child selector */}
      {children.length > 1 && (
        <div className="flex gap-2 px-4 mt-3 overflow-x-auto pb-2">
          {children.map(c => (
            <button key={c.id} onClick={() => setSelectedChild(c.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-semibold flex-shrink-0 transition-all ${
                c.id===active?.id ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-100 bg-white text-slate-500'
              }`}>
              <span>{c.avatar}</span> {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

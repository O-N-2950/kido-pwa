// ============================================================
// VIVOKID — Child Interface
// Simple, warm, joyful. 3 taps max for any action.
// ============================================================
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, PhoneCall } from 'lucide-react';
import { api } from '../lib/api';
import { useStore } from '../lib/store';
import { MOOD_MAP } from '@kido/shared';

const MOODS = [1,2,3,4,5] as const;
const CHECKINS = [
  { type:'ok' as const,       label:'Je vais bien',     emoji:'✅' },
  { type:'arriving' as const, label:'Je rentre',         emoji:'🏠' },
  { type:'late' as const,     label:'Je suis en retard', emoji:'⏳' },
  { type:'callback' as const, label:'Rappelle-moi',      emoji:'📞' },
];
const ETAS = [
  { mins:10, label:'10 min', emoji:'🚶' },
  { mins:20, label:'20 min', emoji:'🚶' },
  { mins:30, label:'30 min', emoji:'🚌' },
  { mins:60, label:'1 heure', emoji:'🚌' },
];

export function ChildApp() {
  const { user } = useStore();
  const [moodSent, setMoodSent] = useState<number|null>(null);
  const [etaSent, setEtaSent] = useState<number|null>(null);
  const [checkinSent, setCheckinSent] = useState<string|null>(null);
  const [sosActive, setSosActive] = useState(false);
  const [sosCount, setSosCount] = useState(3);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState<string|null>(null);
  const sosTimerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const mediaRef = useRef<MediaRecorder|null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // ── Mood ────────────────────────────────────────────────────
  const sendMood = async (v: number) => {
    await api.post('/child/mood', { value: v });
    setMoodSent(v);
  };

  // ── Check-in ────────────────────────────────────────────────
  const sendCheckin = async (type: string, etaMins?: number) => {
    await api.post('/child/checkin', { type, etaMinutes: etaMins });
    if (etaMins) setEtaSent(etaMins);
    else setCheckinSent(type);
  };

  // ── SOS discret ─────────────────────────────────────────────
  const startSos = () => {
    setSosActive(true); setSosCount(3);
    sosTimerRef.current = setInterval(() => {
      setSosCount(c => {
        if (c <= 1) {
          clearInterval(sosTimerRef.current!);
          setSosActive(false); setSosTriggered(true);
          // Get position and send
          navigator.geolocation?.getCurrentPosition(pos => {
            api.post('/child/sos', { type:'button', lat:pos.coords.latitude, lng:pos.coords.longitude });
          }, () => api.post('/child/sos', { type:'button' }));
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };
  const cancelSos = () => {
    clearInterval(sosTimerRef.current!);
    setSosActive(false); setSosCount(3);
  };

  // ── Voice check-in ───────────────────────────────────────────
  const startVoice = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream, { mimeType:'audio/webm' });
    chunksRef.current = [];
    rec.ondataavailable = e => chunksRef.current.push(e.data);
    rec.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type:'audio/webm' });
      const form = new FormData(); form.append('audio', blob, 'voice.webm');
      try {
        const res = await api.postForm<{data:{transcript:string;parsed:{message:string;etaMinutes?:number}}}>('/voice/checkin', form);
        setTranscript(res.data.transcript);
        if (res.data.parsed.etaMinutes) setEtaSent(res.data.parsed.etaMinutes);
      } catch { setTranscript('Message envoyé ✅'); }
      stream.getTracks().forEach(t => t.stop());
    };
    mediaRef.current = rec;
    rec.start();
    setRecording(true);
  }, []);

  const stopVoice = useCallback(() => {
    mediaRef.current?.stop();
    setRecording(false);
  }, []);

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <div className="pt-safe bg-white border-b border-slate-100 px-5 pb-4">
        <div className="mt-3 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-2xl">
            {user?.avatar || '🧒'}
          </div>
          <div>
            <p className="font-display text-xl font-bold text-slate-900">Salut {user?.name?.split(' ')[0]} !</p>
            <p className="text-xs text-slate-400">Tes parents te voient en sécurité</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 bg-teal-50 px-2.5 py-1.5 rounded-xl">
            <div className="w-2 h-2 bg-teal-500 rounded-full pulse-glow" />
            <span className="text-xs text-teal-700 font-semibold">LIVE</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 pb-8">

        {/* MOOD CHECK-IN */}
        <section className="mb-5">
          <h2 className="font-display text-lg font-bold text-slate-800 mb-1">Comment tu te sens ?</h2>
          <p className="text-xs text-slate-400 mb-3">Tes parents voient ton humeur — mais pas sur la carte</p>
          <div className="flex gap-2 justify-between">
            {MOODS.map(v => {
              const m = MOOD_MAP[v];
              const selected = moodSent === v;
              return (
                <motion.button key={v} onClick={() => sendMood(v)}
                  whileTap={{ scale:0.9 }}
                  className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-all"
                  style={{ borderColor: selected ? m.color : '#E2E8F0', background: selected ? m.color+'18' : 'white' }}>
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[10px] font-semibold" style={{ color: selected ? m.color : '#94a3b8' }}>
                    {m.label.split(' ')[0]}
                  </span>
                </motion.button>
              );
            })}
          </div>
          <AnimatePresence>
            {moodSent && (
              <motion.p initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                className="text-xs text-teal-600 font-semibold mt-2 text-center">
                ✅ Humeur envoyée à tes parents
              </motion.p>
            )}
          </AnimatePresence>
        </section>

        {/* VOICE CHECK-IN */}
        <section className="mb-5">
          <div className="bg-white rounded-2xl shadow-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                <Mic size={16} className="text-teal-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">Check-in vocal 🎙️</p>
                <p className="text-xs text-slate-400">Dis "Je rentre dans 20 min" — Luna comprend</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!recording && !transcript ? (
                <motion.button key="start" onClick={startVoice}
                  whileTap={{ scale:0.96 }}
                  className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                  <Mic size={16} /> Parler maintenant
                </motion.button>
              ) : recording ? (
                <motion.button key="stop" onClick={stopVoice}
                  initial={{scale:0.9}} animate={{scale:1}}
                  whileTap={{ scale:0.96 }}
                  className="w-full py-3 bg-red-500 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                  <MicOff size={16} className="animate-pulse" /> Terminer
                </motion.button>
              ) : (
                <motion.div key="result" initial={{opacity:0}} animate={{opacity:1}}
                  className="bg-teal-50 rounded-xl p-3 text-sm text-teal-800">
                  ✅ {transcript}
                  <button onClick={() => setTranscript(null)} className="block text-xs text-teal-500 mt-1">Nouveau message</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ETA / COUNTDOWN */}
        <section className="mb-5">
          <div className="bg-white rounded-2xl shadow-card p-4">
            <p className="font-semibold text-slate-800 text-sm mb-1">⏱️ Je rentre dans...</p>
            <p className="text-xs text-slate-400 mb-3">Tes parents voient un timer en direct</p>
            {!etaSent ? (
              <div className="grid grid-cols-2 gap-2">
                {ETAS.map(e => (
                  <motion.button key={e.mins} whileTap={{scale:0.96}}
                    onClick={() => sendCheckin('arriving', e.mins)}
                    className="flex items-center gap-2 py-3 px-4 border-2 border-slate-100 rounded-xl text-sm font-semibold text-slate-700 hover:border-teal-300 hover:bg-teal-50 transition-all">
                    <span>{e.emoji}</span> {e.label}
                  </motion.button>
                ))}
              </div>
            ) : (
              <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}}
                className="text-center py-2">
                <div className="text-4xl font-black font-display text-teal-700">{etaSent}'</div>
                <p className="text-xs text-teal-600 font-semibold">Timer en cours chez tes parents</p>
                <button onClick={() => { setEtaSent(null); api.post('/child/checkin',{type:'ok'}); }}
                  className="mt-2 text-xs text-teal-500 underline">Je suis arrivé(e)</button>
              </motion.div>
            )}
          </div>
        </section>

        {/* QUICK CHECK-INS */}
        <section className="mb-5">
          <div className="bg-white rounded-2xl shadow-card p-4">
            <p className="font-semibold text-slate-800 text-sm mb-3">✅ Message rapide</p>
            <div className="flex flex-col gap-2">
              {CHECKINS.filter(c=>c.type!=='arriving').map(c => (
                <motion.button key={c.type} whileTap={{scale:0.97}}
                  onClick={() => sendCheckin(c.type)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-semibold text-left transition-all ${
                    checkinSent===c.type ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-slate-100 text-slate-700'
                  }`}>
                  <span className="text-lg">{c.emoji}</span> {c.label}
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* SOS DISCRET */}
        <section>
          <div className="bg-white rounded-2xl shadow-card p-4">
            <p className="text-xs text-slate-400 text-center mb-4 font-medium">
              🤫 <strong>SOS Discret</strong> — alerte silencieuse à tes parents<br/>
              Rien n'apparaît sur ton écran côté extérieur
            </p>

            <AnimatePresence mode="wait">
              {sosTriggered ? (
                <motion.div key="triggered" initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}}
                  className="text-center py-4">
                  <div className="text-4xl mb-2">🆘</div>
                  <p className="font-bold text-red-600">Alerte envoyée</p>
                  <p className="text-sm text-slate-500 mt-1">Tes parents ont reçu l'alerte</p>
                  <button onClick={() => setSosTriggered(false)} className="mt-3 text-xs text-slate-400 underline">Reset</button>
                </motion.div>
              ) : !sosActive ? (
                <motion.button key="idle"
                  onPointerDown={startSos}
                  onPointerUp={cancelSos}
                  onPointerLeave={cancelSos}
                  className="w-full py-4 border-2 border-red-300 rounded-2xl text-red-500 font-bold text-sm flex items-center justify-center gap-2">
                  <PhoneCall size={16} /> Maintenir pour SOS
                </motion.button>
              ) : (
                <motion.div key="counting"
                  className="w-full py-4 bg-red-500 rounded-2xl text-white font-black text-3xl flex items-center justify-center"
                  animate={{ scale:[1,1.05,1], transition:{repeat:Infinity,duration:0.8} }}>
                  {sosCount}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

      </div>
    </div>
  );
}

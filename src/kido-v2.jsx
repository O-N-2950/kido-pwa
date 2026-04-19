import { useState, useEffect, useRef, useCallback } from "react";

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const T = {
  bg:       "#08090f",
  surface:  "#0f1117",
  card:     "#14171f",
  border:   "#1e2330",
  borderHi: "#2a3045",
  amber:    "#f59e0b",
  amberDim: "#92400e",
  teal:     "#14b8a6",
  rose:     "#f43f5e",
  sky:      "#38bdf8",
  violet:   "#7c3aed",
  green:    "#22c55e",
  text:     "#f1f5f9",
  sub:      "#94a3b8",
  muted:    "#475569",
  font:     "'Outfit', 'Segoe UI', sans-serif",
  display:  "'Fraunces', 'Georgia', serif",
};

/* ─── TINY HELPERS ───────────────────────────────────────────── */
const cx = (...cls) => cls.filter(Boolean).join(" ");
const Pill = ({ color=T.teal, children, sm }) => (
  <span style={{ background: color+"22", color, border:`1px solid ${color}44`,
    borderRadius:99, padding: sm?"2px 8px":"3px 12px", fontSize: sm?10:12, fontWeight:700, lineHeight:1.4 }}>
    {children}
  </span>
);
const Card = ({ children, style={}, glow }) => (
  <div style={{ background:T.card, border:`1px solid ${glow?T.borderHi:T.border}`,
    borderRadius:20, padding:20,
    boxShadow: glow?`0 0 0 1px ${glow}33, 0 8px 32px ${glow}18`:"none",
    ...style }}>
    {children}
  </div>
);
const Btn = ({ children, color=T.amber, onClick, style={}, sm, ghost }) => (
  <button onClick={onClick} style={{
    background: ghost ? "transparent" : color,
    border: ghost ? `1.5px solid ${color}` : "none",
    color: ghost ? color : "#000",
    borderRadius:14, padding: sm?"8px 16px":"12px 24px",
    fontFamily:T.font, fontWeight:700, fontSize: sm?12:14,
    cursor:"pointer", transition:"all .18s",
    ...style }} onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.opacity="0.9"; }}
    onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.opacity="1"; }}>
    {children}
  </button>
);

/* ─── DATA ───────────────────────────────────────────────────── */
const KIDS = [
  { id:1, name:"Emma",  age:10, emoji:"👧🏼", mood:4, moodLabel:"Heureuse",   trust:82, battery:78, status:"en route",    location:"Trajet école→maison", eta:12, onRoute:true,  safe:true,  color:T.teal },
  { id:2, name:"Noah",  age:13, emoji:"👦🏽", mood:2, moodLabel:"Fatigué",    trust:65, battery:31, status:"à la maison",  location:"Maison",              eta:null,onRoute:false, safe:true,  color:T.sky  },
  { id:3, name:"Zoé",   age:8,  emoji:"👧🏻", mood:5, moodLabel:"Super bien", trust:94, battery:88, status:"École",        location:"École primaire",      eta:null,onRoute:false, safe:true,  color:T.violet},
];

const MOODS = [
  { v:1, label:"Pas bien", emoji:"😔", color:"#ef4444" },
  { v:2, label:"Fatigué",  emoji:"😴", color:"#f97316" },
  { v:3, label:"Ça va",    emoji:"😐", color:"#eab308" },
  { v:4, label:"Heureux",  emoji:"😊", color:"#22c55e" },
  { v:5, label:"Super !",  emoji:"🤩", color:"#14b8a6" },
];

const CIRCLE = [
  { name:"Mamie Hélène", role:"Grand-mère", emoji:"👵", kids:["Emma","Zoé"], canSeeLocation:true },
  { name:"Marc (oncle)", role:"Oncle",      emoji:"👨", kids:["Noah"],       canSeeLocation:true },
];

const EVENTS = [
  { time:"15:42", type:"mood",    msg:"Emma a partagé son humeur : Heureuse 😊",     kid:"Emma", color:T.green },
  { time:"15:38", type:"route",   msg:"Emma a quitté l'école — trajet détecté",       kid:"Emma", color:T.teal  },
  { time:"14:55", type:"trust",   msg:"Noah : +5 pts Trust — rentré à l'heure",       kid:"Noah", color:T.sky   },
  { time:"13:10", type:"geo",     msg:"Zoé est arrivée à l'école",                   kid:"Zoé",  color:T.violet},
  { time:"08:12", type:"circle",  msg:"Mamie Hélène a vu la position de Zoé",        kid:"Zoé",  color:T.amber },
];

/* ─── NAV ────────────────────────────────────────────────────── */
const TABS = [
  { id:"home",    icon:"◈", label:"Accueil"  },
  { id:"map",     icon:"◎", label:"Carte"    },
  { id:"trust",   icon:"★", label:"Confiance"},
  { id:"unique",  icon:"◆", label:"Exclusifs"},
  { id:"child",   icon:"❋", label:"Enfant"   },
];

/* ═══════════════════════════════════════════════════════════════
   HOME VIEW
═══════════════════════════════════════════════════════════════ */
function HomeView() {
  const [tick, setTick] = useState(0);
  const [etaLeft, setEtaLeft] = useState(12);
  const [events, setEvents] = useState(EVENTS);

  useEffect(() => {
    const t = setInterval(() => {
      setTick(n => n+1);
      setEtaLeft(e => e > 0 ? e-1 : 0);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const pulse = tick % 2 === 0;

  return (
    <div style={{ padding:"16px", display:"flex", flexDirection:"column", gap:14 }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontFamily:T.display, fontSize:26, fontWeight:900, color:T.text, lineHeight:1.1 }}>
            Bonjour, Sophie 👋
          </div>
          <div style={{ color:T.sub, fontSize:13, marginTop:2 }}>3 enfants • tous en sécurité</div>
        </div>
        <div style={{ background:T.green+"22", border:`1px solid ${T.green}44`, borderRadius:12, padding:"6px 14px", display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:T.green, boxShadow: pulse?`0 0 0 4px ${T.green}44`:"none", transition:"box-shadow .6s" }} />
          <span style={{ fontSize:12, color:T.green, fontWeight:700 }}>LIVE</span>
        </div>
      </div>

      {/* Emma ETA card — unique feature highlight */}
      <div style={{ background:`linear-gradient(135deg, ${T.teal}18, ${T.teal}08)`, border:`1.5px solid ${T.teal}44`, borderRadius:20, padding:16 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:42, height:42, borderRadius:"50%", background:T.teal+"33", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>👧🏼</div>
            <div>
              <div style={{ fontWeight:800, color:T.text, fontSize:15 }}>Emma rentre à la maison</div>
              <div style={{ color:T.sub, fontSize:12 }}>⏱️ Countdown actif · Trajet habituel ✓</div>
            </div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:T.display, fontSize:32, fontWeight:900, color:etaLeft > 3 ? T.teal : T.rose, lineHeight:1 }}>{etaLeft}</div>
            <div style={{ fontSize:10, color:T.sub }}>min restantes</div>
          </div>
        </div>
        {/* Trajet progress */}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:11, color:T.sub, whiteSpace:"nowrap" }}>École</span>
          <div style={{ flex:1, height:6, background:T.border, borderRadius:99, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${((12-etaLeft)/12)*100}%`, background:`linear-gradient(90deg, ${T.teal}, ${T.sky})`, borderRadius:99, transition:"width 3s" }} />
          </div>
          <span style={{ fontSize:11, color:T.sub, whiteSpace:"nowrap" }}>🏠</span>
        </div>
        <div style={{ marginTop:6, fontSize:11, color:T.teal }}>📍 {etaLeft > 3 ? "Rue des Acacias — sur le bon trajet" : etaLeft > 0 ? "⚡ Presque arrivée !" : "✅ Emma est arrivée !"}</div>
      </div>

      {/* Kids grid */}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {KIDS.map(k => {
          const mood = MOODS.find(m => m.v === k.mood);
          return (
            <Card key={k.id} style={{ padding:"14px 16px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                {/* Avatar */}
                <div style={{ position:"relative", flexShrink:0 }}>
                  <div style={{ width:48, height:48, borderRadius:"50%", background:k.color+"22", border:`2px solid ${k.color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>{k.emoji}</div>
                  <div style={{ position:"absolute", bottom:-2, right:-2, width:16, height:16, borderRadius:"50%", background:T.card, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10 }}>{mood.emoji}</div>
                </div>
                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontWeight:800, color:T.text, fontSize:15 }}>{k.name}</span>
                    <span style={{ fontSize:10, color:mood.color, fontWeight:700 }}>{mood.label}</span>
                  </div>
                  <div style={{ fontSize:12, color:T.sub, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>📍 {k.location}</div>
                  {/* Trust bar */}
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:6 }}>
                    <span style={{ fontSize:10, color:T.muted }}>Trust</span>
                    <div style={{ flex:1, height:4, background:T.border, borderRadius:99 }}>
                      <div style={{ height:"100%", width:`${k.trust}%`, background:`linear-gradient(90deg, ${k.color}, ${k.color}99)`, borderRadius:99 }} />
                    </div>
                    <span style={{ fontSize:10, color:k.color, fontWeight:700 }}>{k.trust}</span>
                  </div>
                </div>
                {/* Battery */}
                <div style={{ textAlign:"center", flexShrink:0 }}>
                  <div style={{ fontSize:11, color:k.battery<35?T.rose:T.sub }}>🔋{k.battery}%</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Live feed */}
      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, fontWeight:700, color:T.text, fontSize:14 }}>
          ⚡ Fil en direct
        </div>
        {events.slice(0,4).map((e,i) => (
          <div key={i} style={{ padding:"10px 16px", borderBottom: i<3?`1px solid ${T.border}`:"none", display:"flex", gap:10, alignItems:"flex-start" }}>
            <div style={{ width:4, height:4, borderRadius:"50%", background:e.color, marginTop:6, flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, color:T.text }}>{e.msg}</div>
              <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{e.time}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAP VIEW — TRAJET INTELLIGENT
═══════════════════════════════════════════════════════════════ */
function MapView() {
  const [selectedKid, setSelectedKid] = useState(KIDS[0]);
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(n=>n+1), 1500); return ()=>clearInterval(t); }, []);
  const pulse = tick%2===0;

  // Fake path segments for Emma's route
  const routePoints = [
    { x:15, y:70, label:"École", icon:"🏫", done:true },
    { x:30, y:58, label:"Rue Centrale", done:true },
    { x:50, y:45, label:"Carrefour", done:true },
    { x:65, y:38, label:"Parc", done:false, current:true },
    { x:80, y:28, label:"Maison", icon:"🏠", done:false },
  ];

  return (
    <div style={{ padding:16, display:"flex", flexDirection:"column", gap:14 }}>
      {/* Kid selector */}
      <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
        {KIDS.map(k => (
          <button key={k.id} onClick={() => setSelectedKid(k)} style={{
            background: selectedKid.id===k.id ? k.color+"22" : T.card,
            border:`1.5px solid ${selectedKid.id===k.id ? k.color : T.border}`,
            borderRadius:14, padding:"8px 14px", cursor:"pointer", fontFamily:T.font,
            display:"flex", alignItems:"center", gap:6, flexShrink:0,
          }}>
            <span>{k.emoji}</span>
            <span style={{ color:selectedKid.id===k.id?T.text:T.sub, fontWeight:600, fontSize:13 }}>{k.name}</span>
          </button>
        ))}
      </div>

      {/* Map */}
      <div style={{
        height:260, borderRadius:20, position:"relative", overflow:"hidden",
        background:"linear-gradient(160deg, #0c1829 0%, #091420 60%, #0a1a2e 100%)",
        border:`1px solid ${T.border}`,
      }}>
        {/* Grid */}
        {[...Array(8)].map((_,i) => <div key={i} style={{ position:"absolute", left:`${i*14}%`, top:0, bottom:0, width:1, background:"#ffffff06" }} />)}
        {[...Array(6)].map((_,i) => <div key={i} style={{ position:"absolute", top:`${i*18}%`, left:0, right:0, height:1, background:"#ffffff06" }} />)}

        {/* Roads */}
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M15,70 Q22,62 30,58 Q40,51 50,45 Q57,41 65,38 Q72,33 80,28" stroke="#1e3a5f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M15,70 Q22,62 30,58 Q40,51 50,45 Q57,41 65,38 Q72,33 80,28" stroke={selectedKid.color+"99"} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeDasharray="2,3" />
        </svg>

        {/* Route dots */}
        {routePoints.map((p,i) => (
          <div key={i} style={{ position:"absolute", left:`${p.x}%`, top:`${p.y}%`, transform:"translate(-50%,-50%)" }}>
            {p.current ? (
              <div>
                <div style={{ position:"absolute", inset:"-100%", borderRadius:"50%", border:`2px solid ${selectedKid.color}44`, animation:"none",
                  width:40, height:40, top:"50%", left:"50%", transform:"translate(-50%,-50%)",
                  boxShadow: pulse?`0 0 0 8px ${selectedKid.color}33`:"none", transition:"box-shadow .6s",
                  background: selectedKid.color+"22", borderRadius:"50%",
                }} />
                <div style={{ width:32, height:32, borderRadius:"50%", background:selectedKid.color, border:"3px solid white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, position:"relative", zIndex:2 }}>{selectedKid.emoji}</div>
              </div>
            ) : (
              <div style={{ width:16, height:16, borderRadius:"50%", background: p.done ? selectedKid.color : T.border, border:"2px solid", borderColor: p.done ? selectedKid.color+"aa" : T.borderHi, display:"flex", alignItems:"center", justifyContent:"center", fontSize:p.icon?10:0 }}>
                {p.icon||""}
              </div>
            )}
            <div style={{ position:"absolute", top:-18, left:"50%", transform:"translateX(-50%)", fontSize:9, color: p.done?selectedKid.color:T.muted, whiteSpace:"nowrap", fontWeight:600 }}>{p.label}</div>
          </div>
        ))}

        {/* Zones */}
        <div style={{ position:"absolute", left:"8%", top:"56%", width:60, height:50, borderRadius:12, border:`1.5px dashed ${T.teal}66`, background:`${T.teal}08` }}>
          <div style={{ position:"absolute", top:2, left:4, fontSize:9, color:T.teal, fontWeight:700 }}>🏫 École</div>
        </div>
        <div style={{ position:"absolute", left:"72%", top:"18%", width:50, height:40, borderRadius:12, border:`1.5px dashed ${T.amber}66`, background:`${T.amber}08` }}>
          <div style={{ position:"absolute", top:2, left:4, fontSize:9, color:T.amber, fontWeight:700 }}>🏠 Maison</div>
        </div>

        {/* LIVE badge */}
        <div style={{ position:"absolute", top:10, right:10, background:"rgba(0,0,0,.75)", borderRadius:20, padding:"4px 10px", display:"flex", alignItems:"center", gap:5 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:T.green, boxShadow: pulse?`0 0 6px ${T.green}`:"none", transition:"box-shadow .6s" }} />
          <span style={{ fontSize:10, color:T.green, fontWeight:700 }}>GPS LIVE</span>
        </div>
      </div>

      {/* Trajet Analysis */}
      <Card glow={selectedKid.color} style={{ padding:16 }}>
        <div style={{ fontWeight:700, color:T.text, marginBottom:10, fontSize:14 }}>
          🗺️ Analyse du trajet — <span style={{ color:selectedKid.color }}>{selectedKid.name}</span>
        </div>
        {selectedKid.onRoute ? (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:13, color:T.sub }}>Trajet reconnu</span>
              <Pill color={T.green} sm>✓ Habituel</Pill>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:13, color:T.sub }}>Déviation détectée</span>
              <Pill color={T.green} sm>Aucune</Pill>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:13, color:T.sub }}>Vitesse de déplacement</span>
              <Pill color={T.sky} sm>Pied ~4 km/h</Pill>
            </div>
            <div style={{ background:T.border, height:1, margin:"4px 0" }} />
            <div style={{ background:`${T.amber}15`, border:`1px solid ${T.amber}44`, borderRadius:12, padding:"8px 12px", fontSize:12, color:T.amber }}>
              💡 <strong>Trajet Intelligent</strong> — Si Emma dévie de plus de 200m du trajet habituel, tu reçois une alerte immédiate. Aucune autre app ne fait ça.
            </div>
          </div>
        ) : (
          <div style={{ color:T.sub, fontSize:13 }}>
            {selectedKid.name} est dans une zone sécurisée. Le trajet intelligent s'activera au prochain déplacement.
          </div>
        )}
      </Card>

      {/* Cercle de confiance */}
      <Card>
        <div style={{ fontWeight:700, color:T.text, marginBottom:10, fontSize:14 }}>👴 Cercle de confiance</div>
        {CIRCLE.map(c => (
          <div key={c.name} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
            <span style={{ fontSize:22 }}>{c.emoji}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{c.name}</div>
              <div style={{ fontSize:11, color:T.sub }}>{c.role} · voit : {c.kids.join(", ")}</div>
            </div>
            <Pill color={T.teal} sm>Lecture</Pill>
          </div>
        ))}
        <button style={{ width:"100%", marginTop:8, padding:"10px 0", borderRadius:12, border:`1.5px dashed ${T.border}`, background:"transparent", color:T.muted, cursor:"pointer", fontSize:13, fontFamily:T.font }}>
          + Inviter un proche
        </button>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TRUST SCORE VIEW
═══════════════════════════════════════════════════════════════ */
function TrustView() {
  const [selected, setSelected] = useState(KIDS[0]);

  const levels = [
    { min:0,  max:30, label:"Débutant",   icon:"🌱", perks:["Localisation toutes les 30s", "Alertes géofencing"], color:"#ef4444" },
    { min:30, max:60, label:"En progrès", icon:"🌿", perks:["Localisation toutes les 5min", "Peut demander +1h"], color:"#f97316" },
    { min:60, max:80, label:"Fiable",     icon:"🌳", perks:["Localisation toutes les 15min", "+2h autonomie/sem"], color:T.amber },
    { min:80, max:95, label:"Excellent",  icon:"⭐", perks:["Localisation à la demande", "Mode week-end libre"], color:T.teal },
    { min:95, max:100,label:"Champion",   icon:"🏆", perks:["Confiance totale", "Notifications réduites"], color:T.green },
  ];

  const currentLevel = levels.find(l => selected.trust >= l.min && selected.trust < l.max) || levels[levels.length-1];

  const history = [
    { action:"Rentré à l'heure", pts:"+5", date:"Hier", icon:"🏠" },
    { action:"Check-in envoyé", pts:"+3", date:"Hier", icon:"✅" },
    { action:"A suivi le trajet", pts:"+4", date:"Il y a 2j", icon:"🗺️" },
    { action:"Mood partagé",     pts:"+2", date:"Il y a 2j", icon:"😊" },
    { action:"Sorti de zone",    pts:"-8", date:"Il y a 5j", icon:"⚠️", neg:true },
  ];

  return (
    <div style={{ padding:16, display:"flex", flexDirection:"column", gap:14 }}>
      <div>
        <div style={{ fontFamily:T.display, fontSize:22, fontWeight:900, color:T.text }}>Système de Confiance</div>
        <div style={{ color:T.sub, fontSize:13, marginTop:2 }}>Plus ton enfant est fiable → plus il gagne de liberté</div>
      </div>

      {/* Kid selector */}
      <div style={{ display:"flex", gap:8 }}>
        {KIDS.map(k => (
          <button key={k.id} onClick={() => setSelected(k)} style={{
            flex:1, background: selected.id===k.id ? k.color+"22" : T.card,
            border:`1.5px solid ${selected.id===k.id ? k.color : T.border}`,
            borderRadius:14, padding:"10px 8px", cursor:"pointer", fontFamily:T.font, textAlign:"center",
          }}>
            <div style={{ fontSize:20 }}>{k.emoji}</div>
            <div style={{ fontSize:12, fontWeight:700, color: selected.id===k.id ? T.text : T.sub, marginTop:2 }}>{k.name}</div>
            <div style={{ fontSize:11, color:k.color, fontWeight:700 }}>{k.trust}</div>
          </button>
        ))}
      </div>

      {/* Score card */}
      <Card glow={currentLevel.color} style={{ padding:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
          <div style={{ width:64, height:64, borderRadius:20, background:currentLevel.color+"22", border:`2px solid ${currentLevel.color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32 }}>
            {currentLevel.icon}
          </div>
          <div>
            <div style={{ color:T.sub, fontSize:12 }}>Niveau actuel</div>
            <div style={{ fontFamily:T.display, fontSize:24, fontWeight:900, color:currentLevel.color }}>{currentLevel.label}</div>
            <div style={{ color:T.sub, fontSize:12 }}>{selected.name} · {selected.trust}/100 pts</div>
          </div>
        </div>

        {/* Big score bar */}
        <div style={{ height:16, background:T.border, borderRadius:99, overflow:"hidden", marginBottom:8 }}>
          <div style={{ height:"100%", width:`${selected.trust}%`, background:`linear-gradient(90deg, ${currentLevel.color}, ${currentLevel.color}bb)`, borderRadius:99, transition:"width 1s ease" }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:T.muted }}>
          {levels.map(l => <span key={l.min}>{l.min}</span>)}
          <span>100</span>
        </div>

        {/* Avantages débloqués */}
        <div style={{ marginTop:14 }}>
          <div style={{ fontSize:12, color:T.sub, marginBottom:6 }}>✨ Avantages débloqués</div>
          {currentLevel.perks.map(p => (
            <div key={p} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
              <div style={{ width:18, height:18, borderRadius:"50%", background:currentLevel.color+"33", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10 }}>✓</div>
              <span style={{ fontSize:13, color:T.text }}>{p}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Tous les niveaux */}
      <Card style={{ padding:16 }}>
        <div style={{ fontWeight:700, color:T.text, marginBottom:10, fontSize:14 }}>🎯 Parcours de confiance</div>
        {levels.map((l, i) => {
          const active = selected.trust >= l.min;
          return (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              <div style={{ width:32, height:32, borderRadius:10, background: active ? l.color+"22" : T.border+"44", border:`1.5px solid ${active?l.color:T.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{active?l.icon:"🔒"}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color: active?T.text:T.muted }}>{l.label} <span style={{ fontSize:10, color:T.muted }}>({l.min}–{l.max} pts)</span></div>
                <div style={{ fontSize:11, color: active ? l.color : T.muted }}>{l.perks[0]}</div>
              </div>
              {active && l.min <= selected.trust && selected.trust < l.max && <Pill color={l.color} sm>Actuel</Pill>}
            </div>
          );
        })}
      </Card>

      {/* Historique */}
      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, fontWeight:700, color:T.text, fontSize:14 }}>
          📜 Historique récent — {selected.name}
        </div>
        {history.map((h, i) => (
          <div key={i} style={{ padding:"10px 16px", borderBottom: i<history.length-1?`1px solid ${T.border}`:"none", display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:18 }}>{h.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, color:T.text }}>{h.action}</div>
              <div style={{ fontSize:11, color:T.muted }}>{h.date}</div>
            </div>
            <span style={{ fontWeight:800, fontSize:14, color: h.neg ? T.rose : T.green }}>{h.pts}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   UNIQUE FEATURES SHOWCASE
═══════════════════════════════════════════════════════════════ */
function UniqueView() {
  const [active, setActive] = useState(0);

  const features = [
    {
      icon:"🌡️", title:"Mood Check-in", color:T.teal,
      tag:"Exclusif mondial",
      why:"Aucune app ne demande comment va l'enfant. Juste sa position. Kido connecte les émotions.",
      how:"L'enfant partage son humeur en 1 tap (😔😴😐😊🤩). Le parent voit l'état émotionnel sur la carte, pas juste un point GPS. Si l'humeur baisse régulièrement le même jour → alerte douce au parent.",
      demo: <MoodDemo />
    },
    {
      icon:"⭐", title:"Trust Score", color:T.amber,
      tag:"Concept breveté",
      why:"Les autres apps surveillent et punissent. Kido récompense et responsabilise. La confiance se gagne.",
      how:"Chaque bon comportement (rentrer à l'heure, check-in, suivre le trajet) rapporte des points. Plus le score monte, moins la surveillance est intrusive. L'enfant est acteur de sa liberté.",
      demo: <MiniTrust />
    },
    {
      icon:"⏱️", title:"Countdown Retour", color:T.sky,
      tag:"Simple mais absent partout",
      why:"Le parent ne sait jamais combien de temps attendre. L'enfant dit 'j'arrive' sans heure précise.",
      how:"L'enfant envoie '20 min' en 1 tap. Un timer live apparaît sur le dashboard parent. Si le timer expire sans arrivée → alerte automatique. Si Emma arrive avant → notification positive.",
      demo: <CountdownDemo />
    },
    {
      icon:"🤫", title:"SOS Discret", color:T.rose,
      tag:"Sécurité avancée",
      why:"Parfois l'enfant est en situation inconfortable mais ne peut pas appeler. Il ne doit pas montrer qu'il envoie une alerte.",
      how:"En agitant discrètement le téléphone 3x OU en appuyant sur le bouton de volume, une alerte silencieuse part aux parents avec la position GPS. Aucune notification visible sur l'écran de l'enfant.",
      demo: <SosDemo />
    },
    {
      icon:"🗺️", title:"Trajet Intelligent", color:T.violet,
      tag:"IA de comportement",
      why:"Family Link a une localisation. Mais si l'enfant fait un détour, aucune alerte. Kido apprend les trajets habituels.",
      how:"Après 5 trajets identiques, Kido crée un 'couloir de trajet'. Si l'enfant dévie de plus de 200m → alerte immédiate. Si accélération soudaine (véhicule ?) → alerte prioritaire.",
      demo: <RouteDemo />
    },
    {
      icon:"👴", title:"Cercle Élargi", color:"#a78bfa",
      tag:"Unique en PWA",
      why:"Les grands-parents veulent savoir si leur petit-fils est arrivé. Aujourd'hui ils doivent appeler. Kido leur donne un accès lecture.",
      how:"Le parent crée des accès 'lecture seule' pour les proches de confiance. Mamie voit la position de Zoé sans avoir les contrôles parentaux. Accès révocable en 1 clic. Notification automatique aux proches quand l'enfant arrive dans une zone clé.",
      demo: <CircleDemo />
    },
  ];

  const f = features[active];

  return (
    <div style={{ padding:16, display:"flex", flexDirection:"column", gap:14 }}>
      <div>
        <div style={{ fontFamily:T.display, fontSize:22, fontWeight:900, color:T.text }}>6 Features Exclusives</div>
        <div style={{ color:T.sub, fontSize:13, marginTop:2 }}>Ce que ni Family Link, ni Bark, ni Qustodio ne font</div>
      </div>

      {/* Feature tabs */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6 }}>
        {features.map((feat, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            background: active===i ? feat.color+"22" : T.card,
            border:`1.5px solid ${active===i ? feat.color : T.border}`,
            borderRadius:14, padding:"10px 8px", cursor:"pointer", fontFamily:T.font, textAlign:"center",
          }}>
            <div style={{ fontSize:20, marginBottom:2 }}>{feat.icon}</div>
            <div style={{ fontSize:10, fontWeight:700, color: active===i ? T.text : T.sub, lineHeight:1.2 }}>{feat.title}</div>
          </button>
        ))}
      </div>

      {/* Feature detail */}
      <Card glow={f.color} style={{ padding:18 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:f.color+"22", border:`2px solid ${f.color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>{f.icon}</div>
          <div>
            <Pill color={f.color} sm>{f.tag}</Pill>
            <div style={{ fontFamily:T.display, fontSize:18, fontWeight:900, color:T.text, marginTop:2 }}>{f.title}</div>
          </div>
        </div>

        <div style={{ background:T.surface, borderRadius:14, padding:12, marginBottom:12 }}>
          <div style={{ fontSize:11, color:T.muted, marginBottom:4, fontWeight:700 }}>POURQUOI C'EST UNIQUE</div>
          <div style={{ fontSize:13, color:"#cbd5e1", lineHeight:1.6 }}>{f.why}</div>
        </div>

        <div style={{ background:f.color+"12", border:`1px solid ${f.color}33`, borderRadius:14, padding:12, marginBottom:14 }}>
          <div style={{ fontSize:11, color:f.color, marginBottom:4, fontWeight:700 }}>COMMENT ÇA MARCHE</div>
          <div style={{ fontSize:13, color:"#cbd5e1", lineHeight:1.6 }}>{f.how}</div>
        </div>

        {/* Mini demo */}
        <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:14 }}>
          <div style={{ fontSize:11, color:T.muted, marginBottom:8, fontWeight:700 }}>DEMO INTERACTIVE</div>
          {f.demo}
        </div>
      </Card>
    </div>
  );
}

/* Mini demos */
function MoodDemo() {
  const [sel, setSel] = useState(null);
  return (
    <div>
      <div style={{ fontSize:12, color:T.sub, marginBottom:8 }}>Emma, comment tu te sens ?</div>
      <div style={{ display:"flex", gap:8, justifyContent:"space-between" }}>
        {MOODS.map(m => (
          <button key={m.v} onClick={() => setSel(m.v)} style={{
            flex:1, padding:"10px 4px", borderRadius:12, border:`2px solid ${sel===m.v?m.color:T.border}`,
            background: sel===m.v?m.color+"22":"transparent", cursor:"pointer", textAlign:"center",
          }}>
            <div style={{ fontSize:20 }}>{m.emoji}</div>
            <div style={{ fontSize:9, color: sel===m.v?m.color:T.muted, fontWeight:600, marginTop:2 }}>{m.label}</div>
          </button>
        ))}
      </div>
      {sel && <div style={{ marginTop:10, background:T.green+"18", borderRadius:10, padding:"8px 12px", fontSize:12, color:T.green }}>✅ Humeur partagée → Maman & Papa notifiés</div>}
    </div>
  );
}

function MiniTrust() {
  const [pts, setPts] = useState(73);
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontSize:12, color:T.sub }}>Score actuel : {pts}/100</span>
        <Pill color={T.amber} sm>⭐ Fiable</Pill>
      </div>
      <div style={{ height:12, background:T.border, borderRadius:99, overflow:"hidden", marginBottom:10 }}>
        <div style={{ height:"100%", width:`${pts}%`, background:`linear-gradient(90deg, ${T.amber}, ${T.teal})`, borderRadius:99, transition:"width .5s" }} />
      </div>
      <div style={{ display:"flex", gap:6 }}>
        <Btn color={T.green} sm onClick={() => setPts(p => Math.min(100, p+5))}>+5 pts rentré à l'heure</Btn>
        <Btn color={T.rose} sm ghost onClick={() => setPts(p => Math.max(0, p-8))}>-8 hors zone</Btn>
      </div>
    </div>
  );
}

function CountdownDemo() {
  const [mins, setMins] = useState(null);
  const [left, setLeft] = useState(null);
  useEffect(() => {
    if (left === null || left <= 0) return;
    const t = setTimeout(() => setLeft(l => l-1), 800);
    return () => clearTimeout(t);
  }, [left]);

  return (
    <div>
      {!mins ? (
        <div>
          <div style={{ fontSize:12, color:T.sub, marginBottom:8 }}>Emma envoie son ETA :</div>
          <div style={{ display:"flex", gap:8 }}>
            {[10,20,30,45].map(m => (
              <Btn key={m} color={T.sky} sm onClick={() => { setMins(m); setLeft(m); }}>⏱ {m}min</Btn>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign:"center" }}>
          <div style={{ fontFamily:T.display, fontSize:48, fontWeight:900, color: left>5?T.sky:T.rose, lineHeight:1 }}>{left}</div>
          <div style={{ color:T.sub, fontSize:12 }}>minutes · parent voit ce timer en direct</div>
          {left === 0 && <div style={{ marginTop:8, color:T.rose, fontWeight:700, fontSize:13 }}>⚠️ Timer expiré → alerte automatique !</div>}
          <Btn color={T.sky} sm ghost style={{ marginTop:8 }} onClick={() => { setMins(null); setLeft(null); }}>Réinitialiser</Btn>
        </div>
      )}
    </div>
  );
}

function SosDemo() {
  const [triggered, setTriggered] = useState(false);
  const [count, setCount] = useState(0);

  const handleShake = () => {
    setCount(c => {
      const next = c+1;
      if (next >= 3) { setTriggered(true); return 0; }
      return next;
    });
  };

  return (
    <div>
      {!triggered ? (
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:12, color:T.sub, marginBottom:10 }}>Simule 3 taps discrets (sans rien afficher) :</div>
          <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:10 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width:20, height:20, borderRadius:"50%", background: i<count ? T.rose : T.border }} />
            ))}
          </div>
          <Btn color={T.rose} onClick={handleShake}>Tap #{count+1}</Btn>
          <div style={{ fontSize:11, color:T.muted, marginTop:8 }}>En vrai : agite le téléphone ou bouton volume</div>
        </div>
      ) : (
        <div style={{ background:T.rose+"18", border:`1.5px solid ${T.rose}44`, borderRadius:14, padding:14, textAlign:"center" }}>
          <div style={{ fontSize:28, marginBottom:4 }}>🆘</div>
          <div style={{ fontWeight:800, color:T.rose, fontSize:15 }}>Alerte SILENCIEUSE envoyée</div>
          <div style={{ fontSize:12, color:T.sub, marginTop:4 }}>Position GPS + heure → Maman & Papa<br/><strong style={{ color:T.rose }}>Aucune notification visible sur l'écran d'Emma</strong></div>
          <Btn color={T.rose} sm ghost style={{ marginTop:10 }} onClick={() => { setTriggered(false); setCount(0); }}>Reset</Btn>
        </div>
      )}
    </div>
  );
}

function RouteDemo() {
  const [deviated, setDeviated] = useState(false);
  return (
    <div>
      <div style={{ height:80, background:T.surface, borderRadius:12, position:"relative", overflow:"hidden", marginBottom:10 }}>
        <svg style={{ width:"100%", height:"100%" }} viewBox="0 0 200 80">
          <path d="M10,60 Q60,40 100,30 Q140,20 190,15" stroke={T.violet+"88"} strokeWidth="2" strokeDasharray="4,3" fill="none" />
          {!deviated ? (
            <circle cx="110" cy="27" r="8" fill={T.violet} />
          ) : (
            <circle cx="130" cy="55" r="8" fill={T.rose}>
              <animate attributeName="r" values="8;12;8" dur="1s" repeatCount="indefinite" />
            </circle>
          )}
          <text x="5" y="72" fontSize="10" fill={T.muted}>École</text>
          <text x="170" y="12" fontSize="10" fill={T.muted}>Maison</text>
        </svg>
        {deviated && <div style={{ position:"absolute", top:4, right:6, background:T.rose, color:"white", borderRadius:8, padding:"2px 8px", fontSize:10, fontWeight:700 }}>DÉVIATION !</div>}
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <Btn color={T.violet} sm onClick={() => setDeviated(false)}>Trajet normal</Btn>
        <Btn color={T.rose} sm onClick={() => setDeviated(true)}>Simuler déviation</Btn>
      </div>
    </div>
  );
}

function CircleDemo() {
  const [access, setAccess] = useState(["Mamie Hélène"]);
  return (
    <div>
      {["Mamie Hélène","Papa Marc","Oncle Pierre"].map(name => (
        <div key={name} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
          <div style={{ flex:1, fontSize:13, color: access.includes(name)?T.text:T.muted }}>{name}</div>
          <button onClick={() => setAccess(a => a.includes(name) ? a.filter(x=>x!==name) : [...a, name])} style={{
            background: access.includes(name) ? "#a78bfa22" : T.border,
            border:`1.5px solid ${access.includes(name)?"#a78bfa":T.border}`,
            color: access.includes(name) ? "#a78bfa" : T.muted,
            borderRadius:10, padding:"4px 12px", cursor:"pointer", fontFamily:T.font, fontSize:11, fontWeight:700
          }}>{access.includes(name)?"✓ Actif":"Inviter"}</button>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CHILD VIEW — côté enfant mobile
═══════════════════════════════════════════════════════════════ */
function ChildView() {
  const [mood, setMood] = useState(null);
  const [sent, setSent] = useState(false);
  const [etaVal, setEtaVal] = useState(null);
  const [sosActive, setSosActive] = useState(false);
  const [sosCount, setSosCount] = useState(3);

  useEffect(() => {
    if (mood) { setTimeout(() => setSent(true), 400); }
  }, [mood]);

  useEffect(() => {
    if (sosActive && sosCount > 0) {
      const t = setTimeout(() => setSosCount(c => c-1), 1000);
      return () => clearTimeout(t);
    }
  }, [sosActive, sosCount]);

  const handleSosDone = () => {
    if (sosCount === 0) {
      alert("🆘 Alerte silencieuse envoyée à tes parents !");
      setSosActive(false); setSosCount(3);
    }
  };

  return (
    <div style={{ padding:20, maxWidth:380, margin:"0 auto" }}>
      {/* Header enfant */}
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <div style={{ width:72, height:72, borderRadius:24, background:T.teal+"22", border:`2px solid ${T.teal}44`, margin:"0 auto 10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36 }}>👧🏼</div>
        <div style={{ fontFamily:T.display, fontSize:22, fontWeight:900, color:T.text }}>Salut Emma 👋</div>
        <div style={{ color:T.sub, fontSize:13, marginTop:2 }}>Tes parents voient que tu es en sécurité</div>
        <div style={{ marginTop:8, display:"inline-flex", alignItems:"center", gap:6, background:T.green+"18", borderRadius:30, padding:"4px 14px" }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:T.green }} />
          <span style={{ fontSize:12, color:T.green, fontWeight:600 }}>📍 Trajet habituel · Tout va bien</span>
        </div>
      </div>

      {/* Mood check-in */}
      <Card style={{ marginBottom:14, padding:16 }}>
        <div style={{ fontWeight:700, color:T.text, marginBottom:4 }}>🌡️ Comment tu te sens ?</div>
        <div style={{ fontSize:12, color:T.sub, marginBottom:12 }}>Partage ton humeur avec tes parents</div>
        <div style={{ display:"flex", gap:6, justifyContent:"space-between" }}>
          {MOODS.map(m => (
            <button key={m.v} onClick={() => { setMood(m.v); setSent(false); }} style={{
              flex:1, padding:"8px 0", borderRadius:12,
              border:`2px solid ${mood===m.v?m.color:T.border}`,
              background: mood===m.v?m.color+"22":"transparent", cursor:"pointer",
            }}>
              <div style={{ fontSize:22 }}>{m.emoji}</div>
            </button>
          ))}
        </div>
        {sent && mood && (
          <div style={{ marginTop:10, background:T.green+"18", borderRadius:10, padding:"8px 12px", fontSize:12, color:T.green }}>
            ✅ {MOODS.find(m=>m.v===mood).label} · Envoyé à Maman & Papa
          </div>
        )}
      </Card>

      {/* Countdown */}
      <Card style={{ marginBottom:14, padding:16 }}>
        <div style={{ fontWeight:700, color:T.text, marginBottom:10 }}>⏱️ Je rentre dans...</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {[["🚶 10 min",10],["🚶 20 min",20],["🚌 30 min",30],["🚌 1 heure",60]].map(([label, val]) => (
            <button key={val} onClick={() => setEtaVal(val)} style={{
              padding:"12px 8px", borderRadius:14, border:`1.5px solid ${etaVal===val?T.sky:T.border}`,
              background: etaVal===val?T.sky+"22":"transparent", color: etaVal===val?T.sky:T.sub,
              cursor:"pointer", fontFamily:T.font, fontSize:13, fontWeight:600,
            }}>{label}</button>
          ))}
        </div>
        {etaVal && (
          <div style={{ marginTop:10, background:T.sky+"18", borderRadius:10, padding:"8px 12px", fontSize:12, color:T.sky }}>
            📲 Timer de {etaVal} min démarré sur le téléphone de Maman
          </div>
        )}
      </Card>

      {/* Check-ins rapides */}
      <Card style={{ marginBottom:14, padding:16 }}>
        <div style={{ fontWeight:700, color:T.text, marginBottom:10 }}>✅ Check-in rapide</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[["✅ Je vais bien",T.green],["🏠 Je suis arrivé(e)",T.teal],["⏳ Je suis en retard",T.amber],["📞 Rappelle-moi",T.sky]].map(([label,color]) => (
            <button key={label} style={{
              padding:"12px 16px", borderRadius:14, border:`1.5px solid ${T.border}`, background:T.surface,
              color:T.text, cursor:"pointer", fontFamily:T.font, fontSize:14, fontWeight:600, textAlign:"left",
              display:"flex", alignItems:"center", gap:10,
            }}
            onClick={(e) => { e.currentTarget.style.background=color+"22"; e.currentTarget.style.borderColor=color; }}>
              {label}
            </button>
          ))}
        </div>
      </Card>

      {/* SOS Discret */}
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:11, color:T.muted, marginBottom:10 }}>
          🤫 <strong style={{ color:T.sub }}>SOS Discret</strong> — alerte silencieuse, invisible à ton entourage
        </div>
        <button
          onMouseDown={() => { setSosActive(true); setSosCount(3); }}
          onMouseUp={handleSosDone}
          onTouchStart={() => { setSosActive(true); setSosCount(3); }}
          onTouchEnd={handleSosDone}
          style={{
            width:96, height:96, borderRadius:"50%",
            background: sosActive ? T.rose+"33" : "transparent",
            border:`3px solid ${T.rose}`,
            color: T.rose, fontWeight:900,
            cursor:"pointer", fontFamily:T.font, transition:"all .3s",
            boxShadow: sosActive ? `0 0 40px ${T.rose}55` : "none",
            fontSize: sosActive ? 28 : 13,
          }}>
          {sosActive ? sosCount : "SOS\nDiscret"}
        </button>
        {sosActive && <div style={{ color:T.rose, fontSize:12, marginTop:8, fontWeight:600 }}>Maintiens... {sosCount}s</div>}
        <div style={{ color:T.muted, fontSize:11, marginTop:6 }}>En vrai : secoue le téléphone 3× ou bouton volume</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BOTTOM NAV
═══════════════════════════════════════════════════════════════ */
function BottomNav({ active, setActive }) {
  return (
    <div style={{
      position:"fixed", bottom:0, left:0, right:0,
      background:T.surface, borderTop:`1px solid ${T.border}`,
      display:"flex", zIndex:100,
      paddingBottom:"env(safe-area-inset-bottom)",
    }}>
      {TABS.map(t => (
        <button key={t.id} onClick={() => setActive(t.id)} style={{
          flex:1, padding:"10px 4px 8px", border:"none", background:"transparent",
          cursor:"pointer", fontFamily:T.font,
          display:"flex", flexDirection:"column", alignItems:"center", gap:2,
        }}>
          <span style={{ fontSize:16, filter: active===t.id?"none":"grayscale(1) opacity(.5)" }}>{t.icon}</span>
          <span style={{ fontSize:9, fontWeight:700, color: active===t.id?T.amber:T.muted }}>{t.label}</span>
          {active===t.id && <div style={{ width:16, height:2, borderRadius:1, background:T.amber }} />}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════════ */
export default function KidoApp() {
  const [view, setView] = useState("home");

  return (
    <div style={{ fontFamily:T.font, background:T.bg, color:T.text, minHeight:"100vh", maxWidth:480, margin:"0 auto", position:"relative", paddingBottom:80 }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:12, background:`linear-gradient(135deg, ${T.teal}, ${T.sky})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🛡️</div>
          <div>
            <div style={{ fontFamily:T.display, fontWeight:900, fontSize:18, color:T.text, letterSpacing:-0.5 }}>Kido</div>
            <div style={{ fontSize:9, color:T.muted }}>Family Safety</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <Pill color={T.green} sm>3 ✓ safe</Pill>
          <Pill color={view==="child"?T.violet:T.amber} sm>{view==="child"?"📱 Enfant":"👨‍👩‍👧 Parent"}</Pill>
        </div>
      </div>

      {/* Content */}
      <div style={{ overflowY:"auto", height:"calc(100vh - 56px - 60px)" }}>
        {view==="home"   && <HomeView />}
        {view==="map"    && <MapView />}
        {view==="trust"  && <TrustView />}
        {view==="unique" && <UniqueView />}
        {view==="child"  && <ChildView />}
      </div>

      <BottomNav active={view} setActive={setView} />
    </div>
  );
}

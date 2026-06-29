import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User { id:string; name:string; role:'parent'|'child'; familyId:string; avatar?:string; trustScore?:number; age?:number; }

export interface ChildState {
  id:string; name:string; avatar?:string; age?:number;
  trustScore:number; trustLevel:string;
  mood?: { value:number; label:string; emoji:string; color:string; at:string } | null;
  lastLocation?: { lat:number; lng:number; recordedAt:string; speed?:number } | null;
  activeCountdown?: { id:number; etaMinutes:number; startedAt:string } | null;
  pendingNegotiations:number; battery?:number; status?:string;
}

export interface Alert { id:string; type:string; title:string; body?:string; childId?:string; at:string; read:boolean; data?:Record<string,unknown>; }

interface AppStore {
  user:User|null; accessToken:string|null;
  setAuth:(u:User,t:string)=>void; clearAuth:()=>void;
  children:ChildState[]; setChildren:(c:ChildState[])=>void; updateChild:(id:string,d:Partial<ChildState>)=>void;
  alerts:Alert[]; addAlert:(a:Alert)=>void; markRead:(id:string)=>void;
  selectedChildId:string|null; setSelectedChild:(id:string|null)=>void;
  activeTab:string; setActiveTab:(t:string)=>void;
  lunaOpen:boolean; setLunaOpen:(v:boolean)=>void;
}

export const useStore = create<AppStore>()(persist((set)=>({
  user:null, accessToken:null,
  setAuth:(user,accessToken)=>{ localStorage.setItem('vk_token',accessToken); set({user,accessToken}); },
  clearAuth:()=>{ localStorage.removeItem('vk_token'); set({user:null,accessToken:null,children:[],alerts:[]}); },
  children:[], setChildren:c=>set({children:c}),
  updateChild:(id,data)=>set(s=>({children:s.children.map(c=>c.id===id?{...c,...data}:c)})),
  alerts:[], addAlert:a=>set(s=>({alerts:[a,...s.alerts].slice(0,50)})),
  markRead:id=>set(s=>({alerts:s.alerts.map(a=>a.id===id?{...a,read:true}:a)})),
  selectedChildId:null, setSelectedChild:id=>set({selectedChildId:id}),
  activeTab:'home', setActiveTab:t=>set({activeTab:t}),
  lunaOpen:false, setLunaOpen:v=>set({lunaOpen:v}),
}),{name:'vivokid',partialize:s=>({user:s.user,accessToken:s.accessToken})}));

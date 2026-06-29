const BASE = import.meta.env.VITE_API_URL || '/api';
async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const token = localStorage.getItem('vk_token');
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { 'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{}), ...opts?.headers },
  });
  if (!res.ok) { const e = await res.json().catch(()=>({error:'Erreur'})); throw new Error(e.error||`HTTP ${res.status}`); }
  return res.json();
}
export const api = {
  get:<T>(p:string)=>request<T>(p),
  post:<T>(p:string,b:unknown)=>request<T>(p,{method:'POST',body:JSON.stringify(b)}),
  patch:<T>(p:string,b:unknown)=>request<T>(p,{method:'PATCH',body:JSON.stringify(b)}),
  delete:<T>(p:string)=>request<T>(p,{method:'DELETE'}),
  async postForm<T>(p:string,f:FormData):Promise<T>{
    const t=localStorage.getItem('vk_token');
    const r=await fetch(`${BASE}${p}`,{method:'POST',headers:t?{Authorization:`Bearer ${t}`}:{},body:f});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    return r.json();
  },
};

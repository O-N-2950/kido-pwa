// ============================================================
// VIVOKID — useFamily hook — loads family + subscribes socket
// ============================================================
import { useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';
import { useStore } from '../lib/store';

export function useFamily() {
  const { user, setChildren, updateChild, addAlert } = useStore();

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get<{ data: { children: any[] } }>('/family');
      setChildren(res.data.children);
    } catch (e) {
      console.error('[family] fetch error', e);
    }
  }, [user, setChildren]);

  useEffect(() => {
    if (!user) return;
    refresh();

    const io = getSocket();

    // Real-time location update
    io.on('location:update', ({ userId, lat, lng, speed, recordedAt }) => {
      updateChild(userId, { lastLocation: { lat, lng, speed, recordedAt } });
    });

    // Mood update
    io.on('mood:update', ({ userId, value, at }) => {
      const MOODS: Record<number,{label:string;emoji:string;color:string}> = {
        1:{label:'Pas bien',emoji:'😔',color:'#ef4444'},
        2:{label:'Fatigué',emoji:'😴',color:'#f97316'},
        3:{label:'Ça va',emoji:'😐',color:'#eab308'},
        4:{label:'Heureux',emoji:'😊',color:'#22c55e'},
        5:{label:'Super !',emoji:'🤩',color:'#14b8a6'},
      };
      updateChild(userId, { mood: { value, ...MOODS[value], at } });
      addAlert({ id:`mood-${Date.now()}`, type:'mood', title:`${userId} a partagé son humeur`, at, read:false });
    });

    // Check-in (countdown)
    io.on('checkin:new', ({ userId, etaMinutes, id, at }) => {
      if (etaMinutes) updateChild(userId, { activeCountdown: { id, etaMinutes, startedAt: at } });
    });
    io.on('checkin:resolved', ({ userId }) => {
      updateChild(userId, { activeCountdown: null });
      addAlert({ id:`arr-${Date.now()}`, type:'arrived', title:'Est arrivé(e) ✅', at:new Date().toISOString(), read:false });
    });

    // SOS — priority alert
    io.on('sos:alert', ({ userId, lat, lng, at }) => {
      addAlert({ id:`sos-${Date.now()}`, type:'sos', title:'🆘 ALERTE SOS DISCRÈTE', body:'Votre enfant a besoin de vous', childId:userId, at, read:false, data:{lat,lng} });
    });

    // Geofence
    io.on('geofence:event', ({ userId, zoneName, eventType, at }) => {
      const msg = eventType==='enter' ? `est arrivé(e) à ${zoneName}` : `a quitté ${zoneName}`;
      addAlert({ id:`geo-${Date.now()}`, type:'geo', title:`${msg}`, childId:userId, at, read:false });
    });

    // Luna real-time
    io.on('luna:realtime', (obs) => {
      addAlert({ id:`luna-${Date.now()}`, type:'luna', title:obs.title, body:obs.body, childId:obs.childId, at:obs.at, read:false });
    });

    // Countdown expiré (scheduler serveur)
    io.on('countdown:expired', ({ userId, name, at }) => {
      updateChild(userId, { activeCountdown: null });
      addAlert({ id:`cde-${Date.now()}`, type:'countdown', title:`⏱️ ${name} n'est pas encore arrivé(e)`, body:'Le timer a expiré — un petit message pour vérifier ?', childId:userId, at, read:false });
    });

    // Speed alert (vehicle detected)
    io.on('speed:alert', ({ userId, speed, at }) => {
      addAlert({ id:`speed-${Date.now()}`, type:'speed', title:`⚡ Déplacement rapide détecté (${(speed*3.6).toFixed(0)} km/h)`, childId:userId, at, read:false });
    });

    return () => {
      io.off('location:update'); io.off('mood:update');
      io.off('checkin:new'); io.off('checkin:resolved');
      io.off('sos:alert'); io.off('geofence:event');
      io.off('luna:realtime'); io.off('speed:alert'); io.off('countdown:expired');
    };
  }, [user, refresh, updateChild, addAlert]);

  return { refresh };
}

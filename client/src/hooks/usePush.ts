// ============================================================
// VIVOKID — usePush — abonnement Web Push souverain (VAPID)
// iOS 16.4+: nécessite PWA installée sur l'écran d'accueil.
// ============================================================
import { useState, useCallback, useEffect } from 'react';
import { api } from '../lib/api';
import { useStore } from '../lib/store';

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(b64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

export type PushStatus = 'unsupported' | 'default' | 'granted' | 'denied' | 'subscribed';

export function usePush() {
  const { user } = useStore();
  const [status, setStatus] = useState<PushStatus>('default');

  const check = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported'); return;
    }
    if (Notification.permission === 'denied') { setStatus('denied'); return; }
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    setStatus(sub ? 'subscribed' : Notification.permission === 'granted' ? 'granted' : 'default');
  }, []);

  useEffect(() => { if (user) check(); }, [user, check]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    try {
      const { publicKey, enabled } = await api.get<{ publicKey: string; enabled: boolean }>('/push/vapid');
      if (!enabled || !publicKey) return false;

      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { setStatus(perm as PushStatus); return false; }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });

      const json = sub.toJSON();
      await api.post('/push/subscribe', {
        endpoint: sub.endpoint,
        keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
      });
      setStatus('subscribed');
      return true;
    } catch (e) {
      console.error('[push] subscribe KO', e);
      return false;
    }
  }, []);

  const sendTest = useCallback(async () => {
    await api.post('/push/test', {});
  }, []);

  return { status, subscribe, sendTest, refresh: check };
}

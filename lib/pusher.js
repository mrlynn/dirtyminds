import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// Server-side Pusher instance
let pusherServer;

try {
  pusherServer = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    useTLS: true,
  });
} catch (error) {
  console.error('Failed to initialize Pusher server:', error);
  pusherServer = null;
}

export { pusherServer };

// Client-side Pusher instance
export const getPusherClient = () => {
  if (typeof window === 'undefined') {
    return null; // Don't create client on server-side
  }

  const appKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!appKey || !cluster) {
    console.error('Pusher credentials missing. Check NEXT_PUBLIC_PUSHER_APP_KEY and NEXT_PUBLIC_PUSHER_CLUSTER');
    return null;
  }

  return new PusherClient(appKey, {
    cluster: cluster,
    authEndpoint: '/api/pusher/auth',
    auth: {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  });
};

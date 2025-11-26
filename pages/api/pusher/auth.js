import { pusherServer } from '../../../lib/pusher';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!pusherServer) {
    console.error('Pusher server not initialized. Check environment variables.');
    return res.status(500).json({
      error: 'Pusher server not configured',
      hint: 'Make sure PUSHER_APP_ID, NEXT_PUBLIC_PUSHER_APP_KEY, PUSHER_SECRET, and NEXT_PUBLIC_PUSHER_CLUSTER are set'
    });
  }

  const { socket_id, channel_name, user_id, user_info } = req.body;

  console.log('Auth request received:', { socket_id, channel_name, user_id, user_info });

  if (!socket_id || !channel_name) {
    console.error('Missing socket_id or channel_name');
    return res.status(400).json({ error: 'Missing socket_id or channel_name' });
  }

  try {
    // For presence channels
    if (channel_name.startsWith('presence-')) {
      // Parse user_info if it's a JSON string
      let parsedUserInfo = user_info;
      if (typeof user_info === 'string') {
        try {
          parsedUserInfo = JSON.parse(user_info);
        } catch (e) {
          console.error('Failed to parse user_info:', e);
        }
      }

      const presenceData = {
        user_id: user_id || `user-${Date.now()}`,
        user_info: parsedUserInfo || { name: 'Anonymous' },
      };

      console.log('Authorizing presence channel with:', presenceData);

      const auth = pusherServer.authorizeChannel(socket_id, channel_name, presenceData);
      console.log('Auth successful:', auth);
      return res.send(auth);
    } else {
      // For private channels
      const auth = pusherServer.authorizeChannel(socket_id, channel_name);
      return res.send(auth);
    }
  } catch (error) {
    console.error('Pusher auth error:', error);
    return res.status(500).json({ error: 'Authentication failed', details: error.message });
  }
}

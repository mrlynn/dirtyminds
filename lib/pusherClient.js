import PusherClient from 'pusher-js';

export const createPusherClient = (userId, userInfo) => {
  const pusher = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    authEndpoint: '/api/pusher/auth',
    auth: {
      params: {
        user_id: userId,
        user_info: userInfo,
      },
    },
  });

  return pusher;
};

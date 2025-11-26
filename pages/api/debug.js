export default function handler(req, res) {
  const debug = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    nextVersion: process.env.NEXT_PUBLIC_VERCEL_ENV || 'local',
    pusherConfig: {
      hasAppKey: !!process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
      hasCluster: !!process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      hasAppId: !!process.env.PUSHER_APP_ID,
      hasSecret: !!process.env.PUSHER_SECRET,
      appKeyLength: process.env.NEXT_PUBLIC_PUSHER_APP_KEY?.length || 0,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'NOT_SET',
    },
    allEnvVarsPresent: !!(
      process.env.NEXT_PUBLIC_PUSHER_APP_KEY &&
      process.env.NEXT_PUBLIC_PUSHER_CLUSTER &&
      process.env.PUSHER_APP_ID &&
      process.env.PUSHER_SECRET
    ),
    pages: [
      '/',
      '/host',
      '/join',
      '/single-player'
    ],
    apis: [
      '/api/health',
      '/api/debug',
      '/api/pusher/auth',
      '/api/game/create'
    ]
  };

  res.status(200).json(debug);
}

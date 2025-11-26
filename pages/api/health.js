export default function handler(req, res) {
  const envVars = {
    pusher: {
      hasAppKey: !!process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
      hasCluster: !!process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      hasAppId: !!process.env.PUSHER_APP_ID,
      hasSecret: !!process.env.PUSHER_SECRET,
      appKeyPrefix: process.env.NEXT_PUBLIC_PUSHER_APP_KEY?.substring(0, 5) + '...',
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    },
    allPresent: !!(
      process.env.NEXT_PUBLIC_PUSHER_APP_KEY &&
      process.env.NEXT_PUBLIC_PUSHER_CLUSTER &&
      process.env.PUSHER_APP_ID &&
      process.env.PUSHER_SECRET
    ),
  };

  res.status(200).json(envVars);
}

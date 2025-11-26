import { nanoid } from 'nanoid';

// In-memory game storage (for production, use a database)
const games = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const gameCode = nanoid(6).toUpperCase();

  const game = {
    code: gameCode,
    host: req.body.hostId,
    players: [],
    status: 'lobby',
    currentRiddleIndex: 0,
    showAnswer: false,
    buzzedIn: null,
    createdAt: Date.now(),
  };

  games.set(gameCode, game);

  // Clean up games older than 24 hours
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  for (const [code, g] of games.entries()) {
    if (g.createdAt < oneDayAgo) {
      games.delete(code);
    }
  }

  res.status(200).json({ gameCode, game });
}

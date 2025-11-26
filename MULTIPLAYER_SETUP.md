# Dirty Minds - Multiplayer Setup Guide

## Overview

The game now supports both **single-device** and **multiplayer** modes:

- **Single Device Mode**: Pass-and-play on one device (original version)
- **Multiplayer Mode**: Each player joins from their own phone using QR codes and buzzes in to answer

## Quick Start (Multiplayer)

### 1. Get Pusher API Credentials (Free)

1. Go to [https://dashboard.pusher.com](https://dashboard.pusher.com)
2. Sign up for a free account
3. Click "Create app" or use the default "getting_started" app
4. Choose "Channels" (not "Beams")
5. Select a cluster closest to you (e.g., `us2`, `eu`, etc.)
6. Click on your app and go to "App Keys" tab

### 2. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Pusher credentials:
   ```env
   NEXT_PUBLIC_PUSHER_APP_KEY=your_app_key_here
   NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster_here (e.g., us2, eu, mt1)
   PUSHER_APP_ID=your_app_id_here
   PUSHER_SECRET=your_secret_here
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## How to Play (Multiplayer)

### For the Host:

1. Click **"Host Game (Multiplayer)"**
2. A QR code and 6-digit game code will appear
3. Wait for players to scan the QR code and join
4. Click **"Start Game"** when everyone has joined
5. Read each riddle aloud
6. When someone buzzes in, they'll be highlighted on your screen
7. Click **"Reveal Answer"** to show the answer
8. Award points to the player who got it right
9. Click **"Next Riddle"** to continue

### For Players:

1. Click **"Join Game"**
2. Enter your name
3. Scan the QR code or enter the 6-digit game code
4. Wait for the host to start the game
5. When a riddle appears, tap **"BUZZ IN"** if you know the answer
6. If you buzzed in first, you'll see a green screen - tell your answer to the host!
7. If someone else buzzed in first, you'll see a red screen
8. Watch your score update in real-time

## Game Modes

### Multiplayer (Recommended for parties)
- **Join Method**: QR Code
- **Answer System**: Buzz-in (first to tap)
- **Devices**: 1 host device + multiple player phones
- **Best for**: In-person parties, team events

### Single Device (Original)
- Pass-and-play on one device
- Manual point tracking
- **Best for**: Small groups sharing one phone

## Features

- Real-time buzz-in system
- Live scoreboard updates
- QR code joining (no typing!)
- Mobile-first design
- Works on any modern smartphone
- No app installation required

## Deployment (Optional)

### Deploy to Vercel:

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_PUSHER_APP_KEY`
   - `NEXT_PUBLIC_PUSHER_CLUSTER`
   - `PUSHER_APP_ID`
   - `PUSHER_SECRET`
5. Deploy!

Once deployed, players can join from anywhere using the URL.

## Troubleshooting

### Players can't join:
- Check that your Pusher credentials are correct in `.env.local`
- Make sure all devices are on the same network (for local dev)
- Verify the game code is entered correctly (case-insensitive)

### Buzz-ins not working:
- Ensure Pusher app has "Client Events" enabled (in Pusher dashboard > App Settings)
- Check browser console for errors

### QR code not scanning:
- Make sure the QR code is displayed on a bright screen
- Players can manually enter the game code instead

## Tech Stack

- **Frontend**: Next.js 14, React, Material-UI
- **Real-time**: Pusher Channels (WebSockets)
- **Deployment**: Vercel-ready
- **Free tier limits**: 100 concurrent connections, 200k messages/day

## Pusher Dashboard Settings

Make sure to enable these in your Pusher app settings:

1. Go to "App Settings" tab
2. Enable **"Client Events"** (required for buzz-ins)
3. Enable **"Presence Channels"** (should be enabled by default)

## Support

For issues or questions:
- Check the Pusher dashboard for connection logs
- Verify environment variables are set correctly
- Ensure all players are using HTTPS in production

Enjoy the game!

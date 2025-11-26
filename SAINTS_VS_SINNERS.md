# Saints vs. Sinners Game Mode

## Overview

The Saints vs. Sinners mode adds strategic role-playing to Dirty Minds multiplayer gameplay. Each player is secretly assigned a role that determines their objective for answering riddles.

## Roles

### 😇 Saints
- **Objective**: Submit the most CORRECT/INNOCENT answer
- **Score by**: Getting the most votes for "Most Correct Answer"
- **Strategy**: Think clearly and logically about the riddle's actual meaning

### 😈 Sinners
- **Objective**: Submit the most FILTHY-SOUNDING (but safe) answer
- **Score by**: Getting the most votes for "Funniest/Filthiest Answer"
- **Strategy**: Get creative with suggestive interpretations while keeping it clean
- **Bonus**: If a Sinner wins BOTH categories (fools everyone into thinking their dirty answer is correct), they get an extra point!

## Game Flow

### 1. **Join & Role Assignment**
- Players join the game using a game code
- Host's server randomly assigns each player as SAINT or SINNER
- Players see their role privately (others can't see it)
- First player becomes the Game Master for Round 1

### 2. **Answering Phase**
- **Game Master** starts the round (rotates each round)
- Current Game Master sees "🎮 You're the Game Master!"
- Game Master reads the riddle out loud to the group
- **Game Master does NOT submit an answer** (they control the round)
- All other players see the riddle
- Other players type and submit their answer based on their role:
  - Saints: Try to guess the correct answer
  - Sinners: Submit the dirtiest-sounding (but safe) answer they can think of
- Game Master sees real-time count of submitted answers
- When ready, Game Master clicks "Lock Answers"

### 3. **Reveal Phase**
- Answers are locked (no more submissions)
- **Game Master** clicks "Reveal Answer & Start Voting"
- The correct answer is displayed
- All submitted answers are shown (with player names)

### 4. **Voting Phase**
- All players vote on answers (except their own)
- **Game Master does NOT vote** (they saw all answers with names)
- Two voting categories:
  - **Most Correct**: Which answer is closest to the real answer?
  - **Funniest/Filthiest**: Which answer is the most suggestive/funny?
- Players can vote once in each category
- **Game Master** clicks "Finish Voting & Calculate Scores" when ready

### 5. **Scoring Phase**
- System tallies votes
- Points awarded:
  - Saint with most "Correct" votes: **+1 point**
  - Sinner with most "Funniest" votes: **+1 point**
  - Sinner who wins BOTH categories: **+2 points** (bonus for fooling everyone!)
- Scores are updated
- **Game Master** clicks "Next Riddle"
- **Next player becomes the new Game Master** (rotation)
- Repeat from Step 2

## UI Features

### Player View (join.js)
- **Game Master Badge**: "🎮 You're the Game Master!" (rotates each round)
- **Role Badge**: Displays at top (😇 Saint / 😈 Sinner)
- **Role Instructions**: Tells player what kind of answer to submit
- **Phase Indicator**: Shows current game phase (Answering, Locked, Voting, Scores)
- **Answer Input**: Role-specific placeholder text (hidden for Game Master)
- **Game Master Controls**:
  - Lock Answers button (with real-time count)
  - Reveal Answer & Start Voting button
  - Finish Voting & Calculate Scores button
  - Next Riddle button
- **Voting Buttons**: Two buttons per answer (Most Correct / Funniest) - hidden for Game Master
- **Visual Feedback**: Your own answer is highlighted during voting

### Host View (host.js)
- **Answer Counter**: Shows X/Y answers received
- **Player Chips**: Color-coded by role (Green=Saint, Pink=Sinner)
- **Answer List**: Shows all answers with player names and role icons
- **Phase Controls**: Sequential buttons guide through game phases
- **Phase Status**: Chip shows current phase

## Technical Implementation

### New State Variables

**host.js:**
```javascript
gamePhase: 'waiting' | 'answering' | 'reveal' | 'voting' | 'scores'
submittedAnswers: Array<{playerId, playerName, role, answer}>
votes: { correct: {voterId: answerId}, funniest: {voterId: answerId} }
```

**join.js:**
```javascript
playerRole: 'SAINT' | 'SINNER' | null
gamePhase: 'waiting' | 'answering' | 'reveal' | 'voting' | 'scores'
myAnswer: string
hasSubmittedAnswer: boolean
allAnswers: Array<{playerId, playerName, role, answer}>
myCorrectVote: answerId
myFunniestVote: answerId
```

### New Pusher Events

#### Server → Client
- `client-role-assigned`: Notify player of their role
- `client-game-started`: Includes gamePhase: 'answering'
- `client-answers-locked`: Transition to reveal phase
- `client-reveal-answer`: Show answer + submitted answers, start voting
- `client-scores-updated`: Broadcast updated scores after voting
- `client-next-riddle`: Reset for new round

#### Client → Server
- `client-answer-submitted`: Player submits their answer
- `client-vote-cast`: Player votes (voteType: 'correct' | 'funniest')

### Scoring Algorithm
```javascript
// Count votes per answer
correctVotes = { answerId: count, ... }
funniestVotes = { answerId: count, ... }

// Find winners
correctWinnerId = answerWithMostCorrectVotes
funniestWinnerId = answerWithMostFunniestVotes

// Award points
for each player:
  if (player.role === 'SAINT' && player.id === correctWinnerId):
    player.score += 1

  if (player.role === 'SINNER' && player.id === funniestWinnerId):
    player.score += 1

  if (player.role === 'SINNER' && player.id === correctWinnerId && player.id === funniestWinnerId):
    player.score += 1  // Bonus point for winning both!
```

## Files Modified

### Core Game Logic
- `pages/host.js` - Role assignment, phase management, vote tallying, scoring
- `pages/join.js` - Role display, answer submission, voting UI

### Event Handlers Added
- `handleLockAnswers()` - Transition from answering → reveal
- `handleFinishVoting()` - Calculate winners and award points
- `handleSubmitAnswer()` - Submit player's answer
- `handleVote(voteType, answerId)` - Cast vote for an answer

### State Management
- Role assignment on player join (random 50/50 split)
- Phase transitions synced across all clients
- Answer collection and vote tallying on host
- Real-time score updates

## Strategy Tips

### For Saints 😇
- Think about the riddle literally
- What innocent everyday object fits the description?
- Don't overthink it - the answer is usually simple

### For Sinners 😈
- Look for double meanings
- Think about what sounds suggestive but is technically clean
- Be creative! The goal is to make people laugh
- Try to make your answer sound plausible - if you win both votes, you get a bonus!

### For Everyone
- Vote honestly - that's how you help the right roles win
- Pay attention to the correct answer when revealed
- Remember: Sinners WANT the dirty votes, Saints WANT the correct votes
- Have fun with the social deduction aspect!

## Backward Compatibility

The original buzz-in gameplay is still available in the codebase but has been replaced in the multiplayer mode. To restore buzz-in mode, you would need to:

1. Comment out the new phase-based UI
2. Uncomment the old buzz-in button code
3. Remove role assignment logic

Or create a game mode selector to let host choose between:
- **Classic Mode**: Buzz-in racing
- **Saints vs. Sinners Mode**: Role-based answers & voting

## Future Enhancements

Potential additions:
- Let host choose game mode (Classic vs Saints vs Sinners)
- Add "Jester" role: Get points for receiving EQUAL votes in both categories
- Team play: Saints vs Sinners team scores
- Custom role ratios (e.g., 3 Saints, 1 Sinner)
- Show role reveal at end of game
- Statistics: Track win rates per role
- Answer history: Review past rounds

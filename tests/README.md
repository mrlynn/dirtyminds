# Dirty Minds - Automated Test Harness

This directory contains automated end-to-end tests using Playwright to simulate multiplayer gameplay.

## What It Does

The test harness automatically:
1. **Creates a game** - Opens the host screen and creates a game
2. **Spawns players** - Opens multiple browser windows as different players
3. **Simulates gameplay** - Players join, submit answers, and vote
4. **Validates flow** - Ensures all phases progress correctly
5. **Takes screenshots** - Captures game state for debugging
6. **Reports results** - Shows detailed test output

## Requirements

- Node.js installed
- Dev server running (or will be started automatically)
- Chromium browser (installed via Playwright)

## Quick Start

### Option 1: Watch the Test (Headed Mode)
See browser windows as the test runs:

```bash
npm run test:headed
```

This will:
- Show you 5 browser windows (1 host + 4 players)
- Run slowly so you can see what's happening
- Complete a full round of gameplay

### Option 2: Headless Mode
Run tests in the background (faster):

```bash
npm test
```

### Option 3: Debug Mode
Step through the test interactively:

```bash
npm run test:debug
```

### Option 4: UI Mode
Use Playwright's visual test runner:

```bash
npm run test:ui
```

## Test Configuration

Edit `tests/game-flow.test.js` to customize:

```javascript
const NUM_PLAYERS = 4;      // Number of simulated players (2-8)
const HEADLESS = false;     // true = hide browsers, false = show
const BASE_URL = 'http://localhost:3000';
```

## What Gets Tested

### Phase 1: Lobby
- ✅ Host creates game
- ✅ Players join with game code
- ✅ All players appear in lobby
- ✅ Roles assigned (Saint/Sinner)

### Phase 2: Game Start
- ✅ Host clicks "Start Game"
- ✅ All screens update to game phase

### Phase 3: Riddle Display
- ✅ Riddle appears on all screens
- ✅ "Start Answering Now" button visible
- ✅ Auto-progresses after 5 seconds

### Phase 4: Answering
- ✅ Answer input appears for players
- ✅ Players can submit answers
- ✅ Host sees answer counter (X/Y)
- ✅ Progress bar updates
- ✅ Auto-progresses when all answers in

### Phase 5: Reveal Correct Answer
- ✅ Correct answer displays
- ✅ Auto-progresses after 5 seconds

### Phase 6: Reveal Player Answers
- ✅ All answers shown (anonymous)
- ✅ Players see their own answer highlighted
- ✅ Auto-progresses after timing

### Phase 7: Voting
- ✅ Vote buttons appear (Most Correct & Funniest)
- ✅ Players can cast votes
- ✅ Can't vote for own answer
- ✅ Auto-progresses when all votes in

### Phase 8: Results
- ✅ Winners displayed
- ✅ Scores updated
- ✅ Celebration shown
- ✅ "Next Round" button appears

## Test Output

### Console Output
You'll see detailed logging:
```
🎮 Starting Dirty Minds Test Harness...

📺 Host: Creating game...
✅ Game created with code: ABC123

👥 Spawning 4 players...
   - Player1 joining...
   ✓ Player1 joined successfully
   - Player2 joining...
   ✓ Player2 joined successfully
   ...

🎯 Host: Starting game...
✅ Game started!

📖 Phase: RIDDLE DISPLAY (5s countdown)
   ✓ Skip button visible
   ⏳ Waiting for auto-progression...

✏️  Phase: ANSWERING (Players submitting answers)
   ✓ Player1 submitted answer: "Answer from Player1"
   ✓ Player2 submitted answer: "Answer from Player2"
   ...

✅ All answers submitted

🎯 Phase: REVEAL CORRECT ANSWER (5s)

📋 Phase: REVEAL PLAYER ANSWERS

🗳️  Phase: VOTING (Players voting)
   ✓ Player1 voted
   ✓ Player2 voted
   ...

✅ All votes cast

🏆 Phase: RESULTS (10s)
   ✓ Round 1 complete!

✅ TEST PASSED: Complete game flow executed successfully!
```

### Screenshots
Saved to `test-results/`:
- `host-after-round1.png` - Host screen after first round
- `player1-after-round1.png` - Player 1 screen
- `player2-after-round1.png` - Player 2 screen

### HTML Report
View detailed results:
```bash
npx playwright show-report test-results/html-report
```

## Troubleshooting

### Test fails with "Timeout waiting for..."
- Check that dev server is running on port 3000
- Increase timeout in `playwright.config.js`
- Check browser console for errors

### Players can't join
- Ensure game code is being read correctly
- Check Pusher configuration in `.env.local`
- Verify Pusher auth endpoint is working

### Phases don't progress
- Check browser console for timer errors
- Verify `progressToNextPhase()` function in `host.js`
- Look for JavaScript errors in test output

### "Can't find element" errors
- Selectors may have changed - update test file
- Elements may not be rendered yet - increase wait times
- Check if phase progression is working

## Advanced Usage

### Run specific test
```bash
npx playwright test game-flow
```

### Run with different browsers
```bash
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Generate code for new tests
```bash
npx playwright codegen http://localhost:3000
```

### View test traces
```bash
npx playwright show-trace test-results/trace.zip
```

## CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright Browsers
  run: npx playwright install --with-deps chromium

- name: Run Playwright tests
  run: npm test

- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: test-results/
```

## Writing New Tests

Create a new test file in `tests/`:

```javascript
const { test, expect } = require('@playwright/test');

test('My new test', async ({ browser }) => {
  // Your test code here
});
```

## Configuration Files

- `playwright.config.js` - Main Playwright configuration
- `tests/game-flow.test.js` - Game flow test suite
- `.env.local` - Environment variables (Pusher keys)

## Useful Commands

```bash
# Run all tests
npm test

# Run with visible browsers
npm run test:headed

# Open Playwright UI
npm run test:ui

# Debug a test
npm run test:debug

# Update snapshots
npx playwright test --update-snapshots

# Show HTML report
npx playwright show-report
```

## Tips

1. **Slow down for debugging**: Increase `slowMo` in test file
2. **Pause test execution**: Add `await page.pause()` in test
3. **Inspect elements**: Use `--debug` flag and Playwright Inspector
4. **Record test**: Use `npx playwright codegen` to generate code
5. **Check screenshots**: Always review screenshots after failures

## Support

For more info on Playwright:
- [Playwright Docs](https://playwright.dev)
- [Playwright API](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)

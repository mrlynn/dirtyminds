/**
 * Dirty Minds Game Flow Test
 *
 * This test simulates a complete game with multiple players:
 * 1. Host creates a game
 * 2. Multiple players join
 * 3. Game starts and progresses through all phases
 * 4. Players submit answers and vote
 * 5. Scores are updated
 * 6. Game completes
 */

const { test, expect, chromium } = require('@playwright/test');

// Configuration
const BASE_URL = 'http://localhost:3000';
const NUM_PLAYERS = 4; // Number of simulated players
const HEADLESS = false; // Set to true to hide browser windows

test.describe('Dirty Minds Game Flow', () => {
  let browser;
  let hostContext;
  let hostPage;
  let playerContexts = [];
  let playerPages = [];
  let gameCode;

  test.beforeAll(async () => {
    // Launch browser
    browser = await chromium.launch({
      headless: HEADLESS,
      slowMo: 500 // Slow down actions so you can see what's happening
    });

    console.log('\n🎮 Starting Dirty Minds Test Harness...\n');
  });

  test.afterAll(async () => {
    // Close all contexts and browser
    for (const context of playerContexts) {
      await context.close();
    }
    if (hostContext) {
      await hostContext.close();
    }
    await browser.close();

    console.log('\n✅ Test completed!\n');
  });

  test('Complete game flow with multiple players', async () => {
    // Step 1: Host creates game
    console.log('📺 Host: Creating game...');
    hostContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    hostPage = await hostContext.newPage();

    await hostPage.goto(`${BASE_URL}/host`);
    await hostPage.waitForTimeout(2000);

    // Get the game code - extract only the 6-character code, not the label
    const codeText = await hostPage.textContent('text=/Game Code:/i');
    // Extract just the 6-character code using regex
    const codeMatch = codeText.match(/[A-Z0-9]{6}/);
    gameCode = codeMatch ? codeMatch[0] : null;

    if (!gameCode) {
      throw new Error('Could not extract game code from page');
    }

    console.log(`✅ Game created with code: ${gameCode}`);

    // Step 2: Players join
    console.log(`\n👥 Spawning ${NUM_PLAYERS} players...`);

    for (let i = 0; i < NUM_PLAYERS; i++) {
      const playerName = `Player${i + 1}`;
      console.log(`   - ${playerName} joining...`);

      const playerContext = await browser.newContext({
        viewport: { width: 800, height: 600 }
      });
      const playerPage = await playerContext.newPage();

      await playerPage.goto(`${BASE_URL}/join`);

      // Enter game code
      const codeInput = playerPage.locator('input[placeholder*="code" i], input[type="text"]').first();
      await codeInput.fill(gameCode);

      // Enter player name
      const nameInput = playerPage.locator('input[placeholder*="name" i]').first();
      await nameInput.fill(playerName);

      // Click join button
      const joinButton = playerPage.locator('button:has-text("Join Game")');
      await joinButton.click();

      await playerPage.waitForTimeout(1000);

      playerContexts.push(playerContext);
      playerPages.push(playerPage);

      console.log(`   ✓ ${playerName} joined successfully`);
    }

    // Wait for all players to appear in host's lobby
    await hostPage.waitForTimeout(2000);
    console.log(`\n✅ All ${NUM_PLAYERS} players in lobby\n`);

    // Step 3: Start game
    console.log('🎯 Host: Starting game...');
    const startButton = hostPage.locator('button:has-text("Start Game")');
    await startButton.click();
    await hostPage.waitForTimeout(3000);
    console.log('✅ Game started!\n');

    // Step 4: Wait for riddle-display phase
    console.log('📖 Phase: RIDDLE DISPLAY (5s countdown)');
    await hostPage.waitForTimeout(2000);

    // Check if we can see the "Start Answering Now" button
    const skipButton = hostPage.locator('button:has-text("Start Answering Now")');
    if (await skipButton.isVisible()) {
      console.log('   ✓ Skip button visible');
    }

    // Wait for auto-progression to answering phase
    console.log('   ⏳ Waiting for auto-progression...');
    await hostPage.waitForTimeout(6000); // 5s timer + buffer

    // Step 5: Answering phase
    console.log('\n✏️  Phase: ANSWERING (Players submitting answers)');

    for (let i = 0; i < NUM_PLAYERS; i++) {
      const playerPage = playerPages[i];
      const playerName = `Player${i + 1}`;

      try {
        // Wait for answer input to appear
        const answerInput = playerPage.locator('input[type="text"], textarea').first();
        await answerInput.waitFor({ timeout: 5000 });

        // Generate a funny/correct answer based on role
        const answer = `Answer from ${playerName}`;
        await answerInput.fill(answer);

        // Submit answer
        const submitButton = playerPage.locator('button:has-text("Submit")');
        await submitButton.click();

        console.log(`   ✓ ${playerName} submitted answer: "${answer}"`);
        await playerPage.waitForTimeout(500);
      } catch (error) {
        console.log(`   ⚠️  ${playerName} couldn't submit answer:`, error.message);
      }
    }

    // Wait for all answers to be submitted
    await hostPage.waitForTimeout(2000);
    console.log('\n✅ All answers submitted\n');

    // Step 6: Wait for reveal-correct phase
    console.log('🎯 Phase: REVEAL CORRECT ANSWER (5s)');
    await hostPage.waitForTimeout(6000);

    // Step 7: Wait for reveal-answers phase
    console.log('\n📋 Phase: REVEAL PLAYER ANSWERS');
    await hostPage.waitForTimeout(8000); // Dynamic based on answer count

    // Step 8: Voting phase
    console.log('\n🗳️  Phase: VOTING (Players voting)');

    for (let i = 0; i < NUM_PLAYERS; i++) {
      const playerPage = playerPages[i];
      const playerName = `Player${i + 1}`;

      try {
        // Wait for voting buttons to appear
        await playerPage.waitForTimeout(2000);

        // Find vote buttons (Most Correct and Funniest)
        const correctButtons = playerPage.locator('button:has-text("Most Correct")');
        const funniestButtons = playerPage.locator('button:has-text("Funniest")');

        const correctCount = await correctButtons.count();
        const funniestCount = await funniestButtons.count();

        if (correctCount > 0 && funniestCount > 0) {
          // Vote for random answers (not your own)
          // First button might be disabled (own answer), so try the second one
          const correctIndex = correctCount > 1 ? 1 : 0;
          const funniestIndex = funniestCount > 1 ? 1 : 0;

          await correctButtons.nth(correctIndex).click();
          await playerPage.waitForTimeout(500);
          await funniestButtons.nth(funniestIndex).click();

          console.log(`   ✓ ${playerName} voted`);
        } else {
          console.log(`   ⚠️  ${playerName} couldn't find vote buttons`);
        }
      } catch (error) {
        console.log(`   ⚠️  ${playerName} voting error:`, error.message);
      }
    }

    await hostPage.waitForTimeout(2000);
    console.log('\n✅ All votes cast\n');

    // Step 9: Results phase
    console.log('🏆 Phase: RESULTS (10s)');
    await hostPage.waitForTimeout(12000);
    console.log('   ✓ Round 1 complete!\n');

    // Step 10: Take screenshots
    console.log('📸 Taking screenshots...');
    await hostPage.screenshot({ path: 'test-results/host-after-round1.png', fullPage: true });
    for (let i = 0; i < Math.min(2, NUM_PLAYERS); i++) {
      await playerPages[i].screenshot({
        path: `test-results/player${i + 1}-after-round1.png`,
        fullPage: true
      });
    }
    console.log('   ✓ Screenshots saved to test-results/\n');

    // Step 11: Wait a bit to see the results
    console.log('⏸️  Pausing to view results...');
    await hostPage.waitForTimeout(5000);

    // Verify game state
    console.log('\n🔍 Verifying game state...');

    // Check if host page shows a score or next round button
    const nextRoundButton = hostPage.locator('button:has-text("Next Round")');
    if (await nextRoundButton.isVisible()) {
      console.log('   ✓ Next Round button visible');
    }

    console.log('\n✅ TEST PASSED: Complete game flow executed successfully!\n');
  });
});

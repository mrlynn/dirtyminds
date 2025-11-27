/**
 * Power-Up System for Dirty Minds
 * Players can earn and use power-ups during gameplay
 */

export const POWERUP_TYPES = {
  DOUBLE_POINTS: 'double_points',
  REVEAL_ROLE: 'reveal_role',
  EXTRA_TIME: 'extra_time',
  VOTE_STEAL: 'vote_steal',
  SKIP_ROUND: 'skip_round',
  VOTE_PEEK: 'vote_peek',
};

export const POWERUPS = {
  [POWERUP_TYPES.DOUBLE_POINTS]: {
    id: POWERUP_TYPES.DOUBLE_POINTS,
    name: 'Double Points',
    description: 'Your next win is worth 2x points',
    icon: '💎',
    color: '#FFD700',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    duration: 1, // rounds
    cost: 0, // Free when earned
    rarity: 'rare',
  },

  [POWERUP_TYPES.REVEAL_ROLE]: {
    id: POWERUP_TYPES.REVEAL_ROLE,
    name: 'Role Reveal',
    description: 'Reveal one random player\'s role',
    icon: '🔍',
    color: '#2196F3',
    gradient: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)',
    duration: 0, // Instant
    cost: 0,
    rarity: 'uncommon',
  },

  [POWERUP_TYPES.EXTRA_TIME]: {
    id: POWERUP_TYPES.EXTRA_TIME,
    name: 'Extra Time',
    description: '+30 seconds for next timed round',
    icon: '⏱️',
    color: '#4CAF50',
    gradient: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
    duration: 1,
    cost: 0,
    rarity: 'common',
  },

  [POWERUP_TYPES.VOTE_STEAL]: {
    id: POWERUP_TYPES.VOTE_STEAL,
    name: 'Vote Magnet',
    description: 'Steal 1 random vote in the next round',
    icon: '🧲',
    color: '#9C27B0',
    gradient: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
    duration: 1,
    cost: 0,
    rarity: 'epic',
  },

  [POWERUP_TYPES.SKIP_ROUND]: {
    id: POWERUP_TYPES.SKIP_ROUND,
    name: 'Skip Pass',
    description: 'Skip answering one round (no penalty)',
    icon: '⏭️',
    color: '#FF9800',
    gradient: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
    duration: 0,
    cost: 0,
    rarity: 'uncommon',
  },

  [POWERUP_TYPES.VOTE_PEEK]: {
    id: POWERUP_TYPES.VOTE_PEEK,
    name: 'Vote Peek',
    description: 'See vote counts before voting ends',
    icon: '👁️',
    color: '#00BCD4',
    gradient: 'linear-gradient(135deg, #00BCD4 0%, #26C6DA 100%)',
    duration: 1,
    cost: 0,
    rarity: 'rare',
  },
};

/**
 * Power-Up Manager Class
 * Manages player power-ups and their usage
 */
export class PowerUpManager {
  constructor() {
    this.playerPowerUps = {}; // { playerId: { powerupId: count } }
    this.activePowerUps = {}; // { playerId: { powerupId: roundsRemaining } }
  }

  /**
   * Award a random power-up to a player
   */
  awardRandomPowerUp(playerId) {
    const powerupIds = Object.keys(POWERUPS);
    const randomId = powerupIds[Math.floor(Math.random() * powerupIds.length)];
    this.awardPowerUp(playerId, randomId);
    return POWERUPS[randomId];
  }

  /**
   * Award a specific power-up to a player
   */
  awardPowerUp(playerId, powerupId) {
    if (!this.playerPowerUps[playerId]) {
      this.playerPowerUps[playerId] = {};
    }

    if (!this.playerPowerUps[playerId][powerupId]) {
      this.playerPowerUps[playerId][powerupId] = 0;
    }

    this.playerPowerUps[playerId][powerupId] += 1;
  }

  /**
   * Use a power-up
   */
  usePowerUp(playerId, powerupId) {
    if (!this.hasPowerUp(playerId, powerupId)) {
      return false;
    }

    // Decrement power-up count
    this.playerPowerUps[playerId][powerupId] -= 1;

    // Activate power-up if it has duration
    const powerup = POWERUPS[powerupId];
    if (powerup.duration > 0) {
      if (!this.activePowerUps[playerId]) {
        this.activePowerUps[playerId] = {};
      }
      this.activePowerUps[playerId][powerupId] = powerup.duration;
    }

    return true;
  }

  /**
   * Check if player has a power-up
   */
  hasPowerUp(playerId, powerupId) {
    return (
      this.playerPowerUps[playerId] &&
      this.playerPowerUps[playerId][powerupId] > 0
    );
  }

  /**
   * Get player's power-up count
   */
  getPowerUpCount(playerId, powerupId) {
    if (!this.playerPowerUps[playerId]) return 0;
    return this.playerPowerUps[playerId][powerupId] || 0;
  }

  /**
   * Get all power-ups for a player
   */
  getPlayerPowerUps(playerId) {
    if (!this.playerPowerUps[playerId]) return {};
    return this.playerPowerUps[playerId];
  }

  /**
   * Check if a power-up is active
   */
  isPowerUpActive(playerId, powerupId) {
    return (
      this.activePowerUps[playerId] &&
      this.activePowerUps[playerId][powerupId] > 0
    );
  }

  /**
   * Get active power-ups for a player
   */
  getActivePowerUps(playerId) {
    if (!this.activePowerUps[playerId]) return {};
    return this.activePowerUps[playerId];
  }

  /**
   * Decrement active power-up durations (call at end of round)
   */
  decrementPowerUps(playerId) {
    if (!this.activePowerUps[playerId]) return;

    Object.keys(this.activePowerUps[playerId]).forEach((powerupId) => {
      this.activePowerUps[playerId][powerupId] -= 1;

      if (this.activePowerUps[playerId][powerupId] <= 0) {
        delete this.activePowerUps[playerId][powerupId];
      }
    });
  }

  /**
   * Clear all power-ups for a player
   */
  clearPlayerPowerUps(playerId) {
    delete this.playerPowerUps[playerId];
    delete this.activePowerUps[playerId];
  }

  /**
   * Award power-up based on achievement
   */
  awardPowerUpForAchievement(playerId, achievementType) {
    const powerupMap = {
      on_fire: POWERUP_TYPES.DOUBLE_POINTS,
      unstoppable: POWERUP_TYPES.VOTE_STEAL,
      godlike: POWERUP_TYPES.VOTE_STEAL,
      perfect_saint: POWERUP_TYPES.EXTRA_TIME,
      perfect_sinner: POWERUP_TYPES.REVEAL_ROLE,
      comeback_kid: POWERUP_TYPES.DOUBLE_POINTS,
    };

    const powerupId = powerupMap[achievementType];
    if (powerupId) {
      this.awardPowerUp(playerId, powerupId);
      return POWERUPS[powerupId];
    }

    return null;
  }
}

/**
 * Power-Up Drop System
 * Determines when players earn power-ups
 */
export class PowerUpDropSystem {
  constructor() {
    this.dropRates = {
      onWin: 0.3, // 30% chance on win
      onStreak: 0.5, // 50% chance on 3+ streak
      onLose: 0.1, // 10% chance on loss (consolation)
      onVote: 0.05, // 5% chance per vote received
    };
  }

  /**
   * Check if player should receive a power-up
   */
  shouldDropPowerUp(context = {}) {
    const { won = false, streak = 0, votesReceived = 0, lost = false } = context;

    let dropChance = 0;

    if (won) {
      dropChance += this.dropRates.onWin;
    }

    if (streak >= 3) {
      dropChance += this.dropRates.onStreak;
    }

    if (lost) {
      dropChance += this.dropRates.onLose;
    }

    // Bonus chance for getting votes
    dropChance += votesReceived * this.dropRates.onVote;

    // Cap at 80% max
    dropChance = Math.min(dropChance, 0.8);

    return Math.random() < dropChance;
  }

  /**
   * Determine which power-up to drop based on rarity
   */
  selectPowerUpToDrop() {
    const rarityWeights = {
      common: 50,
      uncommon: 30,
      rare: 15,
      epic: 4,
      legendary: 1,
    };

    // Build weighted array
    const weightedPowerUps = [];
    Object.values(POWERUPS).forEach((powerup) => {
      const weight = rarityWeights[powerup.rarity] || 1;
      for (let i = 0; i < weight; i++) {
        weightedPowerUps.push(powerup);
      }
    });

    // Select random
    const randomIndex = Math.floor(Math.random() * weightedPowerUps.length);
    return weightedPowerUps[randomIndex];
  }
}

// Export singleton instances
let powerUpManager;
let powerUpDropSystem;

if (typeof window !== 'undefined') {
  powerUpManager = new PowerUpManager();
  powerUpDropSystem = new PowerUpDropSystem();
}

export { powerUpManager, powerUpDropSystem };

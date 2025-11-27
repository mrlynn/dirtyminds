/**
 * Achievement System for Dirty Minds
 * Tracks player accomplishments and unlocks badges
 */

export const ACHIEVEMENT_TYPES = {
  // Scoring Achievements
  FIRST_BLOOD: 'first_blood',
  PERFECT_SAINT: 'perfect_saint',
  PERFECT_SINNER: 'perfect_sinner',
  DOUBLE_WINNER: 'double_winner',
  SHUTOUT: 'shutout',
  COMEBACK_KID: 'comeback_kid',

  // Streak Achievements
  ON_FIRE: 'on_fire',
  UNSTOPPABLE: 'unstoppable',
  GODLIKE: 'godlike',

  // Participation Achievements
  FIRST_GAME: 'first_game',
  VETERAN: 'veteran',
  CENTURY_CLUB: 'century_club',

  // Social Achievements
  PARTY_STARTER: 'party_starter',
  CROWD_PLEASER: 'crowd_pleaser',

  // Special Achievements
  LUCKY_SEVEN: 'lucky_seven',
  FLAWLESS_VICTORY: 'flawless_victory',
  UNDERDOG: 'underdog',
};

export const ACHIEVEMENTS = {
  // === SCORING ACHIEVEMENTS ===
  [ACHIEVEMENT_TYPES.FIRST_BLOOD]: {
    id: ACHIEVEMENT_TYPES.FIRST_BLOOD,
    name: 'First Blood',
    description: 'Score the first point of the game',
    icon: '🎯',
    rarity: 'common',
    points: 10,
  },

  [ACHIEVEMENT_TYPES.PERFECT_SAINT]: {
    id: ACHIEVEMENT_TYPES.PERFECT_SAINT,
    name: 'Heavenly Wisdom',
    description: 'Win 5 rounds as a Saint in one game',
    icon: '😇',
    rarity: 'rare',
    points: 50,
  },

  [ACHIEVEMENT_TYPES.PERFECT_SINNER]: {
    id: ACHIEVEMENT_TYPES.PERFECT_SINNER,
    name: 'Devilish Charm',
    description: 'Win 5 rounds as a Sinner in one game',
    icon: '😈',
    rarity: 'rare',
    points: 50,
  },

  [ACHIEVEMENT_TYPES.DOUBLE_WINNER]: {
    id: ACHIEVEMENT_TYPES.DOUBLE_WINNER,
    name: 'Master Deceiver',
    description: 'As a Sinner, win both Most Correct AND Funniest votes',
    icon: '🎭',
    rarity: 'epic',
    points: 100,
  },

  [ACHIEVEMENT_TYPES.SHUTOUT]: {
    id: ACHIEVEMENT_TYPES.SHUTOUT,
    name: 'Domination',
    description: 'Win a game without any other player scoring',
    icon: '👑',
    rarity: 'legendary',
    points: 200,
  },

  [ACHIEVEMENT_TYPES.COMEBACK_KID]: {
    id: ACHIEVEMENT_TYPES.COMEBACK_KID,
    name: 'Comeback Kid',
    description: 'Win after being in last place at halfway point',
    icon: '🔥',
    rarity: 'epic',
    points: 100,
  },

  // === STREAK ACHIEVEMENTS ===
  [ACHIEVEMENT_TYPES.ON_FIRE]: {
    id: ACHIEVEMENT_TYPES.ON_FIRE,
    name: 'On Fire!',
    description: 'Win 3 rounds in a row',
    icon: '🔥',
    rarity: 'uncommon',
    points: 30,
  },

  [ACHIEVEMENT_TYPES.UNSTOPPABLE]: {
    id: ACHIEVEMENT_TYPES.UNSTOPPABLE,
    name: 'Unstoppable',
    description: 'Win 5 rounds in a row',
    icon: '⚡',
    rarity: 'rare',
    points: 75,
  },

  [ACHIEVEMENT_TYPES.GODLIKE]: {
    id: ACHIEVEMENT_TYPES.GODLIKE,
    name: 'Godlike',
    description: 'Win 7 rounds in a row',
    icon: '💫',
    rarity: 'legendary',
    points: 150,
  },

  // === PARTICIPATION ACHIEVEMENTS ===
  [ACHIEVEMENT_TYPES.FIRST_GAME]: {
    id: ACHIEVEMENT_TYPES.FIRST_GAME,
    name: 'Welcome!',
    description: 'Complete your first game',
    icon: '🎮',
    rarity: 'common',
    points: 5,
  },

  [ACHIEVEMENT_TYPES.VETERAN]: {
    id: ACHIEVEMENT_TYPES.VETERAN,
    name: 'Veteran Player',
    description: 'Play 10 games',
    icon: '🏆',
    rarity: 'uncommon',
    points: 25,
  },

  [ACHIEVEMENT_TYPES.CENTURY_CLUB]: {
    id: ACHIEVEMENT_TYPES.CENTURY_CLUB,
    name: 'Century Club',
    description: 'Play 100 games',
    icon: '💯',
    rarity: 'legendary',
    points: 500,
  },

  // === SOCIAL ACHIEVEMENTS ===
  [ACHIEVEMENT_TYPES.PARTY_STARTER]: {
    id: ACHIEVEMENT_TYPES.PARTY_STARTER,
    name: 'Party Starter',
    description: 'Host a game with 6+ players',
    icon: '🎉',
    rarity: 'uncommon',
    points: 20,
  },

  [ACHIEVEMENT_TYPES.CROWD_PLEASER]: {
    id: ACHIEVEMENT_TYPES.CROWD_PLEASER,
    name: 'Crowd Pleaser',
    description: 'Receive 10+ votes in a single round',
    icon: '⭐',
    rarity: 'rare',
    points: 40,
  },

  // === SPECIAL ACHIEVEMENTS ===
  [ACHIEVEMENT_TYPES.LUCKY_SEVEN]: {
    id: ACHIEVEMENT_TYPES.LUCKY_SEVEN,
    name: 'Lucky Seven',
    description: 'Win with exactly 7 points',
    icon: '🎰',
    rarity: 'rare',
    points: 77,
  },

  [ACHIEVEMENT_TYPES.FLAWLESS_VICTORY]: {
    id: ACHIEVEMENT_TYPES.FLAWLESS_VICTORY,
    name: 'Flawless Victory',
    description: 'Win every round you participate in (min 5 rounds)',
    icon: '💎',
    rarity: 'legendary',
    points: 250,
  },

  [ACHIEVEMENT_TYPES.UNDERDOG]: {
    id: ACHIEVEMENT_TYPES.UNDERDOG,
    name: 'Underdog',
    description: 'Win a round with the fewest total votes',
    icon: '🐕',
    rarity: 'uncommon',
    points: 15,
  },
};

export const RARITY_COLORS = {
  common: '#9E9E9E',
  uncommon: '#4CAF50',
  rare: '#2196F3',
  epic: '#9C27B0',
  legendary: '#FF9800',
};

export const RARITY_GRADIENTS = {
  common: 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)',
  uncommon: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
  rare: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)',
  epic: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
  legendary: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
};

/**
 * Achievement Tracker Class
 * Manages achievement progress and unlocks
 */
export class AchievementTracker {
  constructor() {
    this.playerStats = {
      gamesPlayed: 0,
      totalPoints: 0,
      currentStreak: 0,
      bestStreak: 0,
      saintWins: 0,
      sinnerWins: 0,
      doubleWins: 0,
      achievements: [],
    };

    this.gameStats = {
      roundsWon: 0,
      roundsPlayed: 0,
      wasLastPlace: false,
      firstPoint: null,
    };
  }

  /**
   * Load player stats from localStorage
   */
  loadStats(playerId) {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem(`dm_stats_${playerId}`);
    if (saved) {
      this.playerStats = JSON.parse(saved);
    }
  }

  /**
   * Save player stats to localStorage
   */
  saveStats(playerId) {
    if (typeof window === 'undefined') return;

    localStorage.setItem(`dm_stats_${playerId}`, JSON.stringify(this.playerStats));
  }

  /**
   * Check for newly unlocked achievements
   * Returns array of newly unlocked achievements
   */
  checkAchievements(context = {}) {
    const newAchievements = [];

    // First Blood
    if (context.firstPoint && !this.hasAchievement(ACHIEVEMENT_TYPES.FIRST_BLOOD)) {
      newAchievements.push(ACHIEVEMENTS[ACHIEVEMENT_TYPES.FIRST_BLOOD]);
    }

    // Perfect Saint
    if (this.gameStats.saintWins >= 5 && !this.hasAchievement(ACHIEVEMENT_TYPES.PERFECT_SAINT)) {
      newAchievements.push(ACHIEVEMENTS[ACHIEVEMENT_TYPES.PERFECT_SAINT]);
    }

    // Perfect Sinner
    if (this.gameStats.sinnerWins >= 5 && !this.hasAchievement(ACHIEVEMENT_TYPES.PERFECT_SINNER)) {
      newAchievements.push(ACHIEVEMENTS[ACHIEVEMENT_TYPES.PERFECT_SINNER]);
    }

    // Double Winner
    if (context.doubleWin && !this.hasAchievement(ACHIEVEMENT_TYPES.DOUBLE_WINNER)) {
      newAchievements.push(ACHIEVEMENTS[ACHIEVEMENT_TYPES.DOUBLE_WINNER]);
    }

    // On Fire (3 streak)
    if (this.playerStats.currentStreak === 3 && !this.hasAchievement(ACHIEVEMENT_TYPES.ON_FIRE)) {
      newAchievements.push(ACHIEVEMENTS[ACHIEVEMENT_TYPES.ON_FIRE]);
    }

    // Unstoppable (5 streak)
    if (this.playerStats.currentStreak === 5 && !this.hasAchievement(ACHIEVEMENT_TYPES.UNSTOPPABLE)) {
      newAchievements.push(ACHIEVEMENTS[ACHIEVEMENT_TYPES.UNSTOPPABLE]);
    }

    // Godlike (7 streak)
    if (this.playerStats.currentStreak === 7 && !this.hasAchievement(ACHIEVEMENT_TYPES.GODLIKE)) {
      newAchievements.push(ACHIEVEMENTS[ACHIEVEMENT_TYPES.GODLIKE]);
    }

    // First Game
    if (this.playerStats.gamesPlayed === 1 && !this.hasAchievement(ACHIEVEMENT_TYPES.FIRST_GAME)) {
      newAchievements.push(ACHIEVEMENTS[ACHIEVEMENT_TYPES.FIRST_GAME]);
    }

    // Veteran
    if (this.playerStats.gamesPlayed === 10 && !this.hasAchievement(ACHIEVEMENT_TYPES.VETERAN)) {
      newAchievements.push(ACHIEVEMENTS[ACHIEVEMENT_TYPES.VETERAN]);
    }

    // Century Club
    if (this.playerStats.gamesPlayed === 100 && !this.hasAchievement(ACHIEVEMENT_TYPES.CENTURY_CLUB)) {
      newAchievements.push(ACHIEVEMENTS[ACHIEVEMENT_TYPES.CENTURY_CLUB]);
    }

    // Comeback Kid
    if (context.comeback && !this.hasAchievement(ACHIEVEMENT_TYPES.COMEBACK_KID)) {
      newAchievements.push(ACHIEVEMENTS[ACHIEVEMENT_TYPES.COMEBACK_KID]);
    }

    // Party Starter
    if (context.playerCount >= 6 && !this.hasAchievement(ACHIEVEMENT_TYPES.PARTY_STARTER)) {
      newAchievements.push(ACHIEVEMENTS[ACHIEVEMENT_TYPES.PARTY_STARTER]);
    }

    // Crowd Pleaser
    if (context.votesReceived >= 10 && !this.hasAchievement(ACHIEVEMENT_TYPES.CROWD_PLEASER)) {
      newAchievements.push(ACHIEVEMENTS[ACHIEVEMENT_TYPES.CROWD_PLEASER]);
    }

    // Lucky Seven
    if (context.finalScore === 7 && context.won && !this.hasAchievement(ACHIEVEMENT_TYPES.LUCKY_SEVEN)) {
      newAchievements.push(ACHIEVEMENTS[ACHIEVEMENT_TYPES.LUCKY_SEVEN]);
    }

    // Add to player's achievement list
    newAchievements.forEach((achievement) => {
      this.playerStats.achievements.push(achievement.id);
    });

    return newAchievements;
  }

  /**
   * Check if player has achievement
   */
  hasAchievement(achievementId) {
    return this.playerStats.achievements.includes(achievementId);
  }

  /**
   * Update stats when player wins a round
   */
  recordRoundWin(role) {
    this.playerStats.currentStreak += 1;
    this.playerStats.bestStreak = Math.max(this.playerStats.bestStreak, this.playerStats.currentStreak);
    this.gameStats.roundsWon += 1;

    if (role === 'SAINT') {
      this.gameStats.saintWins = (this.gameStats.saintWins || 0) + 1;
    } else if (role === 'SINNER') {
      this.gameStats.sinnerWins = (this.gameStats.sinnerWins || 0) + 1;
    }
  }

  /**
   * Update stats when player loses a round
   */
  recordRoundLoss() {
    this.playerStats.currentStreak = 0;
  }

  /**
   * Update stats when game ends
   */
  recordGameEnd() {
    this.playerStats.gamesPlayed += 1;
    this.gameStats = {
      roundsWon: 0,
      roundsPlayed: 0,
      saintWins: 0,
      sinnerWins: 0,
      wasLastPlace: false,
      firstPoint: null,
    };
  }

  /**
   * Get achievement progress
   */
  getProgress() {
    return {
      total: Object.keys(ACHIEVEMENTS).length,
      unlocked: this.playerStats.achievements.length,
      percentage: Math.round((this.playerStats.achievements.length / Object.keys(ACHIEVEMENTS).length) * 100),
    };
  }
}

// Export singleton instance
let achievementTracker;
if (typeof window !== 'undefined') {
  achievementTracker = new AchievementTracker();
}

export default achievementTracker;

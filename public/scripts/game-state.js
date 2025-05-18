const GAME_STATE = {
  TOTAL_PAIRS: 3,
  PAIRS_LEFT: 3,
  COUNT_OF_FLIPS: 0,
  PAIRS_MATCHED: 0,
  POWERUP_AVAILABLE: false,
  LAST_PAIRS: [],
  LAST_FLIPPED: [],
  DIFFICULTY: "easy",
  TIMER: null,
};

const DIFFICULTY = {
  easy: { cards: 6, timeLimit: 30 },
  medium: { cards: 8, timeLimit: 25 },
  hard: { cards: 10, timeLimit: 20 },
};

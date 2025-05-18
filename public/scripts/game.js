import { createPokemon } from "./members.js";

/**
 * Handles the click event on a Pokemon card. If the card is already flipped or
 * there are already two cards flipped, the function returns early. Otherwise, it
 * flips the card and updates the game state. If two cards are flipped, it checks
 * if they match. If they do, it updates the pairs left and matched count. If all
 * pairs are matched, it stops the game timer. If they don't match, it flips the
 * cards back after a delay.
 *
 * @param {HTMLElement} card - The card element that was clicked.
 */

export function handleClick(card) {
  console.log("GAME_STATE", GAME_STATE);

  if (card.classList.contains("flipped") || GAME_STATE.LAST_FLIPPED.length >= 2) return;

  card.classList.add("flipped");
  GAME_STATE.COUNT_OF_FLIPS++;
  GAME_STATE.LAST_FLIPPED.push(card);

  updateKPIs();

  if (GAME_STATE.LAST_FLIPPED.length != 2) return;

  const [firstCard, secondCard] = GAME_STATE.LAST_FLIPPED;

  if (firstCard.parentElement.dataset.pokemon == secondCard.parentElement.dataset.pokemon) {
    GAME_STATE.LAST_PAIRS.push(Date.now());
    GAME_STATE.PAIRS_LEFT--;
    GAME_STATE.PAIRS_MATCHED++;
    GAME_STATE.LAST_FLIPPED = [];

    updateKPIs();

    if (GAME_STATE.PAIRS_LEFT === 0) GAME_STATE.TIMER.stop();

    checkPowerup();
  } else {
    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      GAME_STATE.LAST_FLIPPED = [];
    }, 700);
  }
}

function checkPowerup() {
  if (GAME_STATE.LAST_PAIRS.length !== 2) return;

  if (GAME_STATE.LAST_PAIRS[1] - GAME_STATE.LAST_PAIRS[0] < 1000) {
    GAME_STATE.POWERUP_AVAILABLE = true;
    document.getElementById("powerup-border").classList.add("active");
  }

  GAME_STATE.LAST_PAIRS.shift();
}

/**
 * Updates the numbers in the KPIs section of the header.
 */
function updateKPIs() {
  const kpis = Array.from(document.getElementById("kpis").children);

  for (const kpi of kpis) {
    kpi.querySelector("span").textContent = GAME_STATE[kpi.dataset.kpi];
  }
}

/**
 * Called when the game is over. Shows the overlay and either the winning text if the user won, or the losing text if the user lost.
 */
function gameOver() {
  console.log("Game Over executed");
  document.getElementById("overlay").hidden = false;

  if (GAME_STATE.PAIRS_LEFT === 0) {
    document.getElementById("winning-text").hidden = false;
  } else {
    console.log("losing condition");

    document.getElementById("losing-text").hidden = false;
  }
}

/**
 * Shows the loader and hides the game board.
 * This is called when the game starts or the board needs to be reinitialized.
 */
function showLoader() {
  document.getElementById("loader-wrapper").hidden = false;
  document.querySelector("main").hidden = true;
}

/**
 * Hides the loader and shows the game board.
 * This is called when the game has finished loading the cards.
 */
export function hideLoader() {
  document.getElementById("loader-wrapper").hidden = true;
  document.querySelector("main").hidden = false;
}

/**
 * Removes all the cards from the game board.
 * This is called when the game needs to be reinitialized.
 */
function removeCards() {
  document.querySelectorAll(".pokemon-card").forEach((card) => card.remove());
}

/**
 * Updates the CSS variable '--cols' on the board element to match the total number of pairs.
 * This adjusts the grid layout of the game board based on the current game state.
 */
function updateBoardColumns() {
  document.getElementById("board").style.setProperty("--cols", GAME_STATE.TOTAL_PAIRS);
}

/**
 * Toggles the visibility of elements related to game setup and gameplay.
 * This function hides elements with the class "game-setup" and shows
 * elements with the class "during-game" or vice versa, depending on their
 * current visibility.
 */
function convertControlPanel() {
  document.querySelectorAll(".game-setup").forEach((element) => (element.hidden = !element.hidden));
  document
    .querySelectorAll(".during-game")
    .forEach((element) => (element.hidden = !element.hidden));
}

/**
 * Starts a new game of Pokemon Matching.
 * If the game is already started, then this function does nothing.
 * Otherwise, it shows the loader, resets the game state, removes any existing cards from the board, creates new cards, creates a timer, and starts the game.
 * This function also sets up the control panel and hides the start text.
 * Finally, it updates the KPIs and hides the loader.
 */
async function startGame() {
  const numCards = DIFFICULTY[GAME_STATE.DIFFICULTY].cards;

  if (GAME_STATE.TOTAL_PAIRS != numCards / 2) {
    showLoader();

    GAME_STATE.TOTAL_PAIRS = numCards / 2;
    GAME_STATE.PAIRS_LEFT = numCards / 2;

    removeCards();
    updateBoardColumns();
    await createPokemon();
  }

  createTimer();
  //if you pass cb then it gets called not only when the timer ends put also when it is stopped or destroyed
  GAME_STATE.TIMER.animate(1.0);

  convertControlPanel();
  document.getElementById("overlay").hidden = true;
  document.getElementById("start-text").hidden = true;
  updateKPIs();

  hideLoader();
}

/**
 * Creates a new timer based on the current game state.
 *
 * If the timer already exists, it is destroyed before a new one is created.
 *
 * The timer is created with a linear easing and a duration equal to the time
 * limit of the game in milliseconds. The timer's color transitions from
 * yellow to red over its duration.
 *
 * The timer's text is updated on each step to show the remaining time in seconds.
 *
 * The timer is stored in the GAME_STATE object.
 */
function createTimer() {
  if (GAME_STATE.TIMER) {
    GAME_STATE.TIMER.destroy();
  }

  const timeLimit = DIFFICULTY[GAME_STATE.DIFFICULTY].timeLimit;

  const timer = new ProgressBar.Circle("#timer", {
    strokeWidth: 8,
    easing: "linear",
    duration: timeLimit * 1000,
    text: { className: "timer-text" },
    from: { color: "rgb(209, 153, 48)" },
    to: { color: "rgb(223, 16, 16)" },
    step: (state, circle) => {
      circle.path.setAttribute("stroke", state.color);

      const value = timeLimit - Math.round(timeLimit * circle.value());
      circle.setText(`${value}`);

      if (circle.value() == 0) gameOver();
    },
  });
  timer.path.style.strokeLinecap = "round";

  GAME_STATE.TIMER = timer;
}

/**
 * Resets the game by restoring the initial game state, showing the loader,
 * removing all existing cards from the board, and recreating the Pokemon
 * cards based on the current game settings. It also updates the control
 * panel to reflect the game state and hides the loader once the cards
 * are ready.
 */
async function resetGame() {
  resetGameState();

  showLoader();

  document.getElementById("overlay").hidden = false;
  document.getElementById("start-text").hidden = false;
  document.getElementById("winning-text").hidden = true;
  document.getElementById("losing-text").hidden = true;
  removeCards();
  convertControlPanel();
  await createPokemon(GAME_STATE.TOTAL_PAIRS * 2);

  hideLoader();
}

/**
 * Resets the game state to its initial values before starting a new game.
 * It sets the count of flips to 0, pairs left to the total number of pairs,
 * pairs matched to 0, and clears the last flipped cards.
 */
function resetGameState() {
  GAME_STATE.COUNT_OF_FLIPS = 0;
  GAME_STATE.PAIRS_LEFT = GAME_STATE.TOTAL_PAIRS;
  GAME_STATE.PAIRS_MATCHED = 0;
  GAME_STATE.LAST_FLIPPED = [];
  GAME_STATE.LAST_PAIRS = [];
  GAME_STATE.POWERUP_AVAILABLE = false;
  document.getElementById("powerup-border").classList.remove("active");
}

function activatePowerup() {
  if (!GAME_STATE.POWERUP_AVAILABLE) return;

  const unknownCards = document.querySelectorAll(".inner:not(.flipped)");

  for (const card of unknownCards) {
    card.classList.add("flipped");
  }

  setTimeout(() => {
    for (const card of unknownCards) {
      card.classList.remove("flipped");
    }
  }, 1000);

  document.getElementById("powerup-border").classList.remove("active");
}

document.getElementById("difficulty-toggle").addEventListener("change", (event) => {
  GAME_STATE.DIFFICULTY = event.target.value;
});

document.getElementById("start").addEventListener("click", () => startGame());
document.getElementById("reset").addEventListener("click", () => resetGame());
document.getElementById("activate-powerup").addEventListener("click", () => activatePowerup());

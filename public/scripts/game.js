import { createPokemon } from "./members.js";

export function handleClick(card) {
  console.log("GAME_STATE", GAME_STATE);

  if (card.classList.contains("flipped") || GAME_STATE.LAST_FLIPPED.length >= 2) return;

  card.classList.add("flipped");
  GAME_STATE.COUNT_OF_FLIPS++;
  GAME_STATE.LAST_FLIPPED.push(card);

  if (GAME_STATE.LAST_FLIPPED.length != 2) return;

  const [firstCard, secondCard] = GAME_STATE.LAST_FLIPPED;

  if (firstCard.parentElement.dataset.pokemon == secondCard.parentElement.dataset.pokemon) {
    GAME_STATE.PAIRS_LEFT--;
    GAME_STATE.PAIRS_MATCHED++;
    GAME_STATE.LAST_FLIPPED = [];
  } else {
    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      GAME_STATE.LAST_FLIPPED = [];
    }, 1000);
  }
}

function removeCards() {
  document.querySelectorAll(".pokemon-card").forEach((card) => card.remove());
}

function updateBoardColumns() {
  document.getElementById("board").style.setProperty("--cols", GAME_STATE.TOTAL_PAIRS);
}

async function startGame() {
  const numCards = DIFFICULTY[GAME_STATE.DIFFICULTY].cards;

  if (GAME_STATE.TOTAL_PAIRS != numCards / 2) {
    document.getElementById("loader-wrapper").hidden = false;
    document.querySelector("main").hidden = true;

    GAME_STATE.TOTAL_PAIRS = numCards / 2;
    GAME_STATE.PAIRS_LEFT = numCards / 2;

    removeCards();
    updateBoardColumns();
    await createPokemon(numCards);
  }

  createTimer().animate(1.0);

  document.querySelectorAll(".game-setup").forEach((element) => (element.hidden = true));
  document.querySelectorAll(".during-game").forEach((element) => (element.hidden = false));
  document.getElementById("overlay").hidden = true;

  document.getElementById("loader-wrapper").hidden = true;
  document.querySelector("main").hidden = false;
}

function createTimer() {
  const timer = new ProgressBar.Circle("#timer", {
    color: "#aaa",
    // This has to be the same size as the maximum width to
    // prevent clipping
    strokeWidth: 5,
    // trailWidth: 5,
    easing: "linear",
    duration: 20000,
    text: {},
    from: { color: "#aaa", width: 5 },
    to: { color: "#333", width: 5 },
    step: (state, circle) => {
      circle.path.setAttribute("stroke", state.color);

      const value = 20 - Math.round(20 * circle.value());
      circle.setText(value);
    },
  });
  timer.text.style.fontFamily = '"Geist", sans-serif';
  timer.text.style.fontSize = "3rem";
  timer.text.style.fontWeight = "bold";

  return timer;
}

document.getElementById("difficulty-toggle").addEventListener("change", (event) => {
  GAME_STATE.DIFFICULTY = event.target.value;
});

document.getElementById("start").addEventListener("click", () => startGame());

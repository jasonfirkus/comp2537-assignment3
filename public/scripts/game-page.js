import { handleClick, hideLoader } from "./game.js";

const NUM_POKEMON = 1302;

/**
 * Returns a Promise that resolves to an array of objects containing the name and official artwork URL of a set of random Pokemons.
 * The amount parameter specifies the number of Pokemons to return, between 1 and 1302.
 * @param {number} amount - The number of Pokemons to return.
 * @returns {Promise<Array<{name: string, imageUrl: string}>>}
 */
async function getRandomPokemonSet(amount) {
  const randomOffset = Math.floor(Math.random() * (NUM_POKEMON - amount + 1));
  console.log("randomOffset", randomOffset);

  const { results } = await (
    await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${amount}&offset=${randomOffset}`)
  ).json();

  const pokemonsPromise = results.map(async ({ name }) => {
    const imageUrl = (await (await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)).json())
      .sprites.other["official-artwork"].front_default;

    return { name, imageUrl };
  });

  return Promise.all(pokemonsPromise);
}

/**
 * Creates an array of Pokemon nodes with random images and names, and appends them to #board in a random order.
 * Each Pokemon is duplicated to create pairs.
 * Each Pokemon node is given a data attribute "pokemon" with the Pokemon's name, and a click event handler is added to trigger the game logic.
 * @returns {Promise<void>}
 */
export async function createPokemon() {
  let pokemons = await getRandomPokemonSet(GAME_STATE.TOTAL_PAIRS);
  pokemons = [...pokemons, ...pokemons];

  const pokemonNodes = pokemons.map((pokemon) => {
    const { name, imageUrl } = pokemon;
    console.log("pokemon", pokemon);

    const template = document.querySelector("template");
    const clone = template.content.cloneNode(true);

    const front = clone.querySelector(".front img");
    front.src = imageUrl;
    front.alt = name;

    clone.querySelector("div").dataset.pokemon = name;
    clone.querySelector("p").textContent = name;

    return clone;
  });

  pokemonNodes.sort(() => Math.random() - 0.5);

  const df = document.createDocumentFragment();
  for (const node of pokemonNodes) {
    df.appendChild(node);
  }

  document.getElementById("board").appendChild(df);

  document
    .querySelectorAll(".inner")
    .forEach((card) => card.addEventListener("click", () => handleClick(card)));
}

/**
 * Toggles the theme of the game between light and dark mode when the theme toggle button is clicked.
 * The theme is stored in the "data-theme" attribute of the HTML element.
 * The theme toggle button is given a class of "theme-toggle--toggled" when the theme is dark.
 */
function activateThemeToggle() {
  const themeToggle = document.querySelector(".theme-toggle");
  const html = document.querySelector("html");

  themeToggle.addEventListener("click", () => {
    let currentTheme = html.dataset.theme;
    html.dataset.theme = currentTheme === "dark" ? "light" : "dark";

    themeToggle.classList.toggle("theme-toggle--toggled");
  });
}

await createPokemon();
activateThemeToggle();

hideLoader();

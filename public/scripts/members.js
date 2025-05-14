const NUM_POKEMON = 1302;

const GAME_STATE = {
  TOTAL_PAIRS: 3,
  PAIRS_LEFT: 3,
  COUNT_OF_FLIPS: 0,
  PAIRS_MATCHED: 0,
  LAST_FLIPPED: [],
};

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

async function createPokemon(amount = 6) {
  let pokemons = await getRandomPokemonSet(amount / 2);
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
  GAME_STATE.TOTAL_PAIRS = amount / 2;
  GAME_STATE.PAIRS_LEFT = amount / 2;
}

await createPokemon();
document.querySelectorAll(".inner").forEach((card) =>
  card.addEventListener("click", (event) => {
    if (card.classList.contains("flipped")) return;

    console.log("GAME_STATE", GAME_STATE);

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
  })
);
document.getElementById("loader-wrapper").hidden = true;
document.querySelector("main").hidden = false;

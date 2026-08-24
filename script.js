const mainContainer$$ = document.querySelector(".main");
const main$$ = document.querySelector(".main");
const original150 = [];
const loader$$ = document.getElementById("loader-screen");
const result$$ = document.getElementById("result")
let isFirstLoad = true;

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Lee la stat por nombre en lugar de por posición del array de PokéAPI.
const statValue = (poke, name) => {
  const found = poke.stats.find((entry) => entry.stat.name === name);
  return found ? found.base_stat : 0;
};

const showLoader = () => {
  loader$$.style.display = "block";
};

const hideLoader = () => {
  loader$$.style.display = "none";
};

const getPokemon = async () => {
  try {
    if (isFirstLoad) {
      showLoader();
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
    for (let i = 1; i < 151; i++) {
      const singlePokemonResponse = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${i}`
      );
      const singlePokemonData = await singlePokemonResponse.json();
      const pokemon = {
        id: singlePokemonData.id,
        name: capitalizeFirstLetter(singlePokemonData.name),
        sprite: singlePokemonData.sprites.other.dream_world.front_default,
        mainType: capitalizeFirstLetter(singlePokemonData.types[0].type.name),
        type: singlePokemonData.types
          .map((type) => capitalizeFirstLetter(type.type.name))
          .join(", "),
        abilities: singlePokemonData.abilities.map((ability) =>
          capitalizeFirstLetter(ability.ability.name)
        ),
        stats: singlePokemonData.stats,
        exp: singlePokemonData.base_experience,
        sound: singlePokemonData.cries.legacy,
      };
      pokemon.abilities = pokemon.abilities.join("<br>");
      original150.push(pokemon);
    }

    if (isFirstLoad) {
      hideLoader();
      isFirstLoad = false;
    }
  } catch (error) {
    console.log(error);
  }
};

const drawCards = (pokemon, combatMeta = null) => {
  main$$.innerHTML = "";
  main$$.classList.toggle("main--duelo", Boolean(combatMeta));
  pokemon.forEach((poke, index) => {
    const meta = combatMeta?.[index] ?? null;
    const wrap$$ = document.createElement("div");
    wrap$$.className = "card-slot";
    if (meta?.outcome === "winner") wrap$$.classList.add("card-slot--winner");
    if (meta?.outcome === "loser") wrap$$.classList.add("card-slot--loser");

    if (meta?.role) {
      const role$$ = document.createElement("div");
      role$$.className = "card-role";
      role$$.textContent = meta.role;
      wrap$$.appendChild(role$$);
    }

    const characterDiv$$ = document.createElement("div");
    characterDiv$$.className = "card " + poke.mainType;
    if (meta?.outcome === "winner") characterDiv$$.classList.add("card--winner");
    if (meta?.outcome === "loser") characterDiv$$.classList.add("card--loser");
    characterDiv$$.innerHTML = `
    <h3>#${poke.id} ${poke.name} <img class="iconType ${poke.mainType}" src="img/icons/${poke.mainType}.svg" alt="Tipo ${poke.mainType}"></h3>
    <p class="exp">Exp. Inicial ${poke.exp}</p>
    <div class=imgBack><img class="pokeImg" src="${poke.sprite}" alt="${poke.name}"></div>
    <div class="cardInfo">
    <table>
      <tr>
        <td>
          <p><b>Tipo:</b><br>
          ${poke.type}</p><br>
          <p><b>Habilidades:</b><br>
          ${poke.abilities}</p>
        </td>
          <td>
          <p><b>Estadísticas:</b><br>
          HP: ${statValue(poke, "hp")}<br>
          Ataque: ${statValue(poke, "attack")}<br>
          Defensa: ${statValue(poke, "defense")}<br>
          Ataq. Esp.: ${statValue(poke, "special-attack")}<br>
          Def. Esp.: ${statValue(poke, "special-defense")}<br>
          Velocidad: ${statValue(poke, "speed")}<br>
          </p>
         </td>
      </tr>
    </table>
    
    </div>
    `;
    characterDiv$$.addEventListener("click", () => {
      playPokemonSound(poke.sound);
    });
    wrap$$.appendChild(characterDiv$$);
    main$$.appendChild(wrap$$);
  });
};

const drawCombatCards = (local, visitante, winner) => {
  const outcomeFor = (poke) => {
    if (!winner) return null;
    return poke.id === winner.id ? "winner" : "loser";
  };
  drawCards([local, visitante], [
    { role: "Local", outcome: outcomeFor(local) },
    { role: "Visitante", outcome: outcomeFor(visitante) },
  ]);
};

const combatNameBlock = (role, name, kind) => `
  <header class="combat-name combat-name--${kind}">
    <span class="combat-role-label">${role}</span>
    <span class="combat-poke-name">${name}</span>
  </header>
`;

const combatPanel = (role, name, kind, equationHtml) => `
  <article class="combat-panel combat-panel--${kind}">
    ${combatNameBlock(role, name, kind)}
    ${equationHtml}
  </article>
`;

const drawInput = () => {
  const input$$ = document.querySelector("#search input[type='text']");
  input$$.addEventListener("input", () => {
    searchpokemon(input$$.value);
  });
};

const searchpokemon = (filtro) => {
  let filteredPokemon = original150.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(filtro.toLowerCase())
  );
  drawCards(filteredPokemon);
  result$$.innerHTML = "";
};

const drawSelector = () => {
  const selector$$ = document.querySelector("select");
  selector$$.addEventListener("change", () => {
    filterType(selector$$.value);
  });
};

const filterType = (filtro) => {
  if (filtro === "default") {
    drawCards(original150);
  } else {
    let filteredType = original150.filter((pokemon) => {
      return (
        pokemon.mainType.toLowerCase() === filtro.toLowerCase() ||
        pokemon.type.toLowerCase().includes(filtro.toLowerCase())
      );
    });
    drawCards(filteredType);
  }
};

const playPokemonSound = (soundUrl) => {
  if (soundUrl) {
    const audio = new Audio(soundUrl);
    audio.volume = 0.2;
    audio.play();
  } else {
    console.log("El Pokémon no tiene sonido registrado.");
  }
};

const infoClick = "Si haces click en un Pokémon, escucharás su sonido original de la Game Boy"
const showInfoClick = () => {
  const h4 = document.querySelector("h4.infoClick");
  h4.innerText = infoClick;
}

const init = async () => {
  await getPokemon();
  drawCards(original150);
  showInfoClick();
  drawInput();
  drawSelector();
  fillPokemonSelects();
  setTimeout(() => {
  }, "3000");
};

init();

// COMBATES POKÉMON.
/* Soy consciente que esta parte del código no tiene nada que ver con lo que se pide... pero para mí, esto es una oportunidad de aprender a utilizar la lógica de programación con
algo que resulta relativamente comprensible para mi. Son números y relaciones entre los mismos de una manera que puede resultar medianamente visual. Crecí con los Pokémon y 
fueron de esas primeras cosas con las que  pasé muchas horas frente al ordenador... esto es una especie de regresión a la infancia con unos conocimientos que jamás habría podido 
tener entonces. En cierta parte, es mi yo de 9 años el que está dedicando todas estas horas a hacer funcionar un programa que no sirve para nada, pero que me está reportando 
mucho aprendizaje y mucha diversión/sufrimiento.

Seas quien seas, espero que entiendas por qué he hecho esta locura.*/

function fillPokemonSelects() {
  const pokemonSelect1 = document.getElementById("pokemon1");
  const pokemonSelect2 = document.getElementById("pokemon2");
  for (const pokemon of original150) {
    const option1 = document.createElement("option");
    option1.value = pokemon.name;
    option1.textContent = pokemon.name;
    const option2 = document.createElement("option");
    option2.value = pokemon.name;
    option2.textContent = pokemon.name;
    pokemonSelect1.appendChild(option1);
    pokemonSelect2.appendChild(option2);
  }
}

const combatButton = document.getElementById("combat-button").addEventListener("click", combat);

const penalizacion = 0.7;
const ventaja = 1.3;

/* Tabla de efectividad SIEMPRE en clave ofensiva: effectiveness[atacante][defensor].
Escala suavizada respecto al juego (2 → 1.3 y 0.5 → 0.7) para que el tipo influya
sin decidir el combate por sí solo. El 0 sí es inmunidad real. */
const effectiveness = {
  normal: { normal: 1, fighting: 1, flying: 1, poison: 1, ground: 1, rock: penalizacion, bug: 1, ghost: 0, steel: penalizacion, fire: 1, water: 1, grass: 1, electric: 1, psychic: 1, ice: 1, dragon: 1, dark: 1, fairy: 1 },
  fighting: { normal: ventaja, fighting: 1, flying: penalizacion, poison: penalizacion, ground: 1, rock: ventaja, bug: penalizacion, ghost: 0, steel: ventaja, fire: 1, water: 1, grass: 1, electric: 1, psychic: penalizacion, ice: ventaja, dragon: 1, dark: ventaja, fairy: penalizacion },
  flying: { normal: 1, fighting: ventaja, flying: 1, poison: 1, ground: 1, rock: penalizacion, bug: ventaja, ghost: 1, steel: penalizacion, fire: 1, water: 1, grass: ventaja, electric: penalizacion, psychic: 1, ice: 1, dragon: 1, dark: 1, fairy: 1 },
  poison: { normal: 1, fighting: 1, flying: 1, poison: penalizacion, ground: penalizacion, rock: penalizacion, bug: 1, ghost: penalizacion, steel: 0, fire: 1, water: 1, grass: ventaja, electric: 1, psychic: 1, ice: 1, dragon: 1, dark: 1, fairy: ventaja },
  ground: { normal: 1, fighting: 1, flying: 0, poison: ventaja, ground: 1, rock: ventaja, bug: penalizacion, ghost: 1, steel: ventaja, fire: ventaja, water: 1, grass: penalizacion, electric: ventaja, psychic: 1, ice: 1, dragon: 1, dark: 1, fairy: 1 },
  rock: { normal: 1, fighting: penalizacion, flying: ventaja, poison: 1, ground: penalizacion, rock: 1, bug: ventaja, ghost: 1, steel: penalizacion, fire: ventaja, water: 1, grass: 1, electric: 1, psychic: 1, ice: ventaja, dragon: 1, dark: 1, fairy: 1 },
  bug: { normal: 1, fighting: penalizacion, flying: penalizacion, poison: penalizacion, ground: 1, rock: 1, bug: 1, ghost: penalizacion, steel: penalizacion, fire: penalizacion, water: 1, grass: ventaja, electric: 1, psychic: ventaja, ice: 1, dragon: 1, dark: ventaja, fairy: penalizacion },
  ghost: { normal: 0, fighting: 1, flying: 1, poison: 1, ground: 1, rock: 1, bug: 1, ghost: ventaja, steel: 1, fire: 1, water: 1, grass: 1, electric: 1, psychic: ventaja, ice: 1, dragon: 1, dark: penalizacion, fairy: 1 },
  steel: { normal: 1, fighting: 1, flying: 1, poison: 1, ground: 1, rock: ventaja, bug: 1, ghost: 1, steel: penalizacion, fire: penalizacion, water: penalizacion, grass: 1, electric: penalizacion, psychic: 1, ice: ventaja, dragon: 1, dark: 1, fairy: ventaja },
  fire: { normal: 1, fighting: 1, flying: 1, poison: 1, ground: 1, rock: penalizacion, bug: ventaja, ghost: 1, steel: ventaja, fire: penalizacion, water: penalizacion, grass: ventaja, electric: 1, psychic: 1, ice: ventaja, dragon: penalizacion, dark: 1, fairy: 1 },
  water: { normal: 1, fighting: 1, flying: 1, poison: 1, ground: ventaja, rock: ventaja, bug: 1, ghost: 1, steel: 1, fire: ventaja, water: penalizacion, grass: penalizacion, electric: 1, psychic: 1, ice: 1, dragon: penalizacion, dark: 1, fairy: 1 },
  grass: { normal: 1, fighting: 1, flying: penalizacion, poison: penalizacion, ground: ventaja, rock: ventaja, bug: penalizacion, ghost: 1, steel: penalizacion, fire: penalizacion, water: ventaja, grass: penalizacion, electric: 1, psychic: 1, ice: 1, dragon: penalizacion, dark: 1, fairy: 1 },
  electric: { normal: 1, fighting: 1, flying: ventaja, poison: 1, ground: 0, rock: 1, bug: 1, ghost: 1, steel: 1, fire: 1, water: ventaja, grass: penalizacion, electric: penalizacion, psychic: 1, ice: 1, dragon: penalizacion, dark: 1, fairy: 1 },
  psychic: { normal: 1, fighting: ventaja, flying: 1, poison: ventaja, ground: 1, rock: 1, bug: 1, ghost: 1, steel: penalizacion, fire: 1, water: 1, grass: 1, electric: 1, psychic: penalizacion, ice: 1, dragon: 1, dark: 0, fairy: 1 },
  ice: { normal: 1, fighting: 1, flying: ventaja, poison: 1, ground: ventaja, rock: 1, bug: 1, ghost: 1, steel: penalizacion, fire: penalizacion, water: penalizacion, grass: ventaja, electric: 1, psychic: 1, ice: penalizacion, dragon: ventaja, dark: 1, fairy: 1 },
  dragon: { normal: 1, fighting: 1, flying: 1, poison: 1, ground: 1, rock: 1, bug: 1, ghost: 1, steel: penalizacion, fire: 1, water: 1, grass: 1, electric: 1, psychic: 1, ice: 1, dragon: ventaja, dark: 1, fairy: 0 },
  dark: { normal: 1, fighting: penalizacion, flying: 1, poison: 1, ground: 1, rock: 1, bug: 1, ghost: ventaja, steel: 1, fire: 1, water: 1, grass: 1, electric: 1, psychic: ventaja, ice: 1, dragon: 1, dark: penalizacion, fairy: penalizacion },
  fairy: { normal: 1, fighting: ventaja, flying: 1, poison: penalizacion, ground: 1, rock: 1, bug: 1, ghost: 1, steel: penalizacion, fire: penalizacion, water: 1, grass: 1, electric: 1, psychic: 1, ice: 1, dragon: ventaja, dark: ventaja, fairy: 1 },
};

const round4 = (n) => Number(n.toFixed(4));

const getEffectiveness = (tipoAtacante, tipoDefensor) => {
  const fila = effectiveness[tipoAtacante.toLowerCase()];
  const valor = fila?.[tipoDefensor.toLowerCase()];
  if (valor === undefined) {
    console.log(`Sin efectividad definida para ${tipoAtacante} → ${tipoDefensor}`);
    return 1;
  }
  return valor;
};

const effectivenessLabel = (valor) => {
  if (valor === 0) return "inmune";
  if (valor > 1) return "ventaja";
  if (valor < 1) return "penalización";
  return "neutral";
};

/* Puntuación de un Pokémon frente a otro: no es daño, es una nota que sale de sus
seis estadísticas contra las defensas del rival, ajustada por tipo y por suerte. */
const buildScore = (atacante, defensor) => {
  const hp = statValue(atacante, "hp");
  const ataque = statValue(atacante, "attack");
  const ataqueEspecial = statValue(atacante, "special-attack");
  const velocidad = statValue(atacante, "speed");
  const defensaRival = statValue(defensor, "defense");
  const defensaEspecialRival = statValue(defensor, "special-defense");
  const tipo = getEffectiveness(atacante.mainType, defensor.mainType);
  const suerte = round4(0.85 + Math.random() * 0.3);
  const puntuacion = round4(
    ((hp * (ataque + ataqueEspecial)) / (defensaRival + defensaEspecialRival)) *
      (velocidad / 100) *
      tipo *
      suerte
  );
  return {
    hp,
    ataque,
    ataqueEspecial,
    velocidad,
    defensaRival,
    defensaEspecialRival,
    tipo,
    suerte,
    puntuacion,
  };
};

const playCombatSound = () => {
    const combatSoundUrl = ("media/battle.mp3")
    const combatSound = new Audio(combatSoundUrl);
    combatSound.volume = 0.2;
    combatSound.play();
};

// Crear y ocultar loader del combate para dar sensación de que el cálculo es más complicado de lo que es o_o'
const combatLoader$$ = document.getElementById("combat-loader-screen");


let isFirstCombat = true;


const showCombatLoader = () => {
  if (isFirstCombat) {
    playCombatSound();
    isFirstCombat = false;
  }

  return new Promise(resolve => {
    combatLoader$$.style.display = "block";
    setTimeout(() => {
      resolve();
    }, 4000); // 4000 milisegundos de tiempo de espera
  });
};

const hideCombatLoader = () => {
  combatLoader$$.style.display = "none";
};

async function combat() {
  await showCombatLoader();
  hideCombatLoader();

  const pokemon1Name = document.getElementById("pokemon1").value;
  const pokemon2Name = document.getElementById("pokemon2").value;
  if (!pokemon1Name || !pokemon2Name) {
    alert("Por favor, selecciona dos Pokémon para combatir.");
    return;
  }
  const pokemon1 = original150.find((pokemon) => pokemon.name === pokemon1Name);
  const pokemon2 = original150.find((pokemon) => pokemon.name === pokemon2Name);

  const score1 = buildScore(pokemon1, pokemon2);
  const score2 = buildScore(pokemon2, pokemon1);

  const chip = (attr, value, colorClass) =>
    `<span class="formula-chip formula-chip--${colorClass}"><span class="formula-chip__attr">${attr}</span><span class="formula-chip__val">${value}</span></span>`;

  // Los decimales se muestran fijos: 51.995 y 51.9950 son el mismo número, pero
  // la fórmula se lee mejor si todos los valores tienen el mismo formato.
  const dec4 = (n) => n.toFixed(4);

  const buildEquation = (score, colorClass) => {
    const rivalClass = colorClass === "verde" ? "rojo" : "verde";
    const nota =
      score.tipo === 0
        ? "Tipo inmune: no puede puntuar"
        : `Tipo ${effectivenessLabel(score.tipo)} (×${score.tipo})`;
    return `
    <div class="ecuacion">
      <div class="ecuacion__label">Puntuación</div>
      <div class="formula" aria-label="Cálculo de la puntuación">
        <span class="formula-group">
          <span class="formula-paren">(</span>
          ${chip("HP", score.hp, colorClass)}
          <span class="formula-op">×</span>
          <span class="formula-paren">(</span>
          ${chip("Atq", score.ataque, colorClass)}
          <span class="formula-op">+</span>
          ${chip("Atq.Esp", score.ataqueEspecial, colorClass)}
          <span class="formula-paren">)</span>
          <span class="formula-paren">)</span>
        </span>
        <span class="formula-op formula-op--div">÷</span>
        <span class="formula-group">
          <span class="formula-paren">(</span>
          ${chip("Def.rival", score.defensaRival, rivalClass)}
          <span class="formula-op">+</span>
          ${chip("Def.Esp.rival", score.defensaEspecialRival, rivalClass)}
          <span class="formula-paren">)</span>
        </span>
        <span class="formula-op">×</span>
        <span class="formula-group">
          <span class="formula-paren">(</span>
          ${chip("Vel", score.velocidad, colorClass)}
          <span class="formula-op formula-op--div">÷</span>
          <span class="formula-chip formula-chip--neutral"><span class="formula-chip__val">100</span></span>
          <span class="formula-paren">)</span>
        </span>
        <span class="formula-op">×</span>
        ${chip("Tipo", score.tipo, colorClass)}
        <span class="formula-op">×</span>
        ${chip("Suerte", dec4(score.suerte), colorClass)}
      </div>
      <div class="ecuacion__result">
        <span class="ecuacion__equals">=</span>
        <span class="power-result power-result--${colorClass}">${dec4(score.puntuacion)}</span>
      </div>
      <p class="ecuacion__note">${nota}</p>
    </div>`;
  };

  const roleOf = (poke) => (poke.id === pokemon1.id ? "Local" : "Visitante");

  // Gana la puntuación más alta. Solo empatan si ambas son 0 (inmunidad mutua):
  // ahí decide la velocidad, que si no el combate quedaría sin resolver.
  let winner = null;
  if (score1.puntuacion !== score2.puntuacion) {
    winner = score1.puntuacion > score2.puntuacion ? pokemon1 : pokemon2;
  } else if (score1.velocidad !== score2.velocidad) {
    winner = score1.velocidad > score2.velocidad ? pokemon1 : pokemon2;
  }

  if (winner) {
    const ganaLocal = winner === pokemon1;
    const ganaPoke = ganaLocal ? pokemon1 : pokemon2;
    const pierdePoke = ganaLocal ? pokemon2 : pokemon1;
    const ganaScore = ganaLocal ? score1 : score2;
    const pierdeScore = ganaLocal ? score2 : score1;
    const mismaPuntuacion = score1.puntuacion === score2.puntuacion;
    result$$.innerHTML = `
      <div class="combat-result">
        ${combatPanel(roleOf(ganaPoke), ganaPoke.name, "ganador", buildEquation(ganaScore, "verde"))}
        <p class="gana">${mismaPuntuacion ? "es más rápido y gana a" : "gana el combate a"}</p>
        ${combatPanel(roleOf(pierdePoke), pierdePoke.name, "perdedor", buildEquation(pierdeScore, "rojo"))}
      </div>
    `;
    drawCombatCards(pokemon1, pokemon2, winner);
    console.log(
      `${ganaPoke.name} ${ganaScore.puntuacion} - ${pierdePoke.name} ${pierdeScore.puntuacion}`
    );
  } else {
    result$$.innerHTML = `
      <div class="combat-result combat-result--empate">
        <p class="gana">¡Empate a ${score1.puntuacion.toFixed(4)} puntos y misma velocidad!</p>
        ${combatNameBlock("Local", pokemon1.name, "empate")}
        ${combatNameBlock("Visitante", pokemon2.name, "empate")}
      </div>
    `;
    drawCombatCards(pokemon1, pokemon2, null);
    console.log(`Empatan a ${score1.puntuacion} puntos`);
  }
}

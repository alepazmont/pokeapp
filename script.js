const mainContainer$$ = document.querySelector(".main");
const main$$ = document.querySelector(".main");
const original150 = [];
const loader$$ = document.getElementById("loader-screen");
const result$$ = document.getElementById("result")
let isFirstLoad = true;

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
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
          HP: ${poke.stats[0].base_stat}<br>
          Ataque: ${poke.stats[1].base_stat}<br>
          Defensa: ${poke.stats[2].base_stat}<br>
          Ataq. Esp.: ${poke.stats[3].base_stat}<br>
          Def. Esp.: ${poke.stats[4].base_stat}<br>
          Velocidad: ${poke.stats[5].base_stat}<br>
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
  <div class="combat-name combat-name--${kind}">
    <span class="combat-role-label">${role}</span>
    <span class="combat-poke-name">${name}</span>
  </div>
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

const effectiveness = {
  normal: { normal: 1, fighting: 1, flying: 1, poison: 1, ground: 1, rock: penalizacion, bug: 1, ghost: 0, steel: penalizacion, fire: 1, water: 1, grass: 1, electric: 1, psychic: 1, ice: 1, dragon: 1, dark: 1, fairy: 1 },
  fighting: { normal: ventaja, fighting: 1, flying: penalizacion, poison: penalizacion, ground: 1, rock: ventaja, bug: penalizacion, ghost: 0, steel: ventaja, fire: 1, water: 1, grass: 1, electric: 1, psychic: 1, ice: ventaja, dragon: 1, dark: penalizacion, fairy: ventaja },
  flying: { normal: 1, fighting: ventaja, flying: 1, poison: 1, ground: 1, rock: penalizacion, bug: ventaja, ghost: 1, steel: penalizacion, fire: 1, water: 1, grass: penalizacion, electric: ventaja, psychic: 1, ice: 1, dragon: 1, dark: 1, fairy: 1 },
  poison: { normal: 1, fighting: 1, flying: 1, poison: penalizacion, ground: penalizacion, rock: penalizacion, bug: 1, ghost: penalizacion, steel: 0, fire: 1, water: 1, grass: ventaja, electric: 1, psychic: 1, ice: 1, dragon: 1, dark: 1, fairy: penalizacion },
  ground: { normal: 1, fighting: 1, flying: 0, poison: ventaja, ground: 1, rock: ventaja, bug: penalizacion, ghost: 1, steel: ventaja, fire: ventaja, water: 1, grass: penalizacion, electric: ventaja, psychic: 1, ice: 1, dragon: 1, dark: 1, fairy: 1 },
  rock: { normal: 1, fighting: penalizacion, flying: ventaja, poison: 1, ground: penalizacion, rock: 1, bug: ventaja, ghost: 1, steel: penalizacion, fire: ventaja, water: 1, grass: 1, electric: 1, psychic: 1, ice: ventaja, dragon: 1, dark: 1, fairy: 1 },
  bug: { normal: 1, fighting: penalizacion, flying: penalizacion, poison: 1, ground: 1, rock: 1, bug: 1, ghost: penalizacion, steel: penalizacion, fire: penalizacion, water: 1, grass: ventaja, electric: 1, psychic: ventaja, ice: 1, dragon: 1, dark: ventaja, fairy: penalizacion },
  ghost: { normal: 0, fighting: 0, flying: 1, poison: 1, ground: 1, rock: 1, bug: 1, ghost: ventaja, steel: penalizacion, fire: 1, water: 1, grass: 1, electric: 1, psychic: 1, ice: 1, dragon: 1, dark: ventaja, fairy: 1 },
  steel: { normal: 1, fighting: 1, flying: 1, poison: 1, ground: 1, rock: ventaja, bug: 1, ghost: 1, steel: penalizacion, fire: penalizacion, water: penalizacion, grass: 1, electric: penalizacion, psychic: 1, ice: ventaja, dragon: 1, dark: 1, fairy: ventaja },
  fire: { normal: 1, fighting: 1, flying: 1, poison: 1, ground: 1, rock: penalizacion, bug: ventaja, ghost: 1, steel: ventaja, fire: penalizacion, water: penalizacion, grass: ventaja, electric: 1, psychic: 1, ice: ventaja, dragon: penalizacion, dark: 1, fairy: 1 },
  water: { normal: 1, fighting: 1, flying: 1, poison: 1, ground: ventaja, rock: ventaja, bug: 1, ghost: 1, steel: 1, fire: ventaja, water: penalizacion, grass: penalizacion, electric: 1, psychic: 1, ice: 1, dragon: penalizacion, dark: 1, fairy: 1 },
  grass: { normal: 1, fighting: 1, flying: penalizacion, poison: penalizacion, ground: ventaja, rock: ventaja, bug: penalizacion, ghost: 1, steel: penalizacion, fire: penalizacion, water: ventaja, grass: penalizacion, electric: 1, psychic: 1, ice: 1, dragon: penalizacion, dark: 1, fairy: 1 },
  electric: { normal: 1, fighting: 1, flying: ventaja, poison: 1, ground: 0, rock: 1, bug: 1, ghost: 1, steel: 1, fire: 1, water: ventaja, grass: penalizacion, electric: penalizacion, psychic: 1, ice: 1, dragon: penalizacion, dark: 1, fairy: 1 },
  psychic: { normal: 1, fighting: ventaja, flying: 1, poison: ventaja, ground: 1, rock: 1, bug: 1, ghost: 1, steel: penalizacion, fire: 1, water: 1, grass: 1, electric: 1, psychic: penalizacion, ice: 1, dragon: 1, dark: 0, fairy: 1 },
  ice: { normal: 1, fighting: 1, flying: 1, poison: 1, ground: 1, rock: 1, bug: 1, ghost: 1, steel: ventaja, fire: ventaja, water: penalizacion, grass: penalizacion, electric: 1, psychic: 1, ice: penalizacion, dragon: ventaja, dark: 1, fairy: 1 },
  dragon: { normal: 1, fighting: 1, flying: 1, poison: 1, ground: 1, rock: 1, bug: 1, ghost: 1, steel: penalizacion, fire: 1, water: 1, grass: 1, electric: 1, psychic: 1, ice: 1, dragon: ventaja, dark: 1, fairy: 0 },
  dark: { normal: 1, fighting: penalizacion, flying: 1, poison: 1, ground: 1, rock: 1, bug: 1, ghost: ventaja, steel: 1, fire: 1, water: 1, grass: 1, electric: 1, psychic: 2, ice: 1, dragon: 1, dark: penalizacion, fairy: penalizacion },
}

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

  const hp1 = pokemon1.stats[0].base_stat;
  const ataque1 = pokemon1.stats[1].base_stat;
  const defensa1 = pokemon1.stats[2].base_stat;
  const ataqueEspecial1 = pokemon1.stats[3].base_stat;
  const defensaEspecial1 = pokemon1.stats[4].base_stat;
  const velocidad1 = pokemon1.stats[5].base_stat;

  const hp2 = pokemon2.stats[0].base_stat;
  const ataque2 = pokemon2.stats[1].base_stat;
  const defensa2 = pokemon2.stats[2].base_stat;
  const ataqueEspecial2 = pokemon2.stats[3].base_stat;
  const defensaEspecial2 = pokemon2.stats[4].base_stat;
  const velocidad2 = pokemon2.stats[5].base_stat;

  const round4 = (n) => Number(n.toFixed(4));

  // Factor aleatorio 0.85–1.15 (suerte del combate), a 4 decimales.
  const factorAleatorio1 = round4(0.85 + Math.random() * 0.3);
  const factorAleatorio2 = round4(0.85 + Math.random() * 0.3);

  // Efectividad de tipo atacante → tipo rival.
  function getEffectiveness(objArray, pokemon1Type, pokemon2Type) {
    const type1 = pokemon1Type.toLowerCase();
    const type2 = pokemon2Type.toLowerCase();
    if (objArray[type1] && objArray[type1][type2] !== undefined) {
      return objArray[type1][type2];
    }
    console.log("No se encontró una efectividad definida para estos tipos de Pokémon.");
    return 1;
  }

  const multiplicadorTipo1 = getEffectiveness(
    effectiveness,
    pokemon1.mainType,
    pokemon2.mainType
  );
  const multiplicadorTipo2 = getEffectiveness(
    effectiveness,
    pokemon2.mainType,
    pokemon1.mainType
  );

  const power1 = round4(
    ((hp1 * (ataque1 + ataqueEspecial1)) / (defensa2 + defensaEspecial2)) *
      (velocidad1 / 100) *
      multiplicadorTipo1 *
      factorAleatorio1
  );
  const power2 = round4(
    ((hp2 * (ataque2 + ataqueEspecial2)) / (defensa1 + defensaEspecial1)) *
      (velocidad2 / 100) *
      multiplicadorTipo2 *
      factorAleatorio2
  );

  const term = (attr, value, colorClass) =>
    `<mrow><mtext class="attr-label">${attr}&nbsp;</mtext><mn class="${colorClass}">${value}</mn></mrow>`;

  // own = stats of attacker; against = rival defenses used in the denominator.
  const buildEquation = (own, against, colorClass, power) => `
    <div class="ecuacion">Power = (<math xmlns="http://www.w3.org/1998/Math/MathML">
      <mfenced>
        <mfrac>
          <mrow>
            ${term("HP", own.hp, colorClass)}
            <mo>×</mo>
            <mo>(</mo>
            ${term("Atq", own.ataque, colorClass)}
            <mo>+</mo>
            ${term("Atq.Esp", own.ataqueEspecial, colorClass)}
            <mo>)</mo>
          </mrow>
          <mrow>
            ${term("Def.rival", against.defensa, colorClass === "verde" ? "rojo" : "verde")}
            <mo>+</mo>
            ${term("Def.Esp.rival", against.defensaEspecial, colorClass === "verde" ? "rojo" : "verde")}
          </mrow>
        </mfrac>
      </mfenced>
      <mo>×</mo>
      <mfenced>
        <mfrac>
          ${term("Vel", own.velocidad, colorClass)}
          <mn>100</mn>
        </mfrac>
      </mfenced>
      <mo>×</mo>
      ${term("Tipo", own.multiplicadorTipo, colorClass)}
      <mo>×</mo>
      ${term("Suerte", own.factorAleatorio, colorClass)}
    </math>) = <span class="${colorClass} power-result">${power}</span></div>
  `;

  const stats1 = {
    hp: hp1,
    ataque: ataque1,
    ataqueEspecial: ataqueEspecial1,
    velocidad: velocidad1,
    multiplicadorTipo: multiplicadorTipo1,
    factorAleatorio: factorAleatorio1,
  };
  const stats2 = {
    hp: hp2,
    ataque: ataque2,
    ataqueEspecial: ataqueEspecial2,
    velocidad: velocidad2,
    multiplicadorTipo: multiplicadorTipo2,
    factorAleatorio: factorAleatorio2,
  };
  const def1 = { defensa: defensa1, defensaEspecial: defensaEspecial1 };
  const def2 = { defensa: defensa2, defensaEspecial: defensaEspecial2 };

  const roleOf = (poke) => (poke.id === pokemon1.id ? "Local" : "Visitante");

  if (power1 > power2) {
    result$$.innerHTML = `
      ${combatNameBlock(roleOf(pokemon1), pokemon1.name, "ganador")}
      ${buildEquation(stats1, def2, "verde", power1)}
      <div class="gana">gana el combate a</div>
      ${combatNameBlock(roleOf(pokemon2), pokemon2.name, "perdedor")}
      ${buildEquation(stats2, def1, "rojo", power2)}
    `;
    drawCombatCards(pokemon1, pokemon2, pokemon1);
    console.log(pokemon1.name, power1, "-", pokemon2.name, power2);
  } else if (power1 < power2) {
    result$$.innerHTML = `
      ${combatNameBlock(roleOf(pokemon2), pokemon2.name, "ganador")}
      ${buildEquation(stats2, def1, "verde", power2)}
      <div class="gana">gana el combate a</div>
      ${combatNameBlock(roleOf(pokemon1), pokemon1.name, "perdedor")}
      ${buildEquation(stats1, def2, "rojo", power1)}
    `;
    drawCombatCards(pokemon1, pokemon2, pokemon2);
    console.log(pokemon2.name, power2, "-", pokemon1.name, power1);
  } else {
    result$$.innerHTML = `
      <div class="gana">¡Empate! (${power1} = ${power2})</div>
      ${combatNameBlock("Local", pokemon1.name, "empate")}
      ${combatNameBlock("Visitante", pokemon2.name, "empate")}
    `;
    drawCombatCards(pokemon1, pokemon2, null);
    console.log(`Empatan ${power1} = ${power2}`);
  }
}

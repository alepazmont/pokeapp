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

const drawCards = (pokemon) => {
  main$$.innerHTML = "";
  for (const poke of pokemon) {
    let characterDiv$$ = document.createElement("div");
    characterDiv$$.className = "card " + poke.mainType;
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
    main$$.appendChild(characterDiv$$);
  }
};

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

// Factor aleatorio entre 0.85 y ventaja5 con redondeo a tres decimales. Algo parecido a la suerte en un combate.
const factorAleatorio1 = (0.85 + Math.random() * 0.3);
const factorAleatorio2 = (0.85 + Math.random() * 0.3);
  

// Cálculo de la efectividad de un Pókemon frente a otro. Imprescindible en un combate Pokémon.
  function getEffectiveness(objArray, pokemon1Type, pokemon2Type) {
    // Convierte los tipos de Pokémon a minúsculas para que coincidan con las claves del objeto de efectividad.
    const type1 = pokemon1Type.toLowerCase();
    const type2 = pokemon2Type.toLowerCase();
  
    // Verifica si existen las claves de tipo en el objeto de efectividad.
    if (objArray[type1] && objArray[type1][type2]) {
        // Si existe la efectividad para ambos tipos, devuelve el valor de efectividad correspondiente.
        return objArray[type1][type2];
    } else {
        // Si no se encuentra la efectividad, imprime un mensaje informativo y devuelve 1, efectividad estándar.
        console.log("No se encontró una efectividad definida para estos tipos de Pokémon.");
        return 1;
    }
}

  const multiplicadorTipo1 = getEffectiveness(effectiveness, pokemon1.mainType, pokemon2.mainType);
  const multiplicadorTipo2 = getEffectiveness(effectiveness, pokemon2.mainType, pokemon1.mainType);
  

console.log(`Multiplicador ${pokemon1} = ${multiplicadorTipo1} | Multiplicador ${pokemon1} =  ${multiplicadorTipo2}`);
    

  const power1 =
    (((hp1 * (ataque1 + ataqueEspecial1)) / (defensa2 + defensaEspecial2)) *
    (velocidad1 / 100) *
    multiplicadorTipo1 *
    factorAleatorio1);
  const power2 =
    (((hp2 * (ataque2 + ataqueEspecial2)) / (defensa1 + defensaEspecial1)) *
    (velocidad2 / 100) *
    multiplicadorTipo2 *
    factorAleatorio2);

  let winner;
  let looser;


  if (power1 > power2) {
    winner = pokemon1;
    looser = pokemon2;

    const resultText = `
    <div class="ganador">${pokemon1.name}</div><br>
    <div class="ecuacion">Power  = (<math xmlns="http://www.w3.org/1998/Math/MathML">
    <mfenced>
        <mtable>
            <mtr>
                <mtd>
                    <mfrac>
                        <mrow>
                            <mo class="verde">${hp1}</mo>
                            <mo>×</mo>
                            <mo>(</mo>
                            <mo class="verde">${ataque1}</mo>
                            <mo>+</mo>
                            <mo class="verde">${ataqueEspecial1}</mo>
                            <mo>)</mo>
                        </mrow>
                        <mrow>
                            <mo class="rojo">${defensa1}</mo>
                            <mo>+</mo>
                            <mo class="rojo">${defensaEspecial1}</mo>
                        </mrow>
                    </mfrac>
                </mtd>
            </mtr>
        </mtable>
    </mfenced>
    <mo>×</mo>
    <mfenced>
        <mtable>
            <mtr>
                <mtd>
                    <mfrac>
                        <mrow>
                            <mo class="verde">${velocidad1}</mo>
                        </mrow>
                        <mn>100</mn>
                    </mfrac>
                </mtd>
            </mtr>
        </mtable>
    </mfenced>
    <mo>×</mo>
    <mo class="verde">${multiplicadorTipo1}</mo>
    <mo>×</mo>
    <mo class="verde">${factorAleatorio1}</mo>
</math>) = ${power1}</div><br>
    <div class="gana">gana el combate a</div><br>
    <div class="perdedor">${pokemon2.name}</div><br>
    <div class="ecuacion">Power  = (<math xmlns="http://www.w3.org/1998/Math/MathML">
    <mfenced>
        <mtable>
            <mtr>
                <mtd>
                    <mfrac>
                        <mrow>
                            <mo class="rojo">${hp2}</mo>
                            <mo>×</mo>
                            <mo>(</mo>
                            <mo class="rojo">${ataque2}</mo>
                            <mo>+</mo>
                            <mo class="rojo">${ataqueEspecial2}</mo>
                            <mo>)</mo>
                        </mrow>
                        <mrow>
                            <mo class="verde">${defensa2}</mo>
                            <mo>+</mo>
                            <mo class="verde">${defensaEspecial2}</mo>
                        </mrow>
                    </mfrac>
                </mtd>
            </mtr>
        </mtable>
    </mfenced>
    <mo>×</mo>
    <mfenced>
        <mtable>
            <mtr>
                <mtd>
                    <mfrac>
                        <mrow>
                            <mo class="rojo">${velocidad2}</mo>
                        </mrow>
                        <mn>100</mn>
                    </mfrac>
                </mtd>
            </mtr>
        </mtable>
    </mfenced>
    <mo>×</mo>
    <mo class="rojo">${multiplicadorTipo2}</mo>
    <mo>×</mo>
    <mo class="rojo">${factorAleatorio2}</mo>
</math>) = ${power2}</div>  
`;

result$$.innerHTML = resultText;

main$$.innerHTML = "";

drawCards([winner, looser]);

console.log(pokemon1.name, power1, "-", pokemon2.name, power2);

  } else if (power1 < power2) {
    winner = pokemon2;
    looser = pokemon1;    
    const resultText = `
    <div class="ganador">${pokemon2.name}</div><br>
    <div class="ecuacion">Power  = (<math xmlns="http://www.w3.org/1998/Math/MathML">
    <mfenced>
        <mtable>
            <mtr>
                <mtd>
                    <mfrac>
                        <mrow>
                            <mo class="verde">${hp2}</mo>
                            <mo>×</mo>
                            <mo>(</mo>
                            <mo class="verde">${ataque2}</mo>
                            <mo>+</mo>
                            <mo class="verde">${ataqueEspecial2}</mo>
                            <mo>)</mo>
                        </mrow>
                        <mrow>
                            <mo class="rojo">${defensa2}</mo>
                            <mo>+</mo>
                            <mo class="rojo">${defensaEspecial2}</mo>
                        </mrow>
                    </mfrac>
                </mtd>
            </mtr>
        </mtable>
    </mfenced>
    <mo>×</mo>
    <mfenced>
        <mtable>
            <mtr>
                <mtd>
                    <mfrac>
                        <mrow>
                            <mo class="verde">${velocidad2}</mo>
                        </mrow>
                        <mn>100</mn>
                    </mfrac>
                </mtd>
            </mtr>
        </mtable>
    </mfenced>
    <mo>×</mo>
    <mo class="verde">${multiplicadorTipo2}</mo>
    <mo>×</mo>
    <mo class="verde">${factorAleatorio2}</mo>
</math>) = ${power2}</div><br>
    <div class="gana">gana el combate a</div><br>
    <div class="perdedor">${pokemon1.name}</div><br>
    <div class="ecuacion">(Power  = (<math xmlns="http://www.w3.org/1998/Math/MathML">
    <mfenced>
        <mtable>
            <mtr>
                <mtd>
                    <mfrac>
                        <mrow>
                            <mo class="rojo">${hp1}</mo>
                            <mo>×</mo>
                            <mo>(</mo>
                            <mo class="rojo">${ataque1}</mo>
                            <mo>+</mo>
                            <mo class="rojo">${ataqueEspecial1}</mo>
                            <mo>)</mo>
                        </mrow>
                        <mrow>
                            <mo class="verde">${defensa1}</mo>
                            <mo>+</mo>
                            <mo class="verde">${defensaEspecial1}</mo>
                        </mrow>
                    </mfrac>
                </mtd>
            </mtr>
        </mtable>
    </mfenced>
    <mo>×</mo>
    <mfenced>
        <mtable>
            <mtr>
                <mtd>
                    <mfrac>
                        <mrow>
                            <mo class="rojo">${velocidad1}</mo>
                        </mrow>
                        <mn>100</mn>
                    </mfrac>
                </mtd>
            </mtr>
        </mtable>
    </mfenced>
    <mo>×</mo>
    <mo class="rojo">${multiplicadorTipo1}</mo>
    <mo>×</mo>
    <mo class="rojo">${factorAleatorio1}</mo>
</math>) = ${power1}</div>  
`;


result$$.innerHTML = resultText;

main$$.innerHTML = "";

drawCards([winner, looser]);

console.log(pokemon2.name, power2, "-", pokemon1.name, power1);

} else {
document.getElementById("result").textContent = `¡Empate!`;
drawCards([pokemon1, pokemon2]);

console.log(`Empatan ${power1} = ${power2}`);
}

}

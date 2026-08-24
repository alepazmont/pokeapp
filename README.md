# MiniPokedex / pokeapp

[Demo en vivo → alepaz.es/pokeapp](https://alepaz.es/pokeapp/)

Pokédex de la primera generación (151) hecha en **HTML + CSS + JavaScript vanilla**, consumiendo [PokéAPI](https://pokeapi.co/). Empezó como ejercicio de fetch y DOM… y terminó siendo otra cosa.

## Lo loco del proyecto

El enunciado pedía una Pokédex. Yo me embarqué en un **sistema de combates**.

No bastaba con listar Pokémon: quería que dos bichos se enfrentaran y que el resultado **tuviera pinta de combate de verdad**. Eso implica:

1. **Tabla de efectividad de tipos** completa (ventaja / neutral / penalización / inmunidad).
2. Una **ecuación de poder** casera que mezcla HP, ataque, ataque especial, defensas, velocidad, multiplicador de tipo y un factor aleatorio tipo “suerte del combate” (0.85–1.15).
3. **MathML** en pantalla para enseñar la fórmula con los números reales de cada combate (porque si vas a inventarte un motor, al menos que se vea la cuenta).
4. Loader teatral de 4 segundos + tema de batalla, para simular que “el cálculo es más complicado de lo que es” (spoiler: el comentario en el código lo confiesa).

En resumen: un ejercicio de API que se convirtió en un motor de duelos con física inventada, UI de cartas y soundtrack. Del “saca los 150 y filtro por tipo” al “¿quién gana Charizard vs Blastoise y por cuánto?”.

## Qué hace

- Carga los **151** de Kanto desde PokéAPI (sprites Dream World, tipos, habilidades, stats, cries).
- **Filtro por tipo** y **búsqueda por nombre**.
- Cartas clicables con sonido del Pokémon.
- Selector **Combate Pokémon**: elige dos, pulsa *Combatir*, ve el ganador y la ecuación.

## Stack

- HTML / CSS / JS (sin frameworks)
- [PokéAPI](https://pokeapi.co/)
- Assets propios (fondos por tipo, iconos SVG, gifs de carga/combate)

## Cómo abrirlo en local

Es estático: sirve la carpeta con cualquier servidor local.

```bash
# ejemplo
npx serve .
# o
python3 -m http.server 8080
```

Abre la URL que te indique el servidor (p. ej. `http://localhost:3000`).

> Nota: necesita red para llamar a PokéAPI.

## Origen

Proyecto de práctica del bootcamp (Upgrade Hub). Extraído y publicado como demo propia.

## Licencia / aviso

Pokémon es marca de Nintendo / Creatures / Game Freak. Este proyecto es **no comercial**, educativo y de portfolio. Los datos vienen de PokéAPI; los assets visuales de combate/UI son del autor salvo sprites/cries de la API.

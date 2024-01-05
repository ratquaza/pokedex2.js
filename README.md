# pokedex2.js
A TypeScript wrapper for the PokeAPI, based on my [Pokedex2 C# library](https://github.com/ratquaza/Pokedex2).

## Basic Usage
```js
import dex from 'pokedex2.js'

dex("rayquaza-mega").then((pokemon) => {
    console.log(pokemon)
});
```
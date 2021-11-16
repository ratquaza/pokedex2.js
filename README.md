# pokedex2.js
A node.js port of the [Pokedex2 C# library](https://github.com/ratquaza/Pokedex2).

Currently, the Pokedex only holds minimal data on each Pokemon. 

## Basic Usage
```js
const dex = require('pokedex2.js');

dex("rayquaza-mega").then((pokemon) => {
    console.log(`${pokemon.displayName}`)
});
```

## Installing
```
npm install pokedex2.js
```

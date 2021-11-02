# pokedex2.js
A node.js port of the [Pokedex2 C# library](https://github.com/ratquaza/Pokedex2).

Currently, the Pokedex only holds minimal data on each Pokemon. 

## Basic Usage
```js
const dex = require('pokedex2.js');

dex("Rayquaza").then((pokemon) => {
    // If this is the first request for Rayquaza, 
    // pokedex2.js will make a GET request and process the data.
}); 

dex("Rayquaza").then((pokemon) => {
    // Rayquaza's data exists in the registry by now, so no GET 
    // request will be made.
}); 

dex("Rayquaza")
// Optionally, if you are certain the data has been loaded already
// you can use this to get the Pokemon directly

dex(savedPokemon).then((pokemon) => {
    // Loading Pokemon JSONs from file
    // can be parsed into the dex too,
    // with all functions and values
});

dex.massLoad().then(() => {
    // Mass-load every Pokemon (excluding forms) for
    // efficiency
});

dex.getLoaded();
// Returns all currently loaded Pokemon

dex.exists("rayquaza");
// Check if data has been loaded
```

## Installing
```
npm install pokedex2.js
```

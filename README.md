# pokedex2.js
A node.js port of the [Pokedex2 C# library](https://github.com/ratquaza/Pokedex2).

Currently, the Pokedex only holds minimal data on each Pokemon. 

## Basic Usage
```js
const dex = require('pokedex2.js');

dex("Rayquaza").then((pokemon) => {
    // If this is the first request for Rayquaza, pokedex2.js will make a GET request and process the data.
}); 

dex("Rayquaza").then((pokemon) => {
    // Rayquaza's data exists in the registry by now, so no GET request will be made.
}); 
```

## Installing
```
npm install pokedex2.js
```
OR
```
git clone https://github.com/ratquaza/pokedex2.js.git && cd pokedex2.js && npm install && tsc
```

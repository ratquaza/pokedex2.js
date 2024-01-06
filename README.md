# pokedex2.js
A TypeScript wrapper for the PokeAPI, based on my [Pokedex2 C# library](https://github.com/ratquaza/Pokedex2).

## Basic Usage
```js
import dex from 'pokedex2.js'

dex("rayquaza-mega").then((pokemon) => {
    console.log(pokemon)
});
```

## Documentation
### Pokemon Class

`name: string` - Name of the Pokémon, used internally.

`displayName: string` - Display name of the Pokémon (e.g. "Mr. Mime").

`species: string` - The Pokémon's species.

`generation: number` - The Pokémon's originating Generation.

`index: number` - The species Pokedex ID.

`apiIndex: number` - The internal ID of the Pokémon in PokeAPI's database. 

`baby: boolean` - Whether the Pokémon is a baby or not.

`arctype: Arctype` - The [Arctype](https://github.com/ratquaza/pokedex2.js/wiki/Arctype-Enum) of the Pokémon.

`formtype: FormType` - The [FormType](https://github.com/ratquaza/pokedex2.js/wiki/FormType-Enum) of the Pokémon.

`regional: Regional` - The [Regional](https://github.com/ratquaza/pokedex2.js/wiki/Regional-Enum) form of the Pokémon.

`types: string[]` - The Pokémon's [Typings](https://pokemondb.net/type).

`forms: string[]` - All the Pokémon's different forms.

`eovlutions: string[]` All of the evolutions available to the species.

`getSprite(front: boolean = true, female: boolean = false, shiny: boolean = false): string?` - Returns the sprite that matches the criteria, or `undefined`.

### Arctype Enum

`Arctype.Normal` - "Normal" Pokémon.

`Arctype.Mythical` - Mythical Pokémon.

`Arctype.Legendary` - Legendary Pokémon.

`Arctype.Ultrabeast` - Ultrabeast Pokémon.

`Arctype.Paradox` - Paradox Pokémon.

### FormType Enum

`FormType.Default` - Default form.

`FormType.Mega` - Mega form.

`FormType.Primal` - Primal form.

`FormType.GMax` - Gigantamax form.

`FormType.Other` - Other forms that are not the default.

### Regional Enum

`Regional.None` - No regional variant

`Regional.Alola` - Alolan variant

`Regional.Galar` - Galarian variant

`Regional.Hisui` - Hisuian variant

`Regional.Paldea` - Paldean variant

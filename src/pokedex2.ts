import axios from "axios";
import Pokemon from './pokemon';
import * as Collections from 'typescript-collections';

const registry: Collections.Dictionary<string, Pokemon> = new Collections.Dictionary<string, Pokemon>();
const idToName: Collections.Dictionary<number, string> = new Collections.Dictionary<number, string>();

const loadPokemon = async (id: string|number):Promise<Pokemon> => {
    try {
        let pokemonData = (await axios.get("https://pokeapi.co/api/v2/pokemon/" + id)).data;
        let speciesData = (await axios.get(pokemonData["species"]["url"])).data;

        let pokemon: Pokemon = await Pokemon.loadPokemon(speciesData, pokemonData);

        registry.setValue(pokemon.pokemonName, pokemon);
        idToName.setValue(pokemon.ID, pokemon.pokemonName);
        return pokemon;
    } catch (e) {
        return undefined;
    }
}

const dexFunction = async (poke: string|number):Promise<Pokemon> => {
    if (typeof(poke) === "number") {
        if (idToName.containsKey(poke)) {
            poke = idToName.getValue(poke);
        } else {
            return loadPokemon(poke);
        }   
    } else {
        poke = poke.toLowerCase().replace(" ", "-").replace(/[^a-zA-Z0-9-]/, "");
    }

    if (registry.containsKey(poke)) {
        return registry.getValue(poke);
    } else {
        return loadPokemon(poke);
    }
};

dexFunction.massLoad = async ():Promise<void[]> => {
    let pokemon = (await axios.get("https://pokeapi.co/api/v2/pokemon")).data;
    pokemon = (await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${pokemon.count}`)).data.results;
  
    let promises = [];
  
    for (let i = 0; i < Math.ceil(pokemon.length/200); i++) {
      promises.push(new Promise<void>(async (res, rej) => {
        let min = Math.min(pokemon.length - 1, (i + 1) * 200);
        console.log(`Promise ${i + 1} started`);
        for (let x = i * 200 + 1; x <= min; x++) {
          await dexFunction(pokemon[x].name);
        }
        console.log(`Promise ${i + 1} ended`);
        res();
      }));
    }

    return Promise.all(promises);
}

dexFunction.getLoaded = ():Collections.Dictionary<string, Pokemon> => {
    return registry;
}

dexFunction.exists = (poke: string|number):boolean => {
    return typeof(poke) === "number" ? idToName.containsKey(poke) : registry.containsKey(poke);
}

dexFunction.fromJSON = (poke: object):Pokemon => {
    let pokemon: Pokemon = Object.assign(new Pokemon(), poke);
    registry.setValue(pokemon.pokemonName, pokemon);
    idToName.setValue(pokemon.ID, pokemon.pokemonName);
    return pokemon;
}

export = dexFunction;
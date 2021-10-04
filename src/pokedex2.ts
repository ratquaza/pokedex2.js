import axios from "axios";
import Pokemon from './pokemon';
import * as Collections from 'typescript-collections';
import { type } from "os";

const registry: Collections.Dictionary<string, Pokemon> = new Collections.Dictionary<string, Pokemon>();
const idToName: Collections.Dictionary<number, string> = new Collections.Dictionary<number, string>();

const loadPokemon = async (id: string|number):Promise<Pokemon> => {
    try {
        let pokemonData = (await axios.get("https://pokeapi.co/api/v2/pokemon/" + id)).data;
        let speciesData = (await axios.get(pokemonData["species"]["url"])).data;

        let pokemon: Pokemon = await Pokemon.loadPokemon(speciesData, pokemonData);

        registry.setValue(pokemon._internalPokemonName, pokemon);
        idToName.setValue(pokemon.id, pokemon._internalPokemonName);
        return pokemon;
    } catch (e) {
        throw new SyntaxError("Pokemon " + id + " threw an error.");
    }
}

const dexFunction = async (poke: string|number|object):Promise<Pokemon> => {
    if (typeof(poke) === "string" || typeof(poke) === "number") {
        if (typeof(poke) === "string") {
            poke = poke.toLowerCase().replace("\ ", "-").replace(/[^a-zA-Z0-9 -]/, "");
            if (registry.containsKey(poke)) {
                return registry.getValue(poke);
            } else {
                return loadPokemon(poke);
            }
        } else if (typeof(poke) === "number") {
            if (idToName.containsKey(poke)) {
                poke = idToName.getValue(poke);
                return registry.getValue(poke);
            } else {
                return loadPokemon(poke);
            }   
        }
    } else if (typeof(poke) === "object") {
        let pokemon: Pokemon = Object.assign(new Pokemon(), poke);
        registry.setValue(pokemon._internalPokemonName, pokemon);
        idToName.setValue(pokemon.id, pokemon._internalPokemonName);
        return pokemon;
    }
};

dexFunction.massLoad = async function():Promise<void[]> {
    let loadAll =  async function(min:number, max:number):Promise<void> {
        for (let i:number = min; i <= max; i++) {
          await dexFunction(i);
        }
        return;
    }

    let promises: Promise<void>[] = [
        loadAll(1, 100),
        loadAll(101, 200),
        loadAll(201, 300),
        loadAll(301, 400),
        loadAll(401, 500),
        loadAll(501, 600),
        loadAll(601, 700),
        loadAll(701, 800),
        loadAll(801, 898)
    ];

    return Promise.all(promises);
}

dexFunction.getLoaded = function():Collections.Dictionary<string, Pokemon> {
    return registry;
}

export = dexFunction;
import Pokemon from './pokemon.js';
import { Dictionary } from 'typescript-collections';

const cache: Dictionary<string, Pokemon> = new Dictionary<string, Pokemon>();
const idToName: Dictionary<number, string> = new Dictionary<number, string>();

const internalLoad = async (id: string|number):Promise<Pokemon> => {

    let pokemonData = await (await fetch("https://pokeapi.co/api/v2/pokemon/" + id)).json() as any;
    let speciesData = await (await fetch(pokemonData["species"]["url"])).json() as any;
    let evoData = (await (await fetch(speciesData["evolution_chain"]["url"])).json() as any)["chain"]

    let pokemon: Pokemon = new Pokemon(speciesData, pokemonData, evoData);
    cache.setValue(pokemon.name, pokemon);
    idToName.setValue(pokemon.apiIndex, pokemon.name);

    return pokemon;
}

export function fromJSON(poke: object):Pokemon {
    let pokemon: Pokemon = Object.assign(new Pokemon(), poke);
    cache.setValue(pokemon.name, pokemon);
    idToName.setValue(pokemon.apiIndex, pokemon.name);
    return pokemon;
}

export default async (poke: string|number):Promise<Pokemon> => {
    if (typeof(poke) === "number") {
        if (idToName.containsKey(poke)) {
            poke = idToName.getValue(poke);
        } else {
            return internalLoad(poke);
        }   
    } else {
        poke = poke.toLowerCase().replace(" ", "-").replace(/[^a-zA-Z0-9-]/, "");
    }

    if (cache.containsKey(poke)) {
        return cache.getValue(poke);
    } else {
        return internalLoad(poke);
    }
};
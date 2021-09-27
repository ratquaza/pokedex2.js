import axios from "axios";
import Pokemon from './pokemon';

const registry: {[key: string]: Pokemon} = {};

module.exports = async (poke: string|number):Promise<Pokemon> => {
    if (typeof(poke) === "string" || typeof(poke) === "number") {
        if (typeof(poke) === "string") {
            poke = poke.toLowerCase().replace("\ ", "-").replace(/[^a-zA-Z0-9 -]/, "");
        }
        if (registry[poke] == undefined) {
            try {
                let pokemonData = (await axios.get("https://pokeapi.co/api/v2/pokemon/" + poke)).data;
                let speciesData = (await axios.get(pokemonData["species"]["url"])).data;
    
                let pokemon: Pokemon = await Pokemon.loadPokemon(speciesData, pokemonData);
    
                registry[pokemon._internalPokemonName] = pokemon;
                registry[pokemon.id] = pokemon;
                return pokemon;
            } catch (e) {
                throw new SyntaxError("Pokemon " + poke + " was not found!");
            }
        } else {
            return registry[poke];
        }
    } else if (typeof(poke) === "object") {
        let pokemon: Pokemon = Object.assign(poke, new Pokemon());
        registry[pokemon._internalPokemonName] = pokemon;
        registry[pokemon.id] = pokemon;
        return pokemon;
    }
};
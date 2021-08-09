import axios from "axios";
import Type from "./type";
import Pokemon from './pokemon';

const registry: {[key: string]: Pokemon} = {};

module.exports = async (poke: string|number):Promise<Pokemon> => {
    if (typeof(poke) === "string") poke = poke.toLowerCase().replace("\ ", "-").replace(/[^a-zA-Z0-9 -]/, "");
    if (registry[poke] == undefined) {
        try {
            let speciesData = (await axios.get("https://pokeapi.co/api/v2/pokemon-species/" + poke)).data;
            let pokemonData = (await axios.get(speciesData["varieties"][0]["pokemon"]["url"])).data;

            let pokemon: Pokemon = await Pokemon.loadPokemon(speciesData, pokemonData);

            registry[poke] = pokemon;
            return pokemon;
        } catch (e) {
            throw new SyntaxError("Pokemon " + poke + " was not found!");
        }
    } else {
        return registry[poke];
    }
};
import axios from "axios";
import Pokemon from './pokemon';

const registry: {[key: string]: Pokemon} = {};

const dexFunction = async (poke: string|number|object):Promise<Pokemon> => {
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
        let pokemon: Pokemon = Object.assign(new Pokemon(), poke);
        registry[pokemon._internalPokemonName] = pokemon;
        registry[pokemon.id] = pokemon;
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

dexFunction.getLoaded = function():{[key: string]: Pokemon} {
    return { ...registry };
}

export default dexFunction;
import Arctype from './arctype';
import Type from './type';
import axios from 'axios';

export default class Pokemon {
    private static readonly BOX_URL: string = "https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/";

    readonly name: string;
    readonly id: number;
    readonly generation: number;

    readonly _internalPokemonName: string;
    readonly _internalSpeciesName: string;
    readonly _apiID: number;

    readonly isDefault: boolean;
    readonly isBaby: boolean;
    readonly arctype: Arctype;

    private readonly types: Type[];
    private readonly maleSprites: string[];
    private readonly femaleSprites: string[];
    private readonly boxSprites: string[];

    private readonly forms: string[] = [];
    private evolutions: string[] = [];

    constructor(species: any = null, pokemon: any = null) {
        if (species && pokemon) {
            let names: Array<any> = species["names"];
            for (let i = 0; i < names.length; i++) {
                if (names[i]["language"]["name"] === "en") {
                    this.name = names[i]["name"];
                    break;
                }
            }
    
            this._internalPokemonName = pokemon["name"];
            this._internalSpeciesName = species["name"];
    
            let generationString: string = species["generation"]["url"];
            this.generation = Number.parseInt(generationString.substring(generationString.length - 2, generationString.length - 1));
            this.id = species["id"];
            this._apiID = pokemon["id"];
    
            this.isDefault = pokemon["is_default"];
            this.isBaby = species["is_baby"];
    
            if (species["is_legendary"]) {
                this.arctype = Arctype.Legendary;
            } else if (species["is_mythical"]) {
                this.arctype = Arctype.Mythical;
            } else if ((this.id >= 793 && this.id <= 799) || (this.id >= 803 && this.id <= 806)) {
                this.arctype = Arctype.Ultrabeast;
            } else {
                this.arctype = Arctype.Normal;
            }
    
            let typeArray: Array<any> = pokemon["types"];
            this.types = new Array<Type>(2);
            this.types[0] = typeArray[0]["type"]["name"];
            if (typeArray.length > 1) {
                this.types[1] = typeArray[1]["type"]["name"];
            } else {
                this.types[1] = typeArray[0]["type"]["name"];;
            }
    
            let spriteObject = pokemon["sprites"];
            this.maleSprites = [
                spriteObject["front_default"],
                spriteObject["front_shiny"],
                spriteObject["back_default"],
                spriteObject["back_shiny"]
            ];
            this.femaleSprites = pokemon["sprites"]["front_female"] || this.maleSprites;

            this.boxSprites = [
                `${Pokemon.BOX_URL}regular/${this.isDefault ? this._internalSpeciesName : this._internalPokemonName}.png`,
                `${Pokemon.BOX_URL}shiny/${this.isDefault ? this._internalSpeciesName : this._internalPokemonName}.png`
            ];
    
            let varietyArray: Array<any> = species["varieties"];
            for (let i = 0; i < varietyArray.length; i++) {
                if (varietyArray[i].pokemon.name !== this._internalPokemonName) this.forms.push(varietyArray[i].pokemon.name)
            }
        }
    }

    public getSprite = (front: boolean = true, female: boolean = false, shiny: boolean = false):string => {
        let index: number = (front ? 0 : 2) + (shiny ? 1 : 0);
        return female ? this.femaleSprites[index] : this.maleSprites[index];
    };

    public getBoxSprite = (shiny: boolean = false):string => {
        return this.boxSprites[shiny ? 1 : 0];
    }

    public toString = ():string => {
        return "Pokemon{" + this.name + "," + this.types[0] + (this.types[1] == this.types[0] ? "" : " " + this.types[1]) + "}";
    }

    public getForms = ():string[] => {
        return this.forms;
    }

    public getEvolutions = ():string[] => {
        return this.evolutions;
    }

    public getTyping = ():Type[] => {
        return this.types[0] == this.types[1] ? [this.types[0]] : this.types;
    }

    public static async loadPokemon(species: any, pokemon: any):Promise<Pokemon> {
        let p: Pokemon = new Pokemon(species, pokemon);

        let evolutionData: any = Pokemon.getEvolutionData((await axios.get(species["evolution_chain"]["url"])).data["chain"], p._internalSpeciesName);
        let evolutions = evolutionData["evolves_to"];

        if (evolutions.length > 0)
        {
            for (let i = 0; i < evolutions.length; i++)
            {
                p.evolutions.push(evolutions[i]["species"]["name"]);
            }
        }

        return p;
    }

    private static getEvolutionData(baseChain: any, internalName: string):any
    {
        if (baseChain["species"]["name"] == internalName)
        {
            return baseChain;
        } else
        {
            let chain: Array<any> = baseChain["evolves_to"];
            for (let i = 0; i < chain.length; i++) {
                let data = Pokemon.getEvolutionData(chain[i], internalName);
                if (data != null) {
                    return data;
                }
            }
            return null;
        }
    }
}
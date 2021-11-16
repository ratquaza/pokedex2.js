import Arctype from './arctype';
import Type from './type';
import axios from 'axios';
import FormType from './formtype';
import Regional from './regional';

export default class Pokemon {
    private static readonly BOX_URL: string = "https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/";

    readonly displayName: string;
    public readonly ID: number;
    public readonly generation: number;

    public readonly pokemonName: string;
    public readonly speciesName: string;
    public readonly internalID: number;

    public readonly default: boolean;
    public readonly baby: boolean;
    public readonly arctype: Arctype;
    public readonly formtype: FormType;
    public readonly regional: Regional;

    public readonly types: Type[];
    private readonly maleSprites: string[];
    private readonly femaleSprites: string[];
    private readonly boxSprites: string[];

    public readonly forms: string[] = [];
    public readonly evolutions: string[] = [];

    constructor(species: any = null, pokemon: any = null) {
        if (species && pokemon) {
            this.displayName = species.names.find((spec: any) => spec.language.name === "en").name;

            this.pokemonName = pokemon["name"];
            this.speciesName = species["name"];
    
            let generationString: string = species["generation"]["url"];
            this.generation = Number.parseInt(generationString.substring(generationString.length - 2, generationString.length - 1));
            this.ID = species["id"];
            this.internalID = pokemon["id"];
    
            this.default = pokemon["is_default"];
            this.baby = species["is_baby"];
    
            if (species["is_legendary"]) {
                this.arctype = Arctype.Legendary;
            } else if (species["is_mythical"]) {
                this.arctype = Arctype.Mythical;
            } else if ((this.ID >= 793 && this.ID <= 799) || (this.ID >= 803 && this.ID <= 806)) {
                this.arctype = Arctype.Ultrabeast;
            } else {
                this.arctype = Arctype.Normal;
            }

            let additionalName = this.pokemonName.substring(this.speciesName.length);
            if (additionalName.includes("-mega")) {
                this.formtype = FormType.Mega;
            } else if (additionalName.includes("-gmax")) {
                this.formtype = FormType.GMax;
            } else if (additionalName.includes("-primal")) {
                this.formtype = FormType.Primal;
            } else if (additionalName.length > 0) {
                this.formtype = FormType.Other
            } else {
                this.formtype = FormType.Default;
            }

            if (this.speciesName === "pikachu") {
                this.regional = Regional.Standard;
            } else {
                if (additionalName.includes("-alola")) {
                    this.regional = Regional.Alolan;
                } else if (additionalName.includes("-galar")) {
                    this.regional = Regional.Galarian;
                } else {
                    this.regional = Regional.Standard;
                }
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
                `${Pokemon.BOX_URL}regular/${this.default ? this.speciesName : this.pokemonName}.png`,
                `${Pokemon.BOX_URL}shiny/${this.default ? this.speciesName : this.pokemonName}.png`
            ];
    
            let varietyArray: Array<any> = species["varieties"];
            for (let i = 0; i < varietyArray.length; i++) {
                if (varietyArray[i].pokemon.name !== this.pokemonName) this.forms.push(varietyArray[i].pokemon.name)
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
        return "Pokemon{" + this.displayName + ", " + this.types.join(" ") + "}";
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

        let evolutionData: any = Pokemon.getEvolutionData((await axios.get(species["evolution_chain"]["url"])).data["chain"], p.speciesName);
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
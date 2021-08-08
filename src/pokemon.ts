import Arctype  from './arctype';
import Type from './type';
import axios, { AxiosResponse } from 'axios';

class Pokemon {
    private static readonly SPRITE_URL: string = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";
    private static readonly BOX_URL: string = "https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/";

    readonly name: string;
    readonly id: number;
    readonly generation: number;

    private readonly internalPokemonName: string;
    private readonly internalSpeciesName: string;
    private readonly apiID: number;

    readonly isDefault: boolean;
    readonly isBaby: boolean;
    readonly arctype: Arctype;

    private readonly types: Type[];
    private readonly maleSprites: string[];
    private readonly femaleSprites: string[];
    private readonly boxSprites: string[];

    private readonly forms: {[key: string]: Pokemon} = {};

    private evolutions: string[] = new Array<string>(0);

    private constructor(species: any, pokemon: any) {
        let names: Array<any> = species["names"];
        let targetName: string = "";
        names.forEach((e) => {
            if (e["language"]["name"] === "en") {
                targetName = e["name"];
            }
        })

        this.name = targetName;
        this.internalPokemonName = pokemon["name"];
        this.internalSpeciesName = species["name"];

        let generationString: string = species["generation"]["url"];
        this.generation = Number.parseInt(generationString.substring(generationString.length - 2, generationString.length - 1));
        this.id = species["id"];
        this.apiID = pokemon["id"];

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

        this.maleSprites = new Array<string>(
            Pokemon.SPRITE_URL + this.apiID + ".png",
            Pokemon.SPRITE_URL + "shiny/" + this.apiID + ".png",
            Pokemon.SPRITE_URL + "back/" + this.apiID + ".png",
            Pokemon.SPRITE_URL + "back/shiny/" + this.apiID + ".png"
        )
        if (pokemon["sprites"]["front_female"] === null)
        {
            this.femaleSprites = this.maleSprites;
        } else
        {
            this.femaleSprites = new Array<string>(
                Pokemon.SPRITE_URL + "female/" + this.apiID + ".png",
                Pokemon.SPRITE_URL + "shiny/female/"  + this.apiID + ".png",
                Pokemon.SPRITE_URL + "back/female/" + this.apiID + ".png",
                Pokemon.SPRITE_URL + "back/shiny/female/" + this.apiID + ".png"
            );
        }
        this.boxSprites = new Array<string>(
            `${Pokemon.BOX_URL}regular/${this.isDefault ? this.internalSpeciesName : this.internalPokemonName}.png`,
            `${Pokemon.BOX_URL}shiny/${this.isDefault ? this.internalSpeciesName : this.internalPokemonName}.png`
        );
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

    public getForms = ():{name: string, form: Pokemon}[] => {
        let arr: {name: string, form: Pokemon}[] = new Array<{name: string, form: Pokemon}>();
        Object.keys(this.forms).map(k => {
            arr.push({name: k, form: this.forms[k]});
        })
        return arr;
    }

    public getEvolutions = ():string[] => {
        return this.evolutions;
    }

    public getTyping = ():Type[] => {
        return this.types[0] == this.types[1] ? [this.types[0]] : this.types;
    }

    public static async loadPokemon(species: any, pokemon: any):Promise<Pokemon> {
        let p: Pokemon = new Pokemon(species, pokemon);

        if (p.isDefault) {
            let varietyArray: Array<any> = species["varieties"];
            if (varietyArray.length > 1)
            {
                let tasks: Array<Promise<AxiosResponse>> = new Array<Promise<AxiosResponse>>();

                for (let i = 1; i < varietyArray.length; i++)
                {
                    let promise: Promise<AxiosResponse> = axios.get(varietyArray[i]["pokemon"]["url"]);
                    tasks.push(promise);
                }

                await Promise.all(tasks).then((responses) => {
                    responses.forEach((r) => {
                        let formData: any = r.data;
                        let formName: string = formData["name"].substring(p.internalSpeciesName.length + 1);

                        let form: Pokemon = new Pokemon(species, formData);
                        p.forms[formName] = form;
                    });
                });
            }

            let evolutionData: any = Pokemon.getEvolutionData((await axios.get(species["evolution_chain"]["url"])).data["chain"], p.internalSpeciesName);
            let evolutions = evolutionData["evolves_to"];

            if (evolutions.length > 0)
            {
                for (let i = 0; i < evolutions.length; i++)
                {
                    p.evolutions.push(evolutions[i]["species"]["name"]);
                }
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
            if (chain.length > 0)
            {
                for (let i = 0; i < chain.length; i++) {
                    let data = Pokemon.getEvolutionData(chain[i], internalName);
                    if (data != null) {
                        return data;
                    }
                }
            }
            return null;
        }
    }
}

export default Pokemon;
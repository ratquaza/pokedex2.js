import Arctype from './arctype.js';
import Type from './type.js';
import FormType from './formtype.js';
import Regional from './regional.js';

export default class Pokemon {
    private static readonly SPRITE_URL: string = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";

    /** Name of the Pokémon internally */
    public readonly name: string;
    /** Display name of the Pokémon */
    public readonly displayName: string;
    /** Name of the Pokémon species, e.g. Primal Groudon is of the Groudon species */
    public readonly species: string;

    /** Generation 1 - 9 */
    public readonly generation: number;

    /** Pokémon's index in the Pokédex */
    public readonly index: number;
    /** Pokémon's index in PokéAPI */
    public readonly apiIndex: number;

    /** Whether the Pokémon is a baby */
    public readonly baby: boolean;
    /** The Pokémon's Arctype */
    public readonly arctype: Arctype = Arctype.Normal;
    /** The type of the Pokémon's form, i.e. Mega, Gigantamax, etc. */
    public readonly formtype: FormType = FormType.Default;
    /** Origin of the Pokémon's form, i.e. Alolan, Galarian */
    public readonly regional: Regional = Regional.None;

    /** Pokémon's typing */
    public readonly types: Type[];
    /** Name of the Pokémon's different forms */
    public readonly forms: string[] = [];
    /** Name of the different species the Pokémon can evolve to */
    public readonly evolutions: string[] = [];

    constructor(species: any = null, pokemon: any = null, evolutionData: any = null) {
        this.name = pokemon["name"];
        this.displayName = species.names.find((spec: any) => spec.language.name === "en").name;
        this.species = species["name"];
        this.index = species["id"]
        this.apiIndex = pokemon["id"];

        this.baby = species["is_baby"];

        // Get the generation by reading the string containing a number
        // corresponding to the generation - futureproofing the code.
        // Unless PokeAPI changes the structure of their data
        let generationString: string = species["generation"]["url"];
        this.generation = Number.parseInt(generationString.substring(generationString.length - 2, generationString.length - 1));

        // Arctype determined by index, kind of an ugly hacky method
        if (species["is_legendary"]) {
            this.arctype = Arctype.Legendary;
        } else if (species["is_mythical"]) {
            this.arctype = Arctype.Mythical;
        } else if (
            (this.index >= 793 && this.index <= 799) || 
            (this.index >= 803 && this.index <= 806)) {
            this.arctype = Arctype.Ultrabeast;
        } else if (
            (this.index >= 984 && this.index <= 995) || 
            (this.index >= 1005 && this.index <= 1010) ||
            (this.index >= 1020 && this.index <= 1023)) {
            this.arctype = Arctype.Paradox;
        }

        // Grabs the internal name, removes the species name and leaves any
        // trailing characters from its name, often used as descriptors of
        // the Pokemon
        // e.g. groudon-primal       -> primal
        //      darmanitan-galar-zen -> galar-zen
        let additionalName = this.name.substring(this.species.length + 1);
        if (additionalName.length > 0) {
            // Avoiding Pikachu due to cosplay and caps
            if (this.species !== "pikachu") {
                for (let v of Object.values(Regional)) {
                    if (v == Regional.None) continue;
                    if (additionalName.includes(v)) {
                        this.regional = v as Regional
                        break
                    }
                }
            }

            for (let v of Object.values(FormType)) {
                if (v == FormType.Other || v == FormType.Default) continue;
                if (additionalName.includes(v)) {
                    this.formtype = v as FormType
                    break
                }
            }

            if (this.formtype == FormType.Default) {
                this.formtype = FormType.Other
            }
        }

        let typeArray: Array<any> = pokemon["types"];
        this.types = new Array<Type>(2);
        this.types[0] = typeArray[0]["type"]["name"];
        if (typeArray.length > 1) {
            this.types[1] = typeArray[1]["type"]["name"];
        } else {
            this.types[1] = this.types[0]
        }

        let varietyArray: Array<any> = species["varieties"];
        for (let i = 0; i < varietyArray.length; i++) {
            if (varietyArray[i].pokemon.name !== this.name) this.forms.push(varietyArray[i].pokemon.name)
        }

        if (evolutionData["evolves_to"] && evolutionData["evolves_to"].length > 0) {
            this.evolutions = evolutionData["evolves_to"].map((v: any) => v.species.name)
        }
    }

    public getSprite(front: boolean = true, female: boolean = false, shiny: boolean = false): string | undefined {
        return Pokemon.SPRITE_URL + (!front ? "back/" : "/") + (shiny ? "shiny/" : "/") + (female ? "female/" : "/") + this.apiIndex + ".png"
    };
}
import generation_1 from './generation_1.json'
import generation_2 from './generation_2.json'
import generation_3 from './generation_3.json'
import generation_4 from './generation_4.json'
import generation_5 from './generation_5.json'
import generation_6 from './generation_6.json'
import generation_7 from './generation_7.json'
import generation_8 from './generation_8.json'
import generation_9 from './generation_9.json'

const allPokemon = [
    ...generation_1,
    ...generation_2,
    ...generation_3,
    ...generation_4,
    ...generation_5,
    ...generation_6,
    ...generation_7,
    ...generation_8,
    ...generation_9
]

export const pokemonData = {
    summary: allPokemon.map(pokemon => ({
        id: pokemon.id,
        name: pokemon.name,
        generation: pokemon.generation,
        sprites: {
            officialArtwork: pokemon.sprites.default.front,
            gif: pokemon.sprites.showdown.front,
        },
        types: pokemon.types.types,
    })),
    details: [
        generation_1,
        generation_2,
        generation_3,
        generation_4,
        generation_5,
        generation_6,
        generation_7,
        generation_8,
        generation_9
    ]
}
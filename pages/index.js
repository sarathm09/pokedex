import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import styles from '../styles/Home.module.css'
import pokemonData from 'api-data/data/api/v2/pokemon'
import PokemonListItem from '../components/PokemonListItem'
import ListPaginationButtons from '../components/ListPaginationButtons'

const { readFile } = require('fs').promises

export default function Home({ pokemonList }) {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(200)

    return (
        <>
            <Head>
                <title>Pokedex by sarathm09</title>
                <meta name='description' content='Pokedex created using nextjs, pokeapi and a little bit of css' />
                <link rel='icon' href='/favicon.ico' />
            </Head>
            <div className='container'>
                <div className={styles.header}>
                    <div className={styles.headerImage}>
                        <Image src='/pokemon-logo.svg' height='70' width='200' alt='Pokemon Logo' />
                    </div>
                    <h2 className={styles.headerText}>Pokedex created using the PokeAPI</h2>
                </div>
                <div className={styles.pokemonList}>
                    {pokemonList?.slice((page - 1) * pageSize, page * pageSize).map(pokemon => (
                        <PokemonListItem id={pokemon.id} key={pokemon.name} pokemon={pokemon} />
                    ))}
                </div>
                <div className={styles.pages}>
                    <ListPaginationButtons numberOfPages={Math.ceil(pokemonList?.length / pageSize)} page={page} setPage={setPage} />
                </div>
            </div>
        </>
    )
}

/**
 * Load the pokemon data from the poke-api api-data module.
 * @returns pokemon list with id, name, image url and types
 */
export async function getStaticProps() {
    let pokemonList = pokemonData.results.map(pokemon => ({
        id: '' + pokemon.url.replace('/api/v2/pokemon/', '').replace('/', ''),
        ...pokemon
    }))

    pokemonList = await Promise.all(
        pokemonList.map(async pokemon => {
            const fileData = await readFile(`${process.cwd()}/node_modules/api-data/data/api/v2/pokemon/${pokemon.id}/index.json`, 'utf-8')
            const details = JSON.parse(fileData)

            return {
                ...pokemon,
                defaultImage:
                    details.sprites?.other?.dream_world?.front_default ||
                    details.sprites?.other?.['official-artwork']?.front_default ||
                    details.sprites?.front_default,
                types: details.types.map(type => type?.type?.name)
            }
        })
    )

    return {
        props: {
            pokemonList
        },
        revalidate: 60 * 60 * 24 * 15
    }
}

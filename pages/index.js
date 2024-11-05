'use client'

import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import styles from '../styles/Home.module.css'
import { pokemonData } from '../data'

import PokemonListItem from '../components/PokemonListItem'
import ListPaginationButtons from '../components/ListPaginationButtons'
import { PokemonProvider } from '../context/PokemonContext'


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
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.headerImage}>
                        <Image src='/pokemon-logo.svg' height='70' width='200' alt='Pokemon Logo' />
                    </div>
                    <h2 className={styles.headerText}>Pokedex created using the PokeAPI</h2>
                </div>
                <div className={styles.pokemonList}>
                    {pokemonData.summary?.slice((page - 1) * pageSize, page * pageSize).map(pokemon => (
                        <PokemonListItem id={pokemon.id} key={pokemon.name} generation={pokemon.generation} pokemon={pokemonData.details[+pokemon.generation - 1].find(p => p.id === pokemon.id)} />
                    ))}
                </div>
                <div className={styles.pages}>
                    <ListPaginationButtons numberOfPages={Math.ceil(pokemonData.summary?.length / pageSize)} page={page} setPage={setPage} />
                </div>
            </div>
        </>
    )
}

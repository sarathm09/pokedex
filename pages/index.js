'use client'

import Head from 'next/head'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import styles from '../styles/Home.module.css'
import { pokemonData } from '../data'

import PokemonListItem from '../components/PokemonListItem'
import ListPaginationButtons from '../components/ListPaginationButtons'
import { PokemonProvider, usePokemon } from '../context/PokemonContext'


export default function Home() {
    const { pokemons } = usePokemon()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedTypes, setSelectedTypes] = useState([])
    const [visiblePokemons, setVisiblePokemons] = useState([])
    const [page, setPage] = useState(1)
    const loaderRef = useRef(null)
    const ITEMS_PER_PAGE = 20

    const types = [
        'normal', 'fire', 'water', 'electric', 'grass', 'ice',
        'fighting', 'poison', 'ground', 'flying', 'psychic',
        'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
    ]

    const filteredPokemons = pokemons?.filter(pokemon => {
        const matchesSearch = searchTerm ? pokemon.name?.toLowerCase().includes(searchTerm?.toLowerCase()) : true
        const matchesType = selectedTypes.length === 0 || 
            pokemon.types.types.some(type => selectedTypes.includes(type))
        return matchesSearch && matchesType
    }) || []

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    setPage(prev => prev + 1)
                }
            },
            { threshold: 0.1 }
        )

        if (loaderRef.current) {
            observer.observe(loaderRef.current)
        }

        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        setVisiblePokemons(filteredPokemons.slice(0, page * ITEMS_PER_PAGE))
    }, [page, filteredPokemons])

    const handleTypeToggle = (type) => {
        setSelectedTypes(prev => 
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        )
        setPage(1)
    }

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
                <div className={styles.filters}>
                    <input
                        type="text"
                        placeholder="Search Pokémon..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value)
                            setPage(1)
                        }}
                        className={styles.searchInput}
                    />
                    
                    <div className={styles.typeFilters}>
                        {types.map(type => (
                            <button
                                key={type}
                                onClick={() => handleTypeToggle(type)}
                                className={`${styles.typeButton} ${
                                    selectedTypes.includes(type) ? styles.selected : ''
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.grid}>
                    {visiblePokemons.map(pokemon => (
                        <PokemonListItem key={pokemon.id} pokemon={pokemon} />
                    ))}
                </div>
                
                {visiblePokemons.length < filteredPokemons.length && (
                    <div ref={loaderRef} className={styles.loader}>
                        Loading more Pokémon...
                    </div>
                )}
            </div>
        </>
    )
}

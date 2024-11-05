import { createContext, useContext, useState } from 'react'

const PokemonContext = createContext()

export function PokemonProvider({ children, pokemonList }) {
    const [selectedPokemon, setSelectedPokemon] = useState(null)

    // Ensure pokemonList has the expected structure
    const initialPokemonList = {
        summary: pokemonList?.summary || [],
        details: pokemonList?.details || []
    }

    const value = {
        pokemonList: initialPokemonList,
        selectedPokemon,
        setSelectedPokemon
    }

    return (
        <PokemonContext.Provider value={value}>
            {children}
        </PokemonContext.Provider>
    )
}

export function usePokemon() {
    const context = useContext(PokemonContext)
    if (context === undefined) {
        throw new Error('usePokemon must be used within a PokemonProvider')
    }
    return context
} 
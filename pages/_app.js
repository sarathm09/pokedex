import '../styles/globals.css'
import { PokemonProvider } from '../context/PokemonContext'
import { pokemonData } from '../data'
function MyApp({ Component, pageProps }) {
    return (
        <PokemonProvider pokemonList={pokemonData}>
            <Component {...pageProps} />
        </PokemonProvider>
    )
}

export default MyApp

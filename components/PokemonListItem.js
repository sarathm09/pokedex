import Image from 'next/image'
import styles from '../styles/PokemonListItem.module.css'
import { getColorWithAlpha } from '../constants/pokemon-type-colors'

const PokemonListItem = ({ id, pokemon }) => {
    // Fallback image incase API didn't return any image
    const FALLBACK_IMAGE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'

    /**
     * The API returns the name in small case (sometimes with hyphen).
     * Change that to proper case.
     */
    const getPokemonName = name => {
        if (name.includes('-')) {
            return name
                .split('-')
                .map(n => n[0].toUpperCase() + n.slice(1))
                .join(' ')
        }
        return name[0].toUpperCase() + name.slice(1)
    }

    return (
        <div className={styles.card} style={{ backgroundColor: getColorWithAlpha(pokemon.types?.[0], '35') }}>
            <div className={styles.cardInner}>
                <div className={styles.pokemonImageContainer}>
                    <div className={styles.pokemonImageBackground} style={{ backgroundColor: getColorWithAlpha(pokemon.types?.[0], '50') }}></div>
                    <Image
                        src={pokemon.defaultImage || FALLBACK_IMAGE}
                        height='300'
                        width='300'
                        alt={`Image for ${getPokemonName(pokemon.name)}`}
                        layout='responsive'
                        className={styles.pokemonImage}
                    />
                </div>
                <div className={styles.pokemonDetails}>
                    <span className={styles.pokemonNumber}>#{new String(id).padStart(3, 0)}</span>
                    <h3>{getPokemonName(pokemon.name)}</h3>
                    <div className={styles.pokemonTypes}>
                        {pokemon.types?.map(type => (
                            <span className={styles.pokemonType} key={type} style={{ backgroundColor: getColorWithAlpha(type, '90') }}>
                                {type}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PokemonListItem

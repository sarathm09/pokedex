'use client'

import Image from 'next/image'
import styles from '../../styles/PokemonDetails.module.css'
import { getColorWithAlpha } from '../../constants/pokemon-type-colors'
import { useState } from 'react'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Radar } from 'react-chartjs-2'
import { usePokemon } from '../../context/PokemonContext'
import { useRouter } from 'next/router'
import tinycolor from 'tinycolor2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

const StatIcon = ({ stat }) => {
    const icons = {
        hp: (
            <svg className={styles.statIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
        ),
        attack: (
            <svg className={styles.statIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
        ),
        defense: (
            <svg className={styles.statIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
        ),
        // Add icons for other stats...
    };

    return icons[stat] || null;
};

const StatBar = ({ statName, value, maxValue, color }) => {
    const percentage = (value / maxValue) * 100;
    
    return (
        <div className={styles.statBar}>
            <div className={styles.statInfo}>
                <span className={styles.statName}>{statName}</span>
                <span className={styles.statValue}>{value}</span>
            </div>
            <div className={styles.progressRing}>
                <svg viewBox="0 0 36 36">
                    <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.2)"
                        strokeWidth="3"
                    />
                    <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                        strokeDasharray={`${percentage}, 100`}
                    />
                </svg>
            </div>
        </div>
    );
};

const StatsDisplay = ({ stats, type }) => {
    const mainColor = getColorWithAlpha(type, '90');
    const lightColor = getColorWithAlpha(type, '20');

    const statsData = {
        labels: ['HP', 'Attack', 'Defense', 'Sp. Attack', 'Sp. Defense', 'Speed'],
        datasets: [
            {
                label: 'Base Stats',
                data: [
                    stats.hp.base,
                    stats.attack.base,
                    stats.defense.base,
                    stats['special-attack'].base,
                    stats['special-defense'].base,
                    stats.speed.base
                ],
                backgroundColor: lightColor,
                borderColor: mainColor,
                borderWidth: 2.5,
                pointBackgroundColor: mainColor,
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: mainColor,
                pointRadius: 5,
                pointHoverRadius: 7,
            }
        ]
    };

    const chartOptions = {
        scales: {
            r: {
                min: 0,
                max: 180,
                beginAtZero: true,
                angleLines: {
                    color: 'rgba(0, 0, 0, 0.1)',
                    lineWidth: 1.5
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    circular: true
                },
                pointLabels: {
                    color: 'rgba(0, 0, 0, 0.7)',
                    font: {
                        size: 16,
                        family: "'Inter', sans-serif",
                        weight: '600'
                    },
                    padding: 25
                },
                ticks: {
                    stepSize: 30,
                    backdropColor: 'transparent',
                    color: 'rgba(0, 0, 0, 0.5)',
                    font: {
                        size: 12
                    },
                    z: 100
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#000',
                bodyColor: '#000',
                bodyFont: {
                    size: 16,
                    weight: '600'
                },
                padding: 12,
                boxPadding: 6,
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    title: () => '',
                    label: (context) => {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        return `${label}: ${value}`;
                    }
                }
            }
        },
        elements: {
            line: {
                tension: 0.1
            }
        },
        animation: {
            duration: 1500,
            easing: 'easeOutQuart'
        },
        responsive: true,
        maintainAspectRatio: false
    };

    return (
        <div className={styles.statsChart}>
            <Radar data={statsData} options={chartOptions} />
        </div>
    );
};

const HexStats = ({ stats, type }) => {
    const maxStat = 255;
    
    return (
        <div className={styles.hexContainer}>
            {Object.entries(stats).map(([statName, stat]) => (
                <div key={statName} className={styles.hexStat}>
                    <div 
                        className={styles.hexValue}
                        style={{
                            '--percent': (stat.base / maxStat) * 100,
                            '--color': getColorWithAlpha(type, '90')
                        }}
                    />
                    <span className={styles.hexLabel}>{statName.replace(/-/g, ' ')}</span>
                    <span className={styles.hexNumber}>{stat.base}</span>
                </div>
            ))}
        </div>
    );
};

export default function PokemonDetails() {
    const router = useRouter()
    const { id } = router.query
    const { pokemonList, selectedPokemon } = usePokemon()

    if (!id || !pokemonList?.summary) return <div>Loading...</div>

    const pokemonSummary = pokemonList.summary.find(p => p.id === +id)

    if (!pokemonSummary) return <div>Pokemon not found</div>

    const generation = pokemonSummary.generation
    const pokemon = selectedPokemon || 
                   (pokemonList.details?.[generation - 1]?.find(p => p.id === +id))

    if (!pokemon) return <div>Loading pokemon details...</div>

    const [selectedVariant, setSelectedVariant] = useState('default')
    const [showingBack, setShowingBack] = useState(false)

    const getCurrentImage = () => {
        return showingBack ? pokemon.sprites[selectedVariant].back : pokemon.sprites[selectedVariant].front
    }

    const statsData = {
        labels: ['HP', 'Attack', 'Defense', 'Sp. Attack', 'Sp. Defense', 'Speed'],
        datasets: [
            {
                label: 'Base Stats',
                data: [
                    pokemon.stats.hp.base,
                    pokemon.stats.attack.base,
                    pokemon.stats.defense.base,
                    pokemon.stats['special-attack'].base,
                    pokemon.stats['special-defense'].base,
                    pokemon.stats.speed.base
                ],
                backgroundColor: getColorWithAlpha(pokemon.types.types[0], '20'),
                borderColor: getColorWithAlpha(pokemon.types.types[0], '90'),
                borderWidth: 2,
                pointBackgroundColor: getColorWithAlpha(pokemon.types.types[0], '90'),
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: getColorWithAlpha(pokemon.types.types[0], '90'),
            },
        ],
    }

    const chartOptions = {
        scales: {
            r: {
                min: 0,
                max: 150,
                beginAtZero: true,
                ticks: {
                    stepSize: 30,
                    color: 'rgba(0, 0, 0, 0.6)',
                    backdropColor: 'transparent'
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                angleLines: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                pointLabels: {
                    color: 'rgba(0, 0, 0, 0.8)',
                    font: {
                        size: 12,
                        weight: '600'
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#000',
                bodyColor: '#000',
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 1,
                padding: 10,
                boxPadding: 5,
                usePointStyle: true,
                callbacks: {
                    label: function(context) {
                        return `${context.label}: ${context.raw}`;
                    }
                }
            }
        },
        elements: {
            line: {
                borderWidth: 2
            },
            point: {
                radius: 4,
                hoverRadius: 6,
                borderWidth: 2,
                hoverBorderWidth: 2
            }
        }
    }

    const getLightColor = (type) => {
        const baseColor = getColorWithAlpha(type, '50');
        return tinycolor(baseColor)
            .lighten(20)
            .setAlpha(0.2)
            .toRgbString();
    };

    // Get the type(s) from pokemon data
    const types = pokemon.types?.types || []
    const containerClass = `${styles.container} ${
        types.length === 1 ? styles.containerSingleType : styles.containerDualType
    }`

    // Set CSS variables for the container
    const containerStyle = types.length === 1 
        ? {
            '--type-color': getColorWithAlpha(types[0], '90'),
            '--type-color-light': getLightColor(types[0])
        }
        : {
            '--type-color-1': getColorWithAlpha(types[0], '90'),
            '--type-color-1-light': getLightColor(types[0]),
            '--type-color-2': getColorWithAlpha(types[1], '90'),
            '--type-color-2-light': getLightColor(types[1])
        }

    return (
        <div className={containerClass} style={containerStyle}>
            <div className={styles.row}>
                {/* Image Card */}
                <div className={`${styles.card} ${styles.imageCard}`}>
                    <div className={styles.imageContainer}>
                        <div className={styles.imageWrapper}>
                            <Image
                                src={getCurrentImage()}
                                height={400}
                                width={400}
                                alt={`${pokemon.name} ${selectedVariant} ${showingBack ? 'back' : 'front'}`}
                                priority
                            />
                        </div>
                    </div>
                    <div className={styles.imageControls}>
                        <div className={styles.variantButtons}>
                            <button 
                                className={selectedVariant === 'default' ? styles.active : ''}
                                onClick={() => setSelectedVariant('default')}
                            >
                                Default
                            </button>
                            <button 
                                className={selectedVariant === 'shiny' ? styles.active : ''}
                                onClick={() => setSelectedVariant('shiny')}
                            >
                                Shiny
                            </button>
                            <button 
                                className={selectedVariant === 'showdown' ? styles.active : ''}
                                onClick={() => setSelectedVariant('showdown')}
                            >
                                Showdown
                            </button>
                        </div>
                        <div className={styles.imageToggle}>
                            <button onClick={() => setShowingBack(!showingBack)}>
                                {showingBack ? 'Show Front' : 'Show Back'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Basic Details Card */}
                <div className={styles.card}>
                    <h2>Basic Details</h2>
                    <div className={styles.basicInfo}>
                        <h1>{pokemon.name}</h1>
                        <p className={styles.id}>#{String(pokemon.id).padStart(3, '0')}</p>
                        <div className={styles.types}>
                            {pokemon.types.types.map(type => (
                                <span 
                                    key={type} 
                                    className={styles.type}
                                    style={{ backgroundColor: getColorWithAlpha(type, '90') }}
                                >
                                    {type}
                                </span>
                            ))}
                        </div>
                        <div className={styles.dimensions}>
                            <p>Height: {pokemon.dimensions.height / 10}m</p>
                            <p>Weight: {pokemon.dimensions.weight / 10}kg</p>
                        </div>
                        <p>Color: {pokemon.color}</p>
                        <p>Habitat: {pokemon.habitat}</p>
                        <p>Generation: {pokemon.generation}</p>
                        <p>Region: {pokemon.region}</p>
                    </div>
                </div>

                {/* Stats Card */}
                <div className={styles.card}>
                    <h2>Base Stats</h2>
                    <StatsDisplay 
                        stats={pokemon.stats} 
                        type={pokemon.types.types[0]}
                    />
                </div>
            </div>

            {/* Moves Row */}
            <div className={styles.row}>
                <div className={styles.card}>
                    <h2>Moves</h2>
                    <div className={styles.moves}>
                        {pokemon.moves.map(move => (
                            <div 
                                key={move.name} 
                                className={styles.move}
                                style={{ backgroundColor: getColorWithAlpha(move.type, '10') }}
                            >
                                <div className={styles.moveHeader}>
                                    <h3>{move.name}</h3>
                                    <span 
                                        className={styles.moveType}
                                        style={{ backgroundColor: getColorWithAlpha(move.type, '90') }}
                                    >
                                        {move.type}
                                    </span>
                                </div>
                                <div className={styles.moveStats}>
                                    {move.power && (
                                        <span className={styles.moveStat}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-2.77 10.02V15a1 1 0 0 0-2 0v2.73a6 6 0 0 1-2.77-10.02l1.77 1.77a1 1 0 0 0 1.4 0l1.6-1.6a1 1 0 0 0 0-1.4L15.7 5.3a1 1 0 0 0-1.4 0l-1.6 1.6a1 1 0 0 0 0 1.4z"/>
                                            </svg>
                                            {move.power}
                                        </span>
                                    )}
                                    {move.accuracy && (
                                        <span className={styles.moveStat}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.59-13L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z"/>
                                            </svg>
                                            {move.accuracy}%
                                        </span>
                                    )}
                                </div>
                                <p className={styles.moveEffect}>{move.shortEffect}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Abilities Row */}
            <div className={styles.row}>
                <div className={styles.card}>
                    <h2>Abilities</h2>
                    <div className={styles.abilities}>
                        {pokemon.abilities.map(ability => (
                            <div 
                                key={ability.name} 
                                className={styles.ability}
                                style={{ backgroundColor: getColorWithAlpha(pokemon.types.types[0], '20') }}
                            >
                                <h3>{ability.name}</h3>
                                <p>{ability.effect}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
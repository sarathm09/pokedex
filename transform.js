const fs = require('fs');
const path = require('path');

// Base directory for all data
const BASE_DIR = './data/pokemon-data/';

// Derived directories
const POKEMON_DIR = path.join(BASE_DIR, 'pokemon');
const ABILITY_DIR = path.join(BASE_DIR, 'ability');
const FORM_DIR = path.join(BASE_DIR, 'pokemon-form');
const MOVE_DIR = path.join(BASE_DIR, 'move');
const SPECIES_DIR = path.join(BASE_DIR, 'pokemon-species');
const TYPE_DIR = path.join(BASE_DIR, 'type');
const EVOLUTION_DIR = path.join(BASE_DIR, 'evolution-chain');
const GENERATION_DIR = path.join(BASE_DIR, 'generation');

// Cache for loaded JSON files
const cache = {};

// Helper to read and cache JSON files
const readJSON = (filePath) => {
    if (cache[filePath]) return cache[filePath];
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    cache[filePath] = data;
    return data;
};

// Extract ID from URL
const extractIdFromUrl = (url) => parseInt(url.split('/').filter(Boolean).pop(), 10);

// Sentence case conversion
const toSentenceCase = (text) =>
    text.split(". ").map(line => line.charAt(0).toUpperCase() + line.slice(1).toLowerCase()).join(". ");

// Convert names to normal case (snake/hyphenated -> regular)
const formatName = (name) =>
    name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// Clean abilities by removing special characters
const cleanAbilityText = (text) => text.replace(/[\n\f]/g, ' ');

// Remove null keys from objects
const cleanNullKeys = (obj) => !!obj ?
    Object.fromEntries(Object.entries(obj).filter(([_, value]) => value != null)) : {};

// Clean and restructure sprites, with fallback logic
const cleanSprites = (sprites) => {
    const officialArtwork = sprites.other?.['official-artwork'] || {};

    return cleanNullKeys({
        default: cleanNullKeys({
            front: (officialArtwork.front_default || sprites.front_default),
            back: (officialArtwork.back_default || sprites.back_default)
        }),
        shiny: cleanNullKeys({
            front: (officialArtwork.front_shiny || sprites.front_shiny),
            back: (officialArtwork.back_shiny || sprites.back_shiny)
        }),
        showdown: cleanNullKeys({
            front: (sprites.other?.showdown?.front_default),
            back: (sprites.other?.showdown?.back_default),
        })
    });
};

// Deduplicate and sentence-case flavor text entries
const cleanFlavorText = (entries) => {
    const uniqueEntries = new Set(
        entries
            .filter((e) => e.language.name === 'en')
            .map((e) => e.flavor_text.replace(/\n|\f/g, ' ').toLowerCase())
    );
    return Array.from(uniqueEntries).map(toSentenceCase);
};

// Flatten ability details, extracting effect changes as an array of effects
const getAbilityDetails = (ability) => {
    const abilityId = extractIdFromUrl(ability.ability.url);
    const abilityData = readJSON(path.join(ABILITY_DIR, `${abilityId}/index.json`));

    const effectEntries = abilityData.effect_entries.filter((e) => e.language.name === 'en');
    const effectChanges = abilityData.effect_changes.map((change) =>
        change.effect_entries.filter((e) => e.language.name === 'en').map((e) => e.effect)
    ).flat();

    return {
        // isHidden: ability.is_hidden,
        name: formatName(abilityData.name),
        effect: cleanAbilityText(effectEntries[0]?.effect || ''),
        shortEffect: cleanAbilityText(effectEntries[0]?.short_effect || ''),
        effectChanges,
    };
};

// Handle form details and rename formName to name
const getFormDetails = (forms) => forms.map((form) => {
    const formId = extractIdFromUrl(form.url);
    const formData = readJSON(path.join(FORM_DIR, `${formId}/index.json`));

    return {
        name: formatName(formData.form_name || formData.name || 'default'),
        isDefault: formData.is_default,
        isMega: formData.is_mega,
        order: formData.order,
    };
});

// Flatten move details and remove unnecessary fields
const getMoveDetails = (moves) => {
    const moveMap = new Map();

    moves.forEach((move) => {
        const moveId = extractIdFromUrl(move.move.url);
        const moveData = readJSON(path.join(MOVE_DIR, `${moveId}/index.json`));

        const existingMove = moveMap.get(moveData.name) || {};
        const mergedMove = {
            name: formatName(moveData.name),
            accuracy: existingMove.accuracy || moveData.accuracy,
            power: existingMove.power || moveData.power,
            type: moveData.type.name,
            effect: cleanAbilityText(
                moveData.effect_entries.filter((e) => e.language.name === 'en')[0]?.effect || ''
            ),
            shortEffect: cleanAbilityText(
                moveData.effect_entries.filter((e) => e.language.name === 'en')[0]?.short_effect || ''
            ),
            fromLevel: move.version_group_details[0]?.level_learned_at || 0,
        };

        moveMap.set(moveData.name, mergedMove);
    });

    return Array.from(moveMap.values());
};

// Format stats as key-value pairs
const getStatsDetails = (stats) =>
    stats.reduce((acc, stat) => {
        acc[stat.stat.name] = { base: stat.base_stat, effort: stat.effort };
        return acc;
    }, {});

// Get evolution data
const getEvolutionData = (evolutionUrl) => {
    const evolutionId = extractIdFromUrl(evolutionUrl);
    const evolutionData = readJSON(path.join(EVOLUTION_DIR, `${evolutionId}/index.json`));

    const formatEvolution = (evolution) => ({
        species: {
            name: formatName(evolution.species.name),
            id: extractIdFromUrl(evolution.species.url),
        },
        trigger: formatName(evolution.evolution_details[0]?.trigger.name || 'unknown'),
        minLevel: evolution.evolution_details[0]?.min_level || null,
        evolvesTo: evolution.evolves_to.map(formatEvolution),
    });

    return formatEvolution(evolutionData.chain);
};

// Get species details and map to generation
const getSpeciesDetails = (speciesUrl) => {
    const speciesId = extractIdFromUrl(speciesUrl);
    const speciesData = readJSON(path.join(SPECIES_DIR, `${speciesId}/index.json`));

    const generationId = extractIdFromUrl(speciesData.generation.url);
    const generationData = readJSON(path.join(GENERATION_DIR, `${generationId}/index.json`));

    return {
        color: formatName(speciesData.color.name),
        baseHappiness: speciesData.base_happiness,
        captureRate: speciesData.capture_rate,
        eggGroups: speciesData.egg_groups.map((group) => formatName(group.name)),
        habitat: formatName(speciesData.habitat?.name || 'unknown'),
        flavorTextEntries: cleanFlavorText(speciesData.flavor_text_entries),
        generation: getGenerationNumber(speciesData.generation.name),
        region: formatName(generationData.main_region.name),
        evolutionChain: getEvolutionData(speciesData.evolution_chain.url),
    };
};

// Map generation names to numbers, including Generation IX
const getGenerationNumber = (generation) => ({
    'generation-i': 1,
    'generation-ii': 2,
    'generation-iii': 3,
    'generation-iv': 4,
    'generation-v': 5,
    'generation-vi': 6,
    'generation-vii': 7,
    'generation-viii': 8,
    'generation-ix': 9,
}[generation] || null);

const getTypeDetails = (typesInput) => {
    const damageRelations = {
        doubleDamageFrom: new Set(),
        doubleDamageTo: new Set(),
        halfDamageFrom: new Set(),
        halfDamageTo: new Set(),
        noDamageFrom: new Set(),
        noDamageTo: new Set()
    }

    const typeNames = new Set(typesInput.map((type) => {
        const typeId = extractIdFromUrl(type.type.url);
        const typeData = readJSON(path.join(TYPE_DIR, `${typeId}/index.json`));

        typeData.damage_relations?.no_damage_from
            .forEach(({ name }) => damageRelations.noDamageFrom.add(formatName(name)));
        typeData.damage_relations?.no_damage_to
            .forEach(({ name }) => damageRelations.noDamageTo.add(formatName(name)));

        typeData.damage_relations?.half_damage_to
            .forEach(({ name }) => damageRelations.halfDamageTo.add(formatName(name)));
        typeData.damage_relations?.half_damage_from
            .forEach(({ name }) => damageRelations.halfDamageFrom.add(formatName(name)));

        typeData.damage_relations?.double_damage_from
            .forEach(({ name }) => damageRelations.doubleDamageFrom.add(formatName(name)));
        typeData.damage_relations?.double_damage_to
            .forEach(({ name }) => damageRelations.doubleDamageTo.add(formatName(name)));

        return formatName(typeData.name);
    }));

    damageRelations.doubleDamageFrom.forEach((type) => {
        if (damageRelations.noDamageFrom.has(type)) damageRelations.doubleDamageFrom.delete(type);
        if (damageRelations.halfDamageFrom.has(type)) damageRelations.doubleDamageFrom.delete(type);
        if (typeNames.has(type)) damageRelations.doubleDamageFrom.delete(type);
    });

    damageRelations.halfDamageFrom.forEach((type) => {
        if (damageRelations.noDamageFrom.has(type)) damageRelations.halfDamageFrom.delete(type);
        if (typeNames.has(type)) damageRelations.halfDamageFrom.delete(type);
    });

    return {
        types: [...typeNames],
        damageRelations: Object.fromEntries(
            Object.entries(damageRelations)
                .map(([k, v]) => [k, [...v]]))
    }
}

const parseEvolutionChain = (evolutionChain, prevList = []) => {
    prevList.push({
        name: evolutionChain.species.name,
        id: evolutionChain.species.id,
        trigger: evolutionChain.trigger !== 'Unknown' ? evolutionChain.trigger : '',
        minLevel: evolutionChain.minLevel || 0,
    })
    evolutionChain.evolvesTo.forEach((species) => {
        parseEvolutionChain(species, prevList)
    })
    return prevList;
};


const collatePokemonDataByGeneration = () => {
    const generations = new Map();

    // Iterate over all generation folders
    fs.readdirSync(GENERATION_DIR).forEach((genFolder) => {
        const genFilePath = path.join(GENERATION_DIR, genFolder, 'index.json');
        if (fs.existsSync(genFilePath)) {
            const genData = readJSON(genFilePath);
            const generationId = getGenerationNumber(genData.name);

            // Loop through pokemon_species from the generation file
            genData.pokemon_species.forEach((species) => {
                const speciesId = extractIdFromUrl(species.url);
                const pokemonPath = path.join(POKEMON_DIR, `${speciesId}`, 'index.json');

                if (fs.existsSync(pokemonPath)) {
                    const pokemonData = readJSON(pokemonPath);
                    const speciesDetails = getSpeciesDetails(pokemonData.species.url);
                    const { baseHappiness, captureRate, ...extraDetails } = speciesDetails;

                    const pokemonEntry = {
                        id: pokemonData.id,
                        name: formatName(pokemonData.name),
                        dimensions: {
                            height: pokemonData.height,
                            weight: pokemonData.weight,
                        },
                        abilities: pokemonData.abilities.map(getAbilityDetails),
                        forms: getFormDetails(pokemonData.forms),
                        stats: {
                            ...getStatsDetails(pokemonData.stats),
                            experience: { base: pokemonData.base_experience },
                            happiness: { base: baseHappiness },
                            captureRate: { base: captureRate },
                        },
                        moves: getMoveDetails(pokemonData.moves),
                        sprites: cleanSprites(pokemonData.sprites),
                        types: getTypeDetails(pokemonData.types),
                        cry: pokemonData.cries.latest || pokemonData.cries.legacy,
                        ...extraDetails,
                        evolutionChain: parseEvolutionChain(extraDetails.evolutionChain)
                    };

                    // Add the Pokémon entry to the correct generation
                    if (!generations.has(generationId)) generations.set(generationId, []);
                    generations.get(generationId).push(pokemonEntry);
                }
            });
        }
    });

    // Sort each generation's data by ID and save to JSON files
    generations.forEach((data, gen) => {
        data.sort((a, b) => a.id - b.id);
        fs.writeFileSync(`generation_${gen}.json`, JSON.stringify(data, null, 2));
        console.log(`Saved data for Generation ${gen}`);
    });
};


collatePokemonDataByGeneration();
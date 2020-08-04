import { Anime, AnimeType } from './anime';

/**
 * Matches anime by their name and other possible information
 */
export class AnimeMatcher {
    private static characterMaps = {
        Ⅲ: 'III',
    };

    static findBestMatch(animes: Anime[], anime: Anime): AnimeMatch {
        const filtered = this.possibleAnimes(animes, anime);
        if (filtered.length == 0) return {};

        return new AnimeMatcher(filtered).findMatch(this.mapSpecialCharacters(anime));
    }

    // These conditions has to be true to even consider further processing
    private static possibleAnimes(animes: Anime[], anime: Anime): Anime[] {
        return animes.filter(
            (a) =>
                (Math.abs(a.episodes - anime.episodes) <= 1 || a.episodes === 0) &&
                a.type === anime.type
        );
    }

    private static mapSpecialCharacters(anime: Anime): Anime {
        const charKeys = Object.keys(this.characterMaps);
        if (charKeys.some((c) => anime.name.indexOf(c) !== -1)) {
            charKeys.forEach((c) => {
                anime.name = anime.name.replace(new RegExp(c, 'g'), this.characterMaps[c]);
            });
        }
        return anime;
    }

    private defaultMatchers: AnimeMatcherType[];
    private extraMatchers: AnimeMatcherType[];
    private allMatchers: AnimeMatcherType[];

    private strangeCharacters = ['†', '†'];

    private constructor(private animes: Anime[]) {
        this.defaultMatchers = [this.exactMatch, this.startsWith];
        this.extraMatchers = [
            ...this.defaultMatchers,
            this.matchIgnoreSpecialCharacters.bind(this),
            this.matchSpaceBetweenCapitalized.bind(this),
            this.matchCombinedSpecialCharacters.bind(this),
            this.matchAllCombinedName.bind(this),
            this.matchWithoutStrangeCharacters.bind(this),
            this.matchExclamationAsSeasons.bind(this),
            this.matchSeasonAliases.bind(this),
            this.matchIgnoreBracketValues.bind(this),
        ];
        this.allMatchers = [
            ...this.extraMatchers,
            // this.matchColonSections.bind(this),
            this.matchNameParts.bind(this),
        ];
    }

    private findMatch(anime: Anime): AnimeMatch {
        return this.applyMatchers(this.animes, anime);
    }

    private applyMatchers(
        animes: Anime[],
        anime: Anime,
        matchers: AnimeMatcherType[] = this.allMatchers
    ): AnimeMatch {
        let found: AnimeMatch = {};

        for (let i = 0; i < matchers.length; i++) {
            const matcher = matchers[i];
            found = matcher(animes, anime);

            if (found.anime) {
                break;
            }
        }

        return found;
    }

    private exactMatch(animes: Anime[], { name }: Anime): AnimeMatch {
        return {
            anime: animes.find((a) => a.name.toLowerCase() === name.toLowerCase()),
            guessed: false,
        };
    }

    private startsWith(animes: Anime[], { name }: Anime): AnimeMatch {
        return {
            anime: animes.find((a) => a.name.toLowerCase().startsWith(name.toLowerCase())),
            guessed: true,
        };
    }

    private matchIgnoreSpecialCharacters(animes: Anime[], anime: Anime): AnimeMatch {
        const animeWithoutSpecial = this.normalizeAnime(anime);
        const animesWithoutSpecial = animes.map((a) => this.normalizeAnime(a));
        let found = this.applyMatchers(
            animesWithoutSpecial,
            animeWithoutSpecial,
            this.defaultMatchers
        );

        if (found.anime) {
            found.anime = animes.find((a) => this.normalizeAnimeName(a.name) === found.anime.name);
        }

        return found;
    }

    private normalizeAnime(anime: Anime): Anime {
        return {
            ...anime,
            name: this.normalizeAnimeName(anime.name),
        };
    }

    private normalizeAnimeName(name: string): string {
        return name
            .split(/-|:|\s+|\./g)
            .map((x) => x.trim())
            .filter((x) => !!x)
            .join(' ');
    }

    private matchSpaceBetweenCapitalized(animes: Anime[], anime: Anime): AnimeMatch {
        const spaced = anime.name.replace(/([a-z])([A-Z])/g, '$1 $2');
        return this.applyMatchers(animes, { ...anime, name: spaced }, this.defaultMatchers);
    }

    private matchCombinedSpecialCharacters(animes: Anime[], anime: Anime): AnimeMatch {
        const combinedSpecial = anime.name.replace(/-/g, '');
        return this.applyMatchers(
            animes,
            { ...anime, name: combinedSpecial },
            this.defaultMatchers
        );
    }

    private matchAllCombinedName(animes: Anime[], anime: Anime): AnimeMatch {
        const joined = this.normalizeAnimeName(anime.name).split(' ').join('');
        const animesJoined = animes.map((a) => ({
            ...a,
            name: this.normalizeAnimeName(a.name).split(' ').join(''),
        }));
        let match = this.applyMatchers(
            animesJoined,
            { ...anime, name: joined },
            this.defaultMatchers
        );

        if (match.anime) {
            match.anime = animes.find(
                (a) => this.normalizeAnimeName(a.name).split(' ').join('') === match.anime.name
            );
        }

        return match;
    }

    private matchWithoutStrangeCharacters(animes: Anime[], anime: Anime): AnimeMatch {
        const withoutStrange = animes.map((a) => this.removeStrangeCharacters(a));
        let match = this.applyMatchers(withoutStrange, this.removeStrangeCharacters(anime), [
            ...this.defaultMatchers,
            this.matchAllCombinedName.bind(this),
        ]);

        if (match.anime) {
            match.anime = animes.find(
                (a) => this.removeStrangeCharacters(a).name === match.anime.name
            );
        }

        return match;
    }

    private removeStrangeCharacters(anime: Anime): Anime {
        let result = anime.name;
        this.strangeCharacters.forEach((c) => (result = result.replace(c, '')));
        return { ...anime, name: result };
    }

    private matchSeasonAliases(animes: Anime[], anime: Anime): AnimeMatch {
        const aliases = ['2nd Season', 'II', '2'];

        const found = aliases
            .map((a) => {
                if (anime.name.endsWith(a)) {
                    return aliases
                        .filter((x) => x !== a)
                        .map((alias) => {
                            const nameAlias = anime.name.replace(a, alias);
                            return this.applyMatchers(
                                animes,
                                { ...anime, name: nameAlias },
                                this.defaultMatchers
                            ).anime;
                        });
                }
                return [];
            })
            .reduce((x, y) => x.concat(y), [])
            .find((x) => !!x);

        return { anime: found, guessed: true };
    }

    private matchExclamationAsSeasons(animes: Anime[], anime: Anime): AnimeMatch {
        const parts = anime.name.split(' ');
        const season = parseInt(parts[parts.length - 1]);
        const lastSpaceIndex = anime.name.lastIndexOf(' ');

        let match = null;
        if (!isNaN(season) && season > 1) {
            const titleWithoutSeason = anime.name.substring(0, lastSpaceIndex);
            const exclamations = '!'.repeat(season - 1);
            const nameWithExclamation = titleWithoutSeason + exclamations;

            match = this.applyMatchers(
                animes,
                { ...anime, name: nameWithExclamation },
                this.defaultMatchers
            ).anime;

            if (!match) {
                match = this.animes.find(
                    (a) => a.name.startsWith(titleWithoutSeason) && a.name.endsWith(exclamations)
                );
            }
        }

        return { anime: match, guessed: true };
    }

    private matchIgnoreBracketValues(animes: Anime[], anime: Anime): AnimeMatch {
        const withoutBrackets = anime.name.replace(/\(.*?\)/g, '').trim();
        const match = this.applyMatchers(
            animes,
            { ...anime, name: withoutBrackets },
            this.defaultMatchers
        ).anime;
        return { anime: match, guessed: true };
    }

    private matchColonSections(animes: Anime[], anime: Anime): AnimeMatch {
        const colonSections = anime.name.split(':').map((x) => x.trim());
        const found = colonSections
            .map((a) => this.applyMatchers(animes, { ...anime, name: a }, this.extraMatchers).anime)
            .find((x) => !!x);
        return { anime: found, guessed: true };
    }

    private matchNameParts(animes: Anime[], anime: Anime): AnimeMatch {
        const parts = this.normalizeAnimeName(anime.name).split(' ');
        let match = null;
        if (parts.length > 8) {
            match = animes.find((a) => {
                const animeParts = this.normalizeAnimeName(a.name).split(' ');
                const set = new Set(animeParts);
                parts.forEach((x) => set.add(x));

                return set.size - 1 <= parts.length && animeParts.length === parts.length;
            });
        }

        return { anime: match, guessed: true };
    }
}

type AnimeMatcherType = (aa: Anime[], a: Anime) => AnimeMatch;

export interface AnimeMatch {
    anime?: Anime;
    guessed?: boolean;
}

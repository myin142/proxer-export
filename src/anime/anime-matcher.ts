import { Anime } from './anime';

type AnimeMatcherType = (aa: Anime[], a: Anime) => Anime;

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
        return animes.filter((a) => a.episodes === anime.episodes && a.type === anime.type);
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

    private constructor(private animes: Anime[]) {
        this.defaultMatchers = [this.exactMatch, this.startsWith];
        this.extraMatchers = [
            this.matchIgnoreSpecialCharacters.bind(this),
            this.matchSpaceBetweenCapitalized.bind(this),
            this.matchCombinedSpecialCharacters.bind(this),
            this.matchExclamationAsSeasons.bind(this),
            this.matchSeasonAliases.bind(this),
        ];
        this.allMatchers = [
            ...this.defaultMatchers,
            ...this.extraMatchers,
            this.matchColonSections.bind(this),
        ];
    }

    private findMatch(anime: Anime): AnimeMatch {
        return this.applyMatchers(this.animes, anime);
    }

    private applyMatchers(
        animes: Anime[],
        anime: Anime,
        matchers: ((aa: Anime[], a: Anime) => Anime)[] = this.allMatchers
    ): AnimeMatch {
        let found = null;
        let guessed = false;

        for (let i = 0; i < matchers.length; i++) {
            const matcher = matchers[i];
            found = matcher(animes, anime);

            if (found) {
                guessed = i > 0;
                break;
            }
        }

        return { anime: found, guessed };
    }

    private exactMatch(animes: Anime[], { name }: Anime): Anime {
        return animes.find((a) => a.name.toLowerCase() === name.toLowerCase());
    }

    private startsWith(animes: Anime[], { name }: Anime): Anime {
        return animes.find((a) => a.name.toLowerCase().startsWith(name.toLowerCase()));
    }

    private matchIgnoreSpecialCharacters(animes: Anime[], anime: Anime): Anime {
        const animeWithoutSpecial = this.normalizeAnime(anime);
        const animesWithoutSpecial = animes.map((a) => this.normalizeAnime(a));
        let found = this.applyMatchers(
            animesWithoutSpecial,
            animeWithoutSpecial,
            this.defaultMatchers
        ).anime;

        if (found) {
            found = animes.find((a) => this.normalizeAnimeName(a.name) === found.name);
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
            .split(/-|:|\s+/g)
            .map((x) => x.trim())
            .filter((x) => !!x)
            .join(' ');
    }

    private matchSpaceBetweenCapitalized(animes: Anime[], anime: Anime): Anime {
        const spaced = anime.name.replace(/([a-z])([A-Z])/g, '$1 $2');
        return this.applyMatchers(animes, { ...anime, name: spaced }, this.defaultMatchers).anime;
    }

    private matchCombinedSpecialCharacters(animes: Anime[], anime: Anime): Anime {
        const combinedSpecial = anime.name.replace(/-/g, '');
        return this.applyMatchers(animes, { ...anime, name: combinedSpecial }, this.defaultMatchers)
            .anime;
    }

    private matchSeasonAliases(animes: Anime[], anime: Anime): Anime {
        const aliases = ['2nd Season', 'II', '2'];

        return aliases
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
    }

    private matchExclamationAsSeasons(animes: Anime[], anime: Anime): Anime {
        const parts = anime.name.split(' ');
        const season = parseInt(parts[parts.length - 1]);
        const lastSpaceIndex = anime.name.lastIndexOf(' ');
        if (!isNaN(season) && season > 1) {
            const titleWithoutSeason = anime.name.substring(0, lastSpaceIndex);
            const exclamations = '!'.repeat(season - 1);
            const nameWithExclamation = titleWithoutSeason + exclamations;

            let match = this.applyMatchers(
                animes,
                { ...anime, name: nameWithExclamation },
                this.defaultMatchers
            ).anime;

            if (!match) {
                match = this.animes.find(
                    (a) => a.name.startsWith(titleWithoutSeason) && a.name.endsWith(exclamations)
                );
            }

            return match;
        }
    }

    private matchColonSections(animes: Anime[], anime: Anime): Anime {
        const colonSections = anime.name.split(':').map((x) => x.trim());
        return colonSections
            .map((a) => this.applyMatchers(animes, { ...anime, name: a }, this.extraMatchers).anime)
            .find((x) => !!x);
    }
}

export interface AnimeMatch {
    anime?: Anime;
    guessed?: boolean;
}

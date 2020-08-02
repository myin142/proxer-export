import { Anime, AnimeAdapter, AnimeStatus, AnimeType } from '../anime/anime';
import { JikanApi, JikanResult } from '../jikan';
import { create } from 'xmlbuilder2';
import * as fs from 'fs-extra';

export class MyAnimeListAdapter implements AnimeAdapter<any> {
    private jikanApi: JikanApi;

    constructor(url: string) {
        this.jikanApi = new JikanApi(url);
    }

    async export(animes: Anime[]): Promise<void> {
        const malAnimes = await Promise.all(
            animes.slice(0, 10).map(async (a) => {
                await new Promise((r) => setTimeout(r, 5000));
                return this.toMyAnimeListAnime(a);
            })
        );

        const doc = create({
            myanimelist: {
                myinfo: {},
                anime: malAnimes,
            },
        });
        const xml = doc.end({ prettyPrint: true });
        await fs.writeFile('mal-export.xml', xml);
    }

    private async toMyAnimeListAnime(anime: Anime): Promise<MyAnimeListAnime> {
        const result = await this.jikanApi.searchAnime(anime.name);
        let singleResult = this.findBestJikanResult(result, anime);

        if (!singleResult) {
            singleResult = this.guessBestJikanResult(result, anime);
            if (!singleResult) {
                console.log(`Could not find best or guess result for ${anime.name}`);
                return;
            } else {
                console.log(`Guessed result for ${anime.name} as ${singleResult.title}`);
            }
        }

        return {
            series_animedb_id: singleResult.mal_id,
            my_watched_episodes: anime.watchedEpisodes,
            my_status: this.toMyAnimeListStatus(anime.status),
        };
    }

    private findBestJikanResult(result: JikanResult[], anime: Anime): JikanResult {
        const filtered = result.filter((r) => r.title === anime.name && this.equalAnime(r, anime));
        return filtered.length > 0 ? filtered[0] : null;
    }

    private guessBestJikanResult(result: JikanResult[], anime: Anime): JikanResult {
        let guess = result.filter(
            (r) => r.title.startsWith(anime.name) && this.equalAnime(r, anime)
        );
        if (guess.length === 0)
            guess = result.filter(
                (r) => r.title.indexOf(anime.name) != -1 && this.equalAnime(r, anime)
            );

        return guess.length > 0 ? guess[0] : null;
    }

    private equalAnime(result: JikanResult, anime: Anime): boolean {
        return result.episodes === anime.episodes && this.sameAnimeType(result.type, anime.type);
    }

    private sameAnimeType(malType: animeType, type: AnimeType): boolean {
        return (
            (type === AnimeType.Series && malType === 'TV') ||
            (type === AnimeType.Movie && malType === 'Movie')
        );
    }

    private toMyAnimeListStatus(s: AnimeStatus): status {
        switch (s) {
            case AnimeStatus.Completed:
                return 'Completed';
            case AnimeStatus.Dropped:
                return 'Dropped';
            case AnimeStatus.Watching:
                return 'Watching';
            case AnimeStatus.Planned:
                return 'Plan to Watch';
        }
    }

    import(json: any[]): Anime[] {
        throw new Error('Method not implemented.');
    }
}

export interface MyAnimeListAnime {
    series_animedb_id: number;
    my_watched_episodes: number;
    my_status: status;
}

type status = 'On-Hold' | 'Plan to Watch' | 'Completed' | 'Dropped' | 'Watching';
export type animeType = 'TV' | 'Movie';

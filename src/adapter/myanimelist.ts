import { Anime, AnimeAdapter, AnimeStatus, AnimeType } from '../anime/anime';
import { JikanApi } from '../jikan';
import { create } from 'xmlbuilder2';
import * as fs from 'fs-extra';
import { AnimeMatcher } from '../anime/anime-matcher';

export class MyAnimeListAdapter implements AnimeAdapter<any> {
    private jikanApi: JikanApi;

    constructor(url: string) {
        this.jikanApi = new JikanApi(url);
    }

    async export(animes: Anime[]): Promise<void> {
        const malAnimes = await Promise.all(
            animes
                .map(async (a) => {
                    await new Promise((r) => setTimeout(r, 4000));
                    return this.toMyAnimeListAnime(a);
                })
                .filter((x) => !!x)
        );

        const doc = create({
            myanimelist: {
                anime: malAnimes,
            },
        });
        const xml = doc.end({ prettyPrint: true });
        await fs.writeFile('mal-export.xml', xml);
    }

    private async toMyAnimeListAnime(anime: Anime): Promise<MyAnimeListAnime> {
        const result = await this.jikanApi.searchAnime(anime.name);
        const searchAnimes: Anime[] = result.map((r) => ({
            episodes: r.episodes,
            name: r.title,
            type: this.toAnimeType(r.type),
            status: null,
            watchedEpisodes: null,
        }));

        const match = AnimeMatcher.findBestMatch(searchAnimes, anime);
        if (!match.anime) {
            console.log(`Could not find best or guess result for ${anime.name}`);
            return;
        }

        if (match.guessed) {
            console.log(`Guessed ${anime.name} as ${match.anime.name}`);
        }

        const foundResult = result.find((r) => r.title === match.anime.name);
        return {
            series_animedb_id: foundResult.mal_id,
            my_watched_episodes: anime.watchedEpisodes,
            my_status: this.toMyAnimeListStatus(anime.status),
            my_finish_date: '0000-00-00',
            my_start_date: '0000-00-00',
            my_score: 0,
        };
    }

    private toAnimeType(malType: animeType): AnimeType {
        switch (malType) {
            case 'Movie':
                return AnimeType.Movie;
            case 'TV':
                return AnimeType.Series;
            case 'ONA':
                return AnimeType.ONA;
        }
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
    my_score: number;
    my_start_date: string;
    my_finish_date: string;
}

type status = 'On-Hold' | 'Plan to Watch' | 'Completed' | 'Dropped' | 'Watching';
export type animeType = 'TV' | 'Movie' | 'ONA';

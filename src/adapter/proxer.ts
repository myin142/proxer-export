import { Anime, AnimeAdapter, AnimeStatus, AnimeType } from '../anime/anime';

export class ProxerAdapter implements AnimeAdapter<ProxerExport> {
    export(animes: Anime[]): void {
        throw new Error('Method not implemented.');
    }
    import(json: ProxerExport): Anime[] {
        return Object.keys(json)
            .map((status) => {
                const animes = json[status] as ProxerAnime[];
                return animes.map((x) => this.parseProxerAnime(x, status as status));
            })
            .reduce((x, y) => x.concat(y), []);
    }

    private parseProxerAnime(p: ProxerAnime, s: status): Anime {
        const episodes = p.state.split('/').map((x) => parseInt(x.trim()));
        return {
            name: p.name,
            status: this.toAnimeStatus(s),
            watchedEpisodes: episodes[0],
            episodes: episodes[1],
            type: this.toAnimeType(p.type),
        };
    }

    private toAnimeType(t: animeType): AnimeType {
        switch (t) {
            case 'Animeserie':
                return AnimeType.Series;
            case 'Movie':
                return AnimeType.Movie;
        }
    }

    private toAnimeStatus(s: status): AnimeStatus {
        switch (s) {
            case 'geschaut':
                return AnimeStatus.Completed;
            case 'am-schauen':
                return AnimeStatus.Watching;
            case 'wird-noch-geschaut':
                return AnimeStatus.Planned;
            case 'abgebrochen':
                return AnimeStatus.Dropped;
        }
    }
}

export type ProxerExport = { [k in status]: ProxerAnime[] };
type status = 'geschaut' | 'am-schauen' | 'wird-noch-geschaut' | 'abgebrochen';
type animeType = 'Animeserie' | 'Movie';

export interface ProxerAnime {
    name: string;
    state: string;
    type: animeType;
}

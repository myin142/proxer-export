export interface AnimeAdapter<T> {
    export(animes: Anime[]): void;
    import(json: T): Anime[];
}

export interface Anime {
    status?: AnimeStatus;
    name: string;
    episodes?: number;
    watchedEpisodes?: number;
    type?: AnimeType;
}

export enum AnimeStatus {
    Completed,
    Watching,
    Planned,
    Dropped,
}

export enum AnimeType {
    Series,
    Movie,
}

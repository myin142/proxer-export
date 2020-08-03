import * as axios from 'axios';
import * as mal from './adapter/myanimelist';

export class JikanApi {
    constructor(private baseUrl: string) {}

    async searchAnime(name: string): Promise<JikanResult[]> {
        const response = await axios.default.get(
            `${this.baseUrl}/search/anime?q=${encodeURIComponent(name)}&limit=10`
        );

        const { results } = response.data as JikanResponse;
        return results;
    }
}

interface JikanResponse {
    results: JikanResult[];
}

export interface JikanResult {
    mal_id: number;
    title: string;
    episodes: number;
    type: mal.animeType;
}

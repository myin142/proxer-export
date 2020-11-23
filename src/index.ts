import * as fs from 'fs-extra';
import { argv } from 'process';
import { ProxerAdapter, ProxerExport } from './adapter/proxer';
import { MyAnimeListAdapter } from './adapter/myanimelist';

readFile<ProxerExport>(argv[2]).then((json) => {
    if (!json) {
        console.log('Invalid File');
        return;
    }

    const animes = new ProxerAdapter().import(json);
    new MyAnimeListAdapter('http://localhost:9001/v3').export(animes);
});

async function readFile<T>(file: string): Promise<T> {
    if (await fs.pathExists(file)) {
        return (await fs.readJson(file)) as T;
    }
}

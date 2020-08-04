import { AnimeMatcher } from './anime-matcher';

describe('Anime Matcher', () => {
    it('match exact', () => {
        expect(AnimeMatcher.findBestMatch([{ name: '11eyes' }], { name: '11eyes' })).toEqual({
            anime: { name: '11eyes' },
            guessed: false,
        });
    });

    it('match case insensitive', () => {
        expect(
            AnimeMatcher.findBestMatch([{ name: 'Date A Live' }], { name: 'Date a live' })
        ).toEqual({
            anime: { name: 'Date A Live' },
            guessed: false,
        });
    });

    it('match with special character Ⅲ', () => {
        expect(
            AnimeMatcher.findBestMatch([{ name: 'Date A Live III' }], { name: 'Date a live Ⅲ' })
        ).toEqual({
            anime: { name: 'Date A Live III' },
            guessed: false,
        });
    });

    it('match ignore colon special characters in search', () => {
        expect(
            AnimeMatcher.findBestMatch([{ name: 'Clanned: After Story' }], {
                name: 'Clanned After Story',
            })
        ).toEqual({
            anime: { name: 'Clanned: After Story' },
            guessed: false,
        });
    });

    it('match dash special characters', () => {
        expect(
            AnimeMatcher.findBestMatch([{ name: 'Dumbbell Nan Kilo Moteru?' }], {
                name: 'Dumbbell Nan-Kilo Moteru?',
            })
        ).toEqual({
            anime: { name: 'Dumbbell Nan Kilo Moteru?' },
            guessed: false,
        });
    });

    it('match starts with', () => {
        expect(
            AnimeMatcher.findBestMatch([{ name: 'Acchi Kocchi (TV)' }], {
                name: 'Acchi Kocchi',
            })
        ).toEqual({
            anime: { name: 'Acchi Kocchi (TV)' },
            guessed: true,
        });
    });

    it('match season exclamation', () => {
        expect(
            AnimeMatcher.findBestMatch([{ name: 'Bokutachi wa Benkyou ga Dekinai!' }], {
                name: 'Bokutachi wa Benkyou ga Dekinai 2',
            })
        ).toEqual({
            anime: { name: 'Bokutachi wa Benkyou ga Dekinai!' },
            guessed: true,
        });
    });

    it('match colon sections', () => {
        expect(
            AnimeMatcher.findBestMatch([{ name: 'Cop Craft' }], {
                name: 'Cop Craft: Dragnet Mirage Reloaded',
            })
        ).toEqual({
            anime: { name: 'Cop Craft' },
            guessed: true,
        });
    });

    it('match no space between capitalized letters', () => {
        expect(
            AnimeMatcher.findBestMatch([{ name: 'Himouto! Umaru-chan R' }], {
                name: 'Himouto! Umaru-chanR',
            })
        ).toEqual({
            anime: { name: 'Himouto! Umaru-chan R' },
            guessed: false,
        });
    });

    it('match combined special characters', () => {
        expect(
            AnimeMatcher.findBestMatch([{ name: 'Hanasaku Iroha' }], {
                name: 'Hana-Saku Iroha',
            })
        ).toEqual({
            anime: { name: 'Hanasaku Iroha' },
            guessed: false,
        });
    });

    it('match season aliases romanian', () => {
        expect(
            AnimeMatcher.findBestMatch([{ name: 'Gin no Guardian II' }], {
                name: 'Gin no Guardian 2nd Season',
            })
        ).toEqual({
            anime: { name: 'Gin no Guardian II' },
            guessed: true,
        });
    });

    it('match season aliases number', () => {
        expect(
            AnimeMatcher.findBestMatch([{ name: 'Karakai Jouzu no Takagi-san 2' }], {
                name: 'Karakai Jouzu no Takagi-san 2nd Season',
            })
        ).toEqual({
            anime: { name: 'Karakai Jouzu no Takagi-san 2' },
            guessed: true,
        });
    });

    it('match name parts', () => {
        expect(
            AnimeMatcher.findBestMatch(
                [{ name: 'Isekai Maou to Shoukan Shoujo no Dorei Majutsu' }],
                {
                    name: 'Isekai Maou to Shoukan Shoujo Dorei Majutsu',
                }
            )
        ).toEqual({
            anime: { name: 'Isekai Maou to Shoukan Shoujo no Dorei Majutsu' },
            guessed: true,
        });
    });

    it('match all joined', () => {
        expect(
            AnimeMatcher.findBestMatch([{ name: 'Nagi no Asu kara' }], {
                name: 'Nagi no Asukara',
            })
        ).toEqual({
            anime: { name: 'Nagi no Asu kara' },
            guessed: false,
        });
    });

    it('match ignore bracket values', () => {
        expect(
            AnimeMatcher.findBestMatch([{ name: 'Ryuugajou Nanana no Maizoukin' }], {
                name: 'Ryuugajou Nanana no Maizoukin (2014)',
            })
        ).toEqual({
            anime: { name: 'Ryuugajou Nanana no Maizoukin' },
            guessed: true,
        });
    });

    it('match strange characters', () => {
        expect(
            AnimeMatcher.findBestMatch([{ name: 'Shin Koihime†Musou' }], {
                name: 'Shin Koihime Musou',
            })
        ).toEqual({
            anime: { name: 'Shin Koihime†Musou' },
            guessed: false,
        });
    });
});

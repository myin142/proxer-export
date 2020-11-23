# Proxer Export

Uses the output of [ProxerExport](https://github.com/PryosCode/ProxerExport) and converts to a myanimelist xml format that can be imported to anilist.co

Could easily be adjusted for all kinds of anime services

### Supports

-   Proxer -> Anilist

### How to use

- Export proxer anime list with the above ProxerExport
- Run a local [jikan-rest](https://github.com/jikan-me/jikan-rest) API (public rest api has limited requests)
- Clone repository and install dependencies
- run: `npm start <path to local export file>`
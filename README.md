# Travel

Travel photo website built with React and Vite.

See [Photo privacy cleanup](IMAGE_PRIVACY.md) for setup, the cleanup commands, and publishing instructions.

```sh
npm run photos:setup
npm run photos:clean
npm run photos:check
npm run dev
```

`npm run build` cleans photo metadata before building. Pushing `main` deploys to GitHub Pages.

## Shared Global Footprint

`npm run travel:summary` calculates the visited-country percentage from `src/data/travelData.js` and `public/world.json`, writing `public/travel-summary.json`. It runs automatically before development and production builds. Both Travel galleries and the portfolio homepage read `/travel/travel-summary.json`, so the statistic has one published source. Publish the Travel repository after updating travel spots to refresh both sites.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { geoContains } from 'd3-geo';
import { feature } from 'topojson-client';
import { travelSpots, TOTAL_COUNTRIES } from '../src/data/travelData.js';

const world = JSON.parse(await readFile(new URL('../public/world.json', import.meta.url), 'utf8'));
const countries = feature(world, world.objects.countries).features;
const visited = new Set();
for (const spot of travelSpots) {
  const country = countries.find(country => geoContains(country, spot.coordinates));
  if (country) visited.add(country.id ?? country.properties.name);
}
const summary = {
  visitedCountries: visited.size,
  totalCountries: TOTAL_COUNTRIES,
  explorationPercentage: ((visited.size / TOTAL_COUNTRIES) * 100).toFixed(1),
};
const destination = new URL('../public/travel-summary.json', import.meta.url);
await writeFile(destination, JSON.stringify(summary, null, 2) + '\n');
console.log(`Generated ${fileURLToPath(destination)}: ${summary.explorationPercentage}%`);

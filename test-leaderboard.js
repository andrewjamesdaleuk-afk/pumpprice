import { fetchBrandLeaderboard } from './frontend/src/services/stations.js';
console.log("Fetching brand leaderboard...");
fetchBrandLeaderboard('E10').then(console.log).catch(console.error);

import * as migration_20261115_000028_initial_solarshare_schema from './20261115_000028_initial_solarshare_schema';

export const migrations = [
  {
    up: migration_20261115_000028_initial_solarshare_schema.up,
    down: migration_20261115_000028_initial_solarshare_schema.down,
    name: '20261115_000028_initial_solarshare_schema'
  },
];

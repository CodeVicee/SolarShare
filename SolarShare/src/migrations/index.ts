import * as migration_20261115_000028_initial_solarshare_schema from './20261115_000028_initial_solarshare_schema';
import * as migration_20261119_164005_add_meter_device_channel from './20261119_164005_add_meter_device_channel';
import * as migration_20261123_041906_add_esp32_monitor_readings from './20261123_041906_add_esp32_monitor_readings';
import * as migration_20261123_042659_add_esp32_monitor_adapter from './20261123_042659_add_esp32_monitor_adapter';

export const migrations = [
  {
    up: migration_20261115_000028_initial_solarshare_schema.up,
    down: migration_20261115_000028_initial_solarshare_schema.down,
    name: '20261115_000028_initial_solarshare_schema',
  },
  {
    up: migration_20261119_164005_add_meter_device_channel.up,
    down: migration_20261119_164005_add_meter_device_channel.down,
    name: '20261119_164005_add_meter_device_channel',
  },
  {
    up: migration_20261123_041906_add_esp32_monitor_readings.up,
    down: migration_20261123_041906_add_esp32_monitor_readings.down,
    name: '20261123_041906_add_esp32_monitor_readings',
  },
  {
    up: migration_20261123_042659_add_esp32_monitor_adapter.up,
    down: migration_20261123_042659_add_esp32_monitor_adapter.down,
    name: '20261123_042659_add_esp32_monitor_adapter'
  },
];

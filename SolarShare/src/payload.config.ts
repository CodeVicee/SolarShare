
import path from 'path'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { en as adminLanguage } from '@payloadcms/translations/languages/en'
import { fileURLToPath } from 'url'

import { Admins } from './collections/Admins'
import { Media } from './collections/Media'
import { Folders } from './collections/Folders'
import { Tags } from './collections/Tags'
import { Users } from './collections/Users'
import { ProfileImages } from './collections/ProfileImages'
import { SolarSystems } from './collections/SolarSystems'
import { EnergyRecords } from './collections/EnergyRecords'
import { SharingRecords } from './collections/SharingRecords'
import { AppNotifications } from './collections/AppNotifications'
import { SystemAlerts } from './collections/SystemAlerts'
import { TelemetryIngestionEvents } from './collections/TelemetryIngestionEvents'
import { SolarOwnerProfiles } from './collections/SolarOwnerProfiles'
import { SolarOwnerApplications } from './collections/SolarOwnerApplications'
import { CustomerProfiles } from './collections/CustomerProfiles'
import { CustomerRelationships } from './collections/CustomerRelationships'
import { EnergyTariffs } from './collections/EnergyTariffs'
import { EnergyPurchasePackages } from './collections/EnergyPurchasePackages'
import { PaymentTransactions } from './collections/PaymentTransactions'
import { EnergyAllocationRequests } from './collections/EnergyAllocationRequests'
import { EnergyAllocationRecords } from './collections/EnergyAllocationRecords'
import { EnergyWallets } from './collections/EnergyWallets'
import { EnergyLedgerEntries } from './collections/EnergyLedgerEntries'
import { MeterRegistrations } from './collections/MeterRegistrations'
import { MeterReadings } from './collections/MeterReadings'
import { ConsumptionRecords } from './collections/ConsumptionRecords'

import { resendEmailAdapter } from './lib/resend-email'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const requiredEnv = (name: string): string => {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is required. Check your .env file.`)
  }

  return value
}

export default buildConfig({
  secret: requiredEnv('PAYLOAD_SECRET'),

  db: postgresAdapter({
    pool: {
      connectionString: requiredEnv('DATABASE_URL'),
    },
    push: false,
    disableCreateDatabase: true,
  }),

  admin: {
    user: Admins.slug,
    constrainWidth: true,
    dashboard: {
      widgets: [],
      defaultLayout: [
        { widgetSlug: 'activity', width: 'full' },
        { widgetSlug: 'collections', width: 'full' },
      ],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },

  i18n: {
    fallbackLanguage: 'en',
    supportedLanguages: { en: adminLanguage },
  },

  collections: [
    Admins,
    Users,
    ProfileImages,
    SolarSystems,
    EnergyRecords,
    SharingRecords,
    AppNotifications,
    SystemAlerts,
    TelemetryIngestionEvents,
    SolarOwnerApplications,
    SolarOwnerProfiles,
    CustomerProfiles,
    CustomerRelationships,
    EnergyTariffs,
    EnergyPurchasePackages,
    PaymentTransactions,
    EnergyAllocationRequests,
    EnergyAllocationRecords,
    EnergyWallets,
    EnergyLedgerEntries,
    MeterRegistrations,
    MeterReadings,
    ConsumptionRecords,
    Media,
    Folders,
    Tags,
  ],

  email: resendEmailAdapter,

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  localization: {
    locales: [{ code: 'en', label: 'English' }],
    fallback: true,
    defaultLocale: 'en',
  },

  plugins: [mcpPlugin({})],
})

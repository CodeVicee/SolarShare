import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_solar_systems_integration_adapter" ADD VALUE 'esp32-monitor';
  ALTER TYPE "public"."enum__solar_systems_v_version_integration_adapter" ADD VALUE 'esp32-monitor';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "solar_systems" ALTER COLUMN "integration_adapter" SET DATA TYPE text;
  ALTER TABLE "solar_systems" ALTER COLUMN "integration_adapter" SET DEFAULT 'not-configured'::text;
  DROP TYPE "public"."enum_solar_systems_integration_adapter";
  CREATE TYPE "public"."enum_solar_systems_integration_adapter" AS ENUM('not-configured', 'generic-signed-webhook');
  ALTER TABLE "solar_systems" ALTER COLUMN "integration_adapter" SET DEFAULT 'not-configured'::"public"."enum_solar_systems_integration_adapter";
  ALTER TABLE "solar_systems" ALTER COLUMN "integration_adapter" SET DATA TYPE "public"."enum_solar_systems_integration_adapter" USING "integration_adapter"::"public"."enum_solar_systems_integration_adapter";
  ALTER TABLE "_solar_systems_v" ALTER COLUMN "version_integration_adapter" SET DATA TYPE text;
  ALTER TABLE "_solar_systems_v" ALTER COLUMN "version_integration_adapter" SET DEFAULT 'not-configured'::text;
  DROP TYPE "public"."enum__solar_systems_v_version_integration_adapter";
  CREATE TYPE "public"."enum__solar_systems_v_version_integration_adapter" AS ENUM('not-configured', 'generic-signed-webhook');
  ALTER TABLE "_solar_systems_v" ALTER COLUMN "version_integration_adapter" SET DEFAULT 'not-configured'::"public"."enum__solar_systems_v_version_integration_adapter";
  ALTER TABLE "_solar_systems_v" ALTER COLUMN "version_integration_adapter" SET DATA TYPE "public"."enum__solar_systems_v_version_integration_adapter" USING "version_integration_adapter"::"public"."enum__solar_systems_v_version_integration_adapter";`)
}

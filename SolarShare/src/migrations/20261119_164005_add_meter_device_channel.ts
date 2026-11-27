
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_meter_registrations_device_channel"
      AS ENUM('unassigned', 'channel-1', 'channel-2');

    CREATE TYPE "public"."enum__meter_registrations_v_version_device_channel"
      AS ENUM('unassigned', 'channel-1', 'channel-2');

    ALTER TABLE "meter_registrations"
      ADD COLUMN "device_channel"
      "enum_meter_registrations_device_channel"
      DEFAULT 'unassigned' NOT NULL;

    ALTER TABLE "_meter_registrations_v"
      ADD COLUMN "version_device_channel"
      "enum__meter_registrations_v_version_device_channel"
      DEFAULT 'unassigned' NOT NULL;


    CREATE UNIQUE INDEX "meter_registrations_system_device_channel_active_idx"
      ON "meter_registrations" USING btree ("system_id", "device_channel")
      WHERE ("device_channel" <> 'unassigned' AND "status" <> 'disconnected');
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "meter_registrations_system_device_channel_active_idx";


    ALTER TABLE "meter_registrations" DROP COLUMN "device_channel";
    ALTER TABLE "_meter_registrations_v" DROP COLUMN "version_device_channel";

    DROP TYPE "public"."enum_meter_registrations_device_channel";
    DROP TYPE "public"."enum__meter_registrations_v_version_device_channel";
  `)
}

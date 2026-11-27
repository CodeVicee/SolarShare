import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_esp32_monitor_readings_mode" AS ENUM('demo', 'live');
  CREATE TYPE "public"."enum_esp32_monitor_readings_quality" AS ENUM('unverified', 'estimated');
  CREATE TYPE "public"."enum__esp32_monitor_readings_v_version_mode" AS ENUM('demo', 'live');
  CREATE TYPE "public"."enum__esp32_monitor_readings_v_version_quality" AS ENUM('unverified', 'estimated');
  CREATE TABLE "esp32_monitor_readings" (
    "id" serial PRIMARY KEY NOT NULL,
    "owner_id" integer NOT NULL,
    "system_id" integer NOT NULL,
    "device_reference" varchar NOT NULL,
    "event_id" varchar NOT NULL,
    "dedupe_key" varchar NOT NULL,
    "measured_at" timestamp(3) with time zone NOT NULL,
    "voltage1" numeric,
    "current1" numeric,
    "power1va" numeric,
    "relay1" boolean,
    "voltage2" numeric,
    "current2" numeric,
    "power2va" numeric,
    "relay2" boolean,
    "mode" "enum_esp32_monitor_readings_mode" DEFAULT 'demo' NOT NULL,
    "quality" "enum_esp32_monitor_readings_quality" DEFAULT 'unverified' NOT NULL,
    "received_at" timestamp(3) with time zone NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "esp32_monitor_readings_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "_esp32_monitor_readings_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_owner_id" integer NOT NULL,
    "version_system_id" integer NOT NULL,
    "version_device_reference" varchar NOT NULL,
    "version_event_id" varchar NOT NULL,
    "version_dedupe_key" varchar NOT NULL,
    "version_measured_at" timestamp(3) with time zone NOT NULL,
    "version_voltage1" numeric,
    "version_current1" numeric,
    "version_power1va" numeric,
    "version_relay1" boolean,
    "version_voltage2" numeric,
    "version_current2" numeric,
    "version_power2va" numeric,
    "version_relay2" boolean,
    "version_mode" "enum__esp32_monitor_readings_v_version_mode" DEFAULT 'demo' NOT NULL,
    "version_quality" "enum__esp32_monitor_readings_v_version_quality" DEFAULT 'unverified' NOT NULL,
    "version_received_at" timestamp(3) with time zone NOT NULL,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "_esp32_monitor_readings_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "esp32_monitor_readings_id" integer;
  ALTER TABLE "esp32_monitor_readings" ADD CONSTRAINT "esp32_monitor_readings_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE no action;
  ALTER TABLE "esp32_monitor_readings" ADD CONSTRAINT "esp32_monitor_readings_system_id_solar_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."solar_systems"("id") ON DELETE RESTRICT ON UPDATE no action;
  ALTER TABLE "esp32_monitor_readings_rels" ADD CONSTRAINT "esp32_monitor_readings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."esp32_monitor_readings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "esp32_monitor_readings_rels" ADD CONSTRAINT "esp32_monitor_readings_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "esp32_monitor_readings_rels" ADD CONSTRAINT "esp32_monitor_readings_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_esp32_monitor_readings_v" ADD CONSTRAINT "_esp32_monitor_readings_v_parent_id_esp32_monitor_readings_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."esp32_monitor_readings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_esp32_monitor_readings_v" ADD CONSTRAINT "_esp32_monitor_readings_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE no action;
  ALTER TABLE "_esp32_monitor_readings_v" ADD CONSTRAINT "_esp32_monitor_readings_v_version_system_id_solar_systems_id_fk" FOREIGN KEY ("version_system_id") REFERENCES "public"."solar_systems"("id") ON DELETE RESTRICT ON UPDATE no action;
  ALTER TABLE "_esp32_monitor_readings_v_rels" ADD CONSTRAINT "_esp32_monitor_readings_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_esp32_monitor_readings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_esp32_monitor_readings_v_rels" ADD CONSTRAINT "_esp32_monitor_readings_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_esp32_monitor_readings_v_rels" ADD CONSTRAINT "_esp32_monitor_readings_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "esp32_monitor_readings_owner_idx" ON "esp32_monitor_readings" USING btree ("owner_id");
  CREATE INDEX "esp32_monitor_readings_system_idx" ON "esp32_monitor_readings" USING btree ("system_id");
  CREATE INDEX "esp32_monitor_readings_device_reference_idx" ON "esp32_monitor_readings" USING btree ("device_reference");
  CREATE UNIQUE INDEX "esp32_monitor_readings_dedupe_key_idx" ON "esp32_monitor_readings" USING btree ("dedupe_key");
  CREATE INDEX "esp32_monitor_readings_measured_at_idx" ON "esp32_monitor_readings" USING btree ("measured_at");
  CREATE INDEX "esp32_monitor_readings_mode_idx" ON "esp32_monitor_readings" USING btree ("mode");
  CREATE INDEX "esp32_monitor_readings_received_at_idx" ON "esp32_monitor_readings" USING btree ("received_at");
  CREATE INDEX "esp32_monitor_readings_updated_at_idx" ON "esp32_monitor_readings" USING btree ("updated_at");
  CREATE INDEX "esp32_monitor_readings_created_at_idx" ON "esp32_monitor_readings" USING btree ("created_at");
  CREATE INDEX "esp32_monitor_readings_rels_order_idx" ON "esp32_monitor_readings_rels" USING btree ("order");
  CREATE INDEX "esp32_monitor_readings_rels_parent_idx" ON "esp32_monitor_readings_rels" USING btree ("parent_id");
  CREATE INDEX "esp32_monitor_readings_rels_path_idx" ON "esp32_monitor_readings_rels" USING btree ("path");
  CREATE INDEX "esp32_monitor_readings_rels_admins_id_idx" ON "esp32_monitor_readings_rels" USING btree ("admins_id");
  CREATE INDEX "esp32_monitor_readings_rels_users_id_idx" ON "esp32_monitor_readings_rels" USING btree ("users_id");
  CREATE INDEX "_esp32_monitor_readings_v_parent_idx" ON "_esp32_monitor_readings_v" USING btree ("parent_id");
  CREATE INDEX "_esp32_monitor_readings_v_version_version_owner_idx" ON "_esp32_monitor_readings_v" USING btree ("version_owner_id");
  CREATE INDEX "_esp32_monitor_readings_v_version_version_system_idx" ON "_esp32_monitor_readings_v" USING btree ("version_system_id");
  CREATE INDEX "_esp32_monitor_readings_v_version_version_device_referen_idx" ON "_esp32_monitor_readings_v" USING btree ("version_device_reference");
  CREATE INDEX "_esp32_monitor_readings_v_version_version_dedupe_key_idx" ON "_esp32_monitor_readings_v" USING btree ("version_dedupe_key");
  CREATE INDEX "_esp32_monitor_readings_v_version_version_measured_at_idx" ON "_esp32_monitor_readings_v" USING btree ("version_measured_at");
  CREATE INDEX "_esp32_monitor_readings_v_version_version_mode_idx" ON "_esp32_monitor_readings_v" USING btree ("version_mode");
  CREATE INDEX "_esp32_monitor_readings_v_version_version_received_at_idx" ON "_esp32_monitor_readings_v" USING btree ("version_received_at");
  CREATE INDEX "_esp32_monitor_readings_v_version_version_updated_at_idx" ON "_esp32_monitor_readings_v" USING btree ("version_updated_at");
  CREATE INDEX "_esp32_monitor_readings_v_version_version_created_at_idx" ON "_esp32_monitor_readings_v" USING btree ("version_created_at");
  CREATE INDEX "_esp32_monitor_readings_v_created_at_idx" ON "_esp32_monitor_readings_v" USING btree ("created_at");
  CREATE INDEX "_esp32_monitor_readings_v_updated_at_idx" ON "_esp32_monitor_readings_v" USING btree ("updated_at");
  CREATE INDEX "_esp32_monitor_readings_v_rels_order_idx" ON "_esp32_monitor_readings_v_rels" USING btree ("order");
  CREATE INDEX "_esp32_monitor_readings_v_rels_parent_idx" ON "_esp32_monitor_readings_v_rels" USING btree ("parent_id");
  CREATE INDEX "_esp32_monitor_readings_v_rels_path_idx" ON "_esp32_monitor_readings_v_rels" USING btree ("path");
  CREATE INDEX "_esp32_monitor_readings_v_rels_admins_id_idx" ON "_esp32_monitor_readings_v_rels" USING btree ("admins_id");
  CREATE INDEX "_esp32_monitor_readings_v_rels_users_id_idx" ON "_esp32_monitor_readings_v_rels" USING btree ("users_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_esp32_monitor_readings_fk" FOREIGN KEY ("esp32_monitor_readings_id") REFERENCES "public"."esp32_monitor_readings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_esp32_monitor_readings_id_idx" ON "payload_locked_documents_rels" USING btree ("esp32_monitor_readings_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "esp32_monitor_readings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "esp32_monitor_readings_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_esp32_monitor_readings_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_esp32_monitor_readings_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "esp32_monitor_readings" CASCADE;
  DROP TABLE "esp32_monitor_readings_rels" CASCADE;
  DROP TABLE "_esp32_monitor_readings_v" CASCADE;
  DROP TABLE "_esp32_monitor_readings_v_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_esp32_monitor_readings_fk";

  DROP INDEX "payload_locked_documents_rels_esp32_monitor_readings_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "esp32_monitor_readings_id";
  DROP TYPE "public"."enum_esp32_monitor_readings_mode";
  DROP TYPE "public"."enum_esp32_monitor_readings_quality";
  DROP TYPE "public"."enum__esp32_monitor_readings_v_version_mode";
  DROP TYPE "public"."enum__esp32_monitor_readings_v_version_quality";`)
}

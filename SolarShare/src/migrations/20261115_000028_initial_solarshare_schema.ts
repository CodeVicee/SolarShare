import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('solar-owner', 'customer', 'solar-owner-applicant');
  CREATE TYPE "public"."enum_users_account_status" AS ENUM('active', 'suspended', 'disabled');
  CREATE TYPE "public"."enum_users_auth_provider" AS ENUM('payload-native');
  CREATE TYPE "public"."enum_users_theme" AS ENUM('system', 'light', 'dark');
  CREATE TYPE "public"."enum_solar_systems_integration_adapter" AS ENUM('not-configured', 'generic-signed-webhook');
  CREATE TYPE "public"."enum_solar_systems_credential_status" AS ENUM('not-configured', 'configured', 'expired', 'error');
  CREATE TYPE "public"."enum_solar_systems_operational_status" AS ENUM('pending', 'connected', 'offline', 'maintenance', 'decommissioned');
  CREATE TYPE "public"."enum_solar_systems_data_source" AS ENUM('not-configured', 'manual', 'gateway', 'utility', 'import');
  CREATE TYPE "public"."enum__solar_systems_v_version_integration_adapter" AS ENUM('not-configured', 'generic-signed-webhook');
  CREATE TYPE "public"."enum__solar_systems_v_version_credential_status" AS ENUM('not-configured', 'configured', 'expired', 'error');
  CREATE TYPE "public"."enum__solar_systems_v_version_operational_status" AS ENUM('pending', 'connected', 'offline', 'maintenance', 'decommissioned');
  CREATE TYPE "public"."enum__solar_systems_v_version_data_source" AS ENUM('not-configured', 'manual', 'gateway', 'utility', 'import');
  CREATE TYPE "public"."enum_energy_records_kind" AS ENUM('generation', 'consumption', 'battery-state-of-charge', 'battery-charge', 'battery-discharge', 'grid-import', 'grid-export');
  CREATE TYPE "public"."enum_energy_records_unit" AS ENUM('kW', 'kWh', '%');
  CREATE TYPE "public"."enum_energy_records_source" AS ENUM('manual', 'gateway', 'utility', 'import');
  CREATE TYPE "public"."enum_energy_records_quality" AS ENUM('verified', 'estimated', 'unverified');
  CREATE TYPE "public"."enum_energy_records_telemetry_status" AS ENUM('live', 'historical', 'demo');
  CREATE TYPE "public"."enum__energy_records_v_version_kind" AS ENUM('generation', 'consumption', 'battery-state-of-charge', 'battery-charge', 'battery-discharge', 'grid-import', 'grid-export');
  CREATE TYPE "public"."enum__energy_records_v_version_unit" AS ENUM('kW', 'kWh', '%');
  CREATE TYPE "public"."enum__energy_records_v_version_source" AS ENUM('manual', 'gateway', 'utility', 'import');
  CREATE TYPE "public"."enum__energy_records_v_version_quality" AS ENUM('verified', 'estimated', 'unverified');
  CREATE TYPE "public"."enum__energy_records_v_version_telemetry_status" AS ENUM('live', 'historical', 'demo');
  CREATE TYPE "public"."enum_sharing_records_direction" AS ENUM('received', 'distributed');
  CREATE TYPE "public"."enum_sharing_records_status" AS ENUM('proposed', 'approved', 'allocated', 'completed', 'cancelled', 'failed');
  CREATE TYPE "public"."enum_sharing_records_source" AS ENUM('coordination', 'meter-import', 'utility-confirmed');
  CREATE TYPE "public"."enum__sharing_records_v_version_direction" AS ENUM('received', 'distributed');
  CREATE TYPE "public"."enum__sharing_records_v_version_status" AS ENUM('proposed', 'approved', 'allocated', 'completed', 'cancelled', 'failed');
  CREATE TYPE "public"."enum__sharing_records_v_version_source" AS ENUM('coordination', 'meter-import', 'utility-confirmed');
  CREATE TYPE "public"."enum_app_notifications_type" AS ENUM('system', 'energy', 'sharing', 'security', 'account');
  CREATE TYPE "public"."enum_app_notifications_severity" AS ENUM('info', 'warning', 'critical', 'resolved');
  CREATE TYPE "public"."enum__app_notifications_v_version_type" AS ENUM('system', 'energy', 'sharing', 'security', 'account');
  CREATE TYPE "public"."enum__app_notifications_v_version_severity" AS ENUM('info', 'warning', 'critical', 'resolved');
  CREATE TYPE "public"."enum_system_alerts_severity" AS ENUM('info', 'warning', 'critical');
  CREATE TYPE "public"."enum_system_alerts_category" AS ENUM('connection', 'inverter', 'battery', 'metering', 'generation', 'safety', 'other');
  CREATE TYPE "public"."enum_system_alerts_status" AS ENUM('open', 'acknowledged', 'resolved', 'dismissed');
  CREATE TYPE "public"."enum_system_alerts_source" AS ENUM('system', 'gateway', 'utility', 'manual');
  CREATE TYPE "public"."enum__system_alerts_v_version_severity" AS ENUM('info', 'warning', 'critical');
  CREATE TYPE "public"."enum__system_alerts_v_version_category" AS ENUM('connection', 'inverter', 'battery', 'metering', 'generation', 'safety', 'other');
  CREATE TYPE "public"."enum__system_alerts_v_version_status" AS ENUM('open', 'acknowledged', 'resolved', 'dismissed');
  CREATE TYPE "public"."enum__system_alerts_v_version_source" AS ENUM('system', 'gateway', 'utility', 'manual');
  CREATE TYPE "public"."enum_telemetry_ingestion_events_status" AS ENUM('accepted', 'partial', 'duplicate', 'rejected');
  CREATE TYPE "public"."enum__telemetry_ingestion_events_v_version_status" AS ENUM('accepted', 'partial', 'duplicate', 'rejected');
  CREATE TYPE "public"."enum_solar_owner_applications_status" AS ENUM('pending', 'approved', 'rejected');
  CREATE TYPE "public"."enum_solar_owner_profiles_status" AS ENUM('active', 'suspended');
  CREATE TYPE "public"."enum__solar_owner_profiles_v_version_status" AS ENUM('active', 'suspended');
  CREATE TYPE "public"."enum_customer_profiles_status" AS ENUM('active', 'suspended');
  CREATE TYPE "public"."enum__customer_profiles_v_version_status" AS ENUM('active', 'suspended');
  CREATE TYPE "public"."enum_customer_relationships_status" AS ENUM('pending', 'approved', 'rejected', 'suspended', 'disconnected');
  CREATE TYPE "public"."enum__customer_relationships_v_version_status" AS ENUM('pending', 'approved', 'rejected', 'suspended', 'disconnected');
  CREATE TYPE "public"."enum_energy_tariffs_status" AS ENUM('active', 'superseded');
  CREATE TYPE "public"."enum__energy_tariffs_v_version_status" AS ENUM('active', 'superseded');
  CREATE TYPE "public"."enum_payment_transactions_provider" AS ENUM('paystack');
  CREATE TYPE "public"."enum_payment_transactions_currency" AS ENUM('NGN');
  CREATE TYPE "public"."enum_payment_transactions_status" AS ENUM('initiated', 'pending', 'successful', 'failed', 'abandoned', 'reversed', 'refunded');
  CREATE TYPE "public"."enum__payment_transactions_v_version_provider" AS ENUM('paystack');
  CREATE TYPE "public"."enum__payment_transactions_v_version_currency" AS ENUM('NGN');
  CREATE TYPE "public"."enum__payment_transactions_v_version_status" AS ENUM('initiated', 'pending', 'successful', 'failed', 'abandoned', 'reversed', 'refunded');
  CREATE TYPE "public"."enum_energy_allocation_requests_status" AS ENUM('pending', 'approved', 'rejected', 'refund-required', 'refunded');
  CREATE TYPE "public"."enum__energy_allocation_requests_v_version_status" AS ENUM('pending', 'approved', 'rejected', 'refund-required', 'refunded');
  CREATE TYPE "public"."enum_energy_ledger_entries_account_type" AS ENUM('owner-inventory', 'customer-wallet');
  CREATE TYPE "public"."enum_energy_ledger_entries_direction" AS ENUM('credit', 'debit');
  CREATE TYPE "public"."enum__energy_ledger_entries_v_version_account_type" AS ENUM('owner-inventory', 'customer-wallet');
  CREATE TYPE "public"."enum__energy_ledger_entries_v_version_direction" AS ENUM('credit', 'debit');
  CREATE TYPE "public"."enum_meter_registrations_status" AS ENUM('pending', 'active', 'suspended', 'disconnected');
  CREATE TYPE "public"."enum_meter_registrations_source" AS ENUM('not-configured', 'smart-meter', 'manual-audited');
  CREATE TYPE "public"."enum__meter_registrations_v_version_status" AS ENUM('pending', 'active', 'suspended', 'disconnected');
  CREATE TYPE "public"."enum__meter_registrations_v_version_source" AS ENUM('not-configured', 'smart-meter', 'manual-audited');
  CREATE TYPE "public"."enum_meter_readings_source" AS ENUM('smart-meter', 'manual-audited');
  CREATE TYPE "public"."enum_meter_readings_quality" AS ENUM('verified', 'estimated', 'unverified');
  CREATE TYPE "public"."enum_meter_readings_status" AS ENUM('accepted', 'duplicate', 'out-of-order', 'rejected');
  CREATE TYPE "public"."enum__meter_readings_v_version_source" AS ENUM('smart-meter', 'manual-audited');
  CREATE TYPE "public"."enum__meter_readings_v_version_quality" AS ENUM('verified', 'estimated', 'unverified');
  CREATE TYPE "public"."enum__meter_readings_v_version_status" AS ENUM('accepted', 'duplicate', 'out-of-order', 'rejected');
  CREATE TYPE "public"."enum_consumption_records_status" AS ENUM('applied', 'insufficient-credit', 'rejected');
  CREATE TYPE "public"."enum__consumption_records_v_version_status" AS ENUM('applied', 'insufficient-credit', 'rejected');
  CREATE TYPE "public"."enum_payload_llm_instructions_entity_type" AS ENUM('collection', 'global');
  CREATE TABLE "admins_sessions" (
   "_order" integer NOT NULL,
   "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "created_at" timestamp(3) with time zone,
    "expires_at" timestamp(3) with time zone NOT NULL
  );

  CREATE TABLE "admins" (
    "id" serial PRIMARY KEY NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "email" varchar NOT NULL,
    "reset_password_token" varchar,
    "reset_password_expiration" timestamp(3) with time zone,
    "salt" varchar,
    "hash" varchar,
    "reset_password_requested_at" timestamp(3) with time zone,
    "login_attempts" numeric DEFAULT 0,
    "lock_until" timestamp(3) with time zone
  );

  CREATE TABLE "admins_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "users_roles" (
    "order" integer NOT NULL,
    "parent_id" integer NOT NULL,
    "value" "enum_users_roles",
    "id" serial PRIMARY KEY NOT NULL
  );

  CREATE TABLE "users_sessions" (
   "_order" integer NOT NULL,
   "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "created_at" timestamp(3) with time zone,
    "expires_at" timestamp(3) with time zone NOT NULL
  );

  CREATE TABLE "users" (
    "id" serial PRIMARY KEY NOT NULL,
    "first_name" varchar NOT NULL,
    "last_name" varchar NOT NULL,
    "phone" varchar NOT NULL,
    "account_status" "enum_users_account_status" DEFAULT 'active' NOT NULL,
    "auth_provider" "enum_users_auth_provider" DEFAULT 'payload-native' NOT NULL,
    "avatar_id" integer,
    "theme" "enum_users_theme" DEFAULT 'system',
    "notification_preferences_email_alerts" boolean DEFAULT true,
    "notification_preferences_system_alerts" boolean DEFAULT true,
    "notification_preferences_sharing_updates" boolean DEFAULT true,
    "notification_preferences_weekly_summary" boolean DEFAULT false,
    "terms_accepted" boolean DEFAULT false NOT NULL,
    "last_verification_sent_at" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "email" varchar NOT NULL,
    "reset_password_token" varchar,
    "reset_password_expiration" timestamp(3) with time zone,
    "salt" varchar,
    "hash" varchar,
    "reset_password_requested_at" timestamp(3) with time zone,
    "_verified" boolean,
    "_verificationtoken" varchar,
    "login_attempts" numeric DEFAULT 0,
    "lock_until" timestamp(3) with time zone
  );

  CREATE TABLE "users_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "profile_images" (
    "id" serial PRIMARY KEY NOT NULL,
    "alt" varchar NOT NULL,
    "owner_id" integer NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "url" varchar,
    "thumbnail_u_r_l" varchar,
    "filename" varchar,
    "mime_type" varchar,
    "filesize" numeric,
    "width" numeric,
    "height" numeric,
    "original_filename" varchar,
    "original_url" varchar,
    "original_mime_type" varchar,
    "original_filesize" numeric,
    "original_width" numeric,
    "original_height" numeric,
    "original_prefix" varchar,
    "original__objectkey" varchar,
    "focal_x" numeric,
    "focal_y" numeric
  );

  CREATE TABLE "profile_images_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "_profile_images_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_alt" varchar NOT NULL,
    "version_owner_id" integer NOT NULL,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version_url" varchar,
    "version_thumbnail_u_r_l" varchar,
    "version_filename" varchar,
    "version_mime_type" varchar,
    "version_filesize" numeric,
    "version_width" numeric,
    "version_height" numeric,
    "version_original_filename" varchar,
    "version_original_url" varchar,
    "version_original_mime_type" varchar,
    "version_original_filesize" numeric,
    "version_original_width" numeric,
    "version_original_height" numeric,
    "version_original_prefix" varchar,
    "version_original__objectkey" varchar,
    "version_focal_x" numeric,
    "version_focal_y" numeric,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "_profile_images_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "solar_systems" (
    "id" serial PRIMARY KEY NOT NULL,
    "owner_id" integer NOT NULL,
    "name" varchar NOT NULL,
    "site_reference" varchar,
    "customer_registration_code" varchar,
    "allocatable_energy_k_wh" numeric DEFAULT 0 NOT NULL,
    "inventory_version" numeric DEFAULT 0 NOT NULL,
    "location_label" varchar,
    "capacity_k_w" numeric,
    "inverter_model" varchar,
    "panel_model" varchar,
    "inverter_serial" varchar,
    "gateway_reference" varchar,
    "integration_adapter" "enum_solar_systems_integration_adapter" DEFAULT 'not-configured',
    "credential_status" "enum_solar_systems_credential_status" DEFAULT 'not-configured',
    "operational_status" "enum_solar_systems_operational_status" DEFAULT 'pending',
    "data_source" "enum_solar_systems_data_source" DEFAULT 'not-configured',
    "last_connected_at" timestamp(3) with time zone,
    "last_telemetry_at" timestamp(3) with time zone,
    "last_telemetry_error_at" timestamp(3) with time zone,
    "telemetry_stale_after_seconds" numeric DEFAULT 900,
    "battery_model" varchar,
    "battery_capacity_k_wh" numeric,
    "battery_health_percent" numeric,
    "battery_serial_number" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "solar_systems_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "_solar_systems_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_owner_id" integer NOT NULL,
    "version_name" varchar NOT NULL,
    "version_site_reference" varchar,
    "version_customer_registration_code" varchar,
    "version_allocatable_energy_k_wh" numeric DEFAULT 0 NOT NULL,
    "version_inventory_version" numeric DEFAULT 0 NOT NULL,
    "version_location_label" varchar,
    "version_capacity_k_w" numeric,
    "version_inverter_model" varchar,
    "version_panel_model" varchar,
    "version_inverter_serial" varchar,
    "version_gateway_reference" varchar,
    "version_integration_adapter" "enum__solar_systems_v_version_integration_adapter" DEFAULT 'not-configured',
    "version_credential_status" "enum__solar_systems_v_version_credential_status" DEFAULT 'not-configured',
    "version_operational_status" "enum__solar_systems_v_version_operational_status" DEFAULT 'pending',
    "version_data_source" "enum__solar_systems_v_version_data_source" DEFAULT 'not-configured',
    "version_last_connected_at" timestamp(3) with time zone,
    "version_last_telemetry_at" timestamp(3) with time zone,
    "version_last_telemetry_error_at" timestamp(3) with time zone,
    "version_telemetry_stale_after_seconds" numeric DEFAULT 900,
    "version_battery_model" varchar,
    "version_battery_capacity_k_wh" numeric,
    "version_battery_health_percent" numeric,
    "version_battery_serial_number" varchar,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "_solar_systems_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "energy_records" (
    "id" serial PRIMARY KEY NOT NULL,
    "owner_id" integer NOT NULL,
    "system_id" integer NOT NULL,
    "kind" "enum_energy_records_kind" NOT NULL,
    "value" numeric NOT NULL,
    "unit" "enum_energy_records_unit" NOT NULL,
    "recorded_at" timestamp(3) with time zone NOT NULL,
    "source" "enum_energy_records_source" DEFAULT 'manual',
    "source_reference" varchar,
    "dedupe_key" varchar,
    "quality" "enum_energy_records_quality" DEFAULT 'unverified',
    "telemetry_status" "enum_energy_records_telemetry_status" DEFAULT 'historical',
    "received_at" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "energy_records_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "_energy_records_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_owner_id" integer NOT NULL,
    "version_system_id" integer NOT NULL,
    "version_kind" "enum__energy_records_v_version_kind" NOT NULL,
    "version_value" numeric NOT NULL,
    "version_unit" "enum__energy_records_v_version_unit" NOT NULL,
    "version_recorded_at" timestamp(3) with time zone NOT NULL,
    "version_source" "enum__energy_records_v_version_source" DEFAULT 'manual',
    "version_source_reference" varchar,
    "version_dedupe_key" varchar,
    "version_quality" "enum__energy_records_v_version_quality" DEFAULT 'unverified',
    "version_telemetry_status" "enum__energy_records_v_version_telemetry_status" DEFAULT 'historical',
    "version_received_at" timestamp(3) with time zone,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "_energy_records_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "sharing_records" (
    "id" serial PRIMARY KEY NOT NULL,
    "owner_id" integer NOT NULL,
    "direction" "enum_sharing_records_direction" NOT NULL,
    "energy_k_wh" numeric NOT NULL,
    "sender_id" integer,
    "recipient_id" integer,
    "source_system_id" integer,
    "counterparty_label" varchar,
    "status" "enum_sharing_records_status" DEFAULT 'proposed' NOT NULL,
    "source" "enum_sharing_records_source" DEFAULT 'coordination' NOT NULL,
    "allocation_reference" varchar,
    "recorded_at" timestamp(3) with time zone NOT NULL,
    "completed_at" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "sharing_records_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "_sharing_records_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_owner_id" integer NOT NULL,
    "version_direction" "enum__sharing_records_v_version_direction" NOT NULL,
    "version_energy_k_wh" numeric NOT NULL,
    "version_sender_id" integer,
    "version_recipient_id" integer,
    "version_source_system_id" integer,
    "version_counterparty_label" varchar,
    "version_status" "enum__sharing_records_v_version_status" DEFAULT 'proposed' NOT NULL,
    "version_source" "enum__sharing_records_v_version_source" DEFAULT 'coordination' NOT NULL,
    "version_allocation_reference" varchar,
    "version_recorded_at" timestamp(3) with time zone NOT NULL,
    "version_completed_at" timestamp(3) with time zone,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "_sharing_records_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "app_notifications" (
    "id" serial PRIMARY KEY NOT NULL,
    "owner_id" integer NOT NULL,
    "type" "enum_app_notifications_type" DEFAULT 'system' NOT NULL,
    "title" varchar NOT NULL,
    "message" varchar NOT NULL,
    "severity" "enum_app_notifications_severity" NOT NULL,
    "read_at" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "app_notifications_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "_app_notifications_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_owner_id" integer NOT NULL,
    "version_type" "enum__app_notifications_v_version_type" DEFAULT 'system' NOT NULL,
    "version_title" varchar NOT NULL,
    "version_message" varchar NOT NULL,
    "version_severity" "enum__app_notifications_v_version_severity" NOT NULL,
    "version_read_at" timestamp(3) with time zone,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "_app_notifications_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "system_alerts" (
    "id" serial PRIMARY KEY NOT NULL,
    "owner_id" integer NOT NULL,
    "system_id" integer NOT NULL,
    "severity" "enum_system_alerts_severity" NOT NULL,
    "category" "enum_system_alerts_category" NOT NULL,
    "description" varchar NOT NULL,
    "status" "enum_system_alerts_status" DEFAULT 'open' NOT NULL,
    "source" "enum_system_alerts_source" DEFAULT 'system' NOT NULL,
    "source_reference" varchar,
    "detected_at" timestamp(3) with time zone NOT NULL,
    "acknowledged_at" timestamp(3) with time zone,
    "resolved_at" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "system_alerts_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "_system_alerts_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_owner_id" integer NOT NULL,
    "version_system_id" integer NOT NULL,
    "version_severity" "enum__system_alerts_v_version_severity" NOT NULL,
    "version_category" "enum__system_alerts_v_version_category" NOT NULL,
    "version_description" varchar NOT NULL,
    "version_status" "enum__system_alerts_v_version_status" DEFAULT 'open' NOT NULL,
    "version_source" "enum__system_alerts_v_version_source" DEFAULT 'system' NOT NULL,
    "version_source_reference" varchar,
    "version_detected_at" timestamp(3) with time zone NOT NULL,
    "version_acknowledged_at" timestamp(3) with time zone,
    "version_resolved_at" timestamp(3) with time zone,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "_system_alerts_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "telemetry_ingestion_events" (
    "id" serial PRIMARY KEY NOT NULL,
    "owner_id" integer,
    "system_id" integer,
    "adapter" varchar NOT NULL,
    "event_reference_hash" varchar,
    "status" "enum_telemetry_ingestion_events_status" NOT NULL,
    "accepted_count" numeric NOT NULL,
    "duplicate_count" numeric NOT NULL,
    "rejected_count" numeric NOT NULL,
    "error_code" varchar,
    "error_message" varchar,
    "received_at" timestamp(3) with time zone NOT NULL,
    "measurement_timestamp" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "telemetry_ingestion_events_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "_telemetry_ingestion_events_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_owner_id" integer,
    "version_system_id" integer,
    "version_adapter" varchar NOT NULL,
    "version_event_reference_hash" varchar,
    "version_status" "enum__telemetry_ingestion_events_v_version_status" NOT NULL,
    "version_accepted_count" numeric NOT NULL,
    "version_duplicate_count" numeric NOT NULL,
    "version_rejected_count" numeric NOT NULL,
    "version_error_code" varchar,
    "version_error_message" varchar,
    "version_received_at" timestamp(3) with time zone NOT NULL,
    "version_measurement_timestamp" timestamp(3) with time zone,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "_telemetry_ingestion_events_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "solar_owner_applications" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" integer NOT NULL,
    "applicant_name" varchar NOT NULL,
    "applicant_email" varchar NOT NULL,
    "applicant_phone" varchar NOT NULL,
    "business_name" varchar,
    "installation_address" varchar NOT NULL,
    "state" varchar NOT NULL,
    "city" varchar NOT NULL,
    "installation_capacity_k_w" numeric NOT NULL,
    "battery_capacity_k_wh" numeric,
    "installation_details" varchar NOT NULL,
    "status" "enum_solar_owner_applications_status" DEFAULT 'pending' NOT NULL,
    "review_notes" varchar,
    "reviewed_at" timestamp(3) with time zone,
    "reviewed_by_id" integer,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "solar_owner_applications_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "solar_owner_profiles" (
    "id" serial PRIMARY KEY NOT NULL,
    "solar_owner_id" integer NOT NULL,
    "display_name" varchar NOT NULL,
    "public_description" varchar,
    "status" "enum_solar_owner_profiles_status" DEFAULT 'active' NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "solar_owner_profiles_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "_solar_owner_profiles_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_solar_owner_id" integer NOT NULL,
    "version_display_name" varchar NOT NULL,
    "version_public_description" varchar,
    "version_status" "enum__solar_owner_profiles_v_version_status" DEFAULT 'active' NOT NULL,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "_solar_owner_profiles_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "customer_profiles" (
    "id" serial PRIMARY KEY NOT NULL,
    "customer_id" integer NOT NULL,
    "display_name" varchar NOT NULL,
    "status" "enum_customer_profiles_status" DEFAULT 'active' NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "customer_profiles_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "_customer_profiles_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_customer_id" integer NOT NULL,
    "version_display_name" varchar NOT NULL,
    "version_status" "enum__customer_profiles_v_version_status" DEFAULT 'active' NOT NULL,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "_customer_profiles_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "customer_relationships" (
    "id" serial PRIMARY KEY NOT NULL,
    "solar_owner_id" integer NOT NULL,
    "customer_id" integer NOT NULL,
    "system_id" integer NOT NULL,
    "status" "enum_customer_relationships_status" DEFAULT 'pending' NOT NULL,
    "requested_at" timestamp(3) with time zone NOT NULL,
    "reviewed_at" timestamp(3) with time zone,
    "rejection_reason" varchar,
    "relationship_key" varchar NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "customer_relationships_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "_customer_relationships_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_solar_owner_id" integer NOT NULL,
    "version_customer_id" integer NOT NULL,
    "version_system_id" integer NOT NULL,
    "version_status" "enum__customer_relationships_v_version_status" DEFAULT 'pending' NOT NULL,
    "version_requested_at" timestamp(3) with time zone NOT NULL,
    "version_reviewed_at" timestamp(3) with time zone,
    "version_rejection_reason" varchar,
    "version_relationship_key" varchar NOT NULL,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "_customer_relationships_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "energy_tariffs" (
    "id" serial PRIMARY KEY NOT NULL,
    "solar_owner_id" integer NOT NULL,
    "system_id" integer NOT NULL,
    "naira_per_k_wh" numeric DEFAULT 100 NOT NULL,
    "active_from" timestamp(3) with time zone NOT NULL,
    "active_to" timestamp(3) with time zone,
    "status" "enum_energy_tariffs_status" DEFAULT 'active' NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "energy_tariffs_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "_energy_tariffs_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_solar_owner_id" integer NOT NULL,
    "version_system_id" integer NOT NULL,
    "version_naira_per_k_wh" numeric DEFAULT 100 NOT NULL,
    "version_active_from" timestamp(3) with time zone NOT NULL,
    "version_active_to" timestamp(3) with time zone,
    "version_status" "enum__energy_tariffs_v_version_status" DEFAULT 'active' NOT NULL,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "_energy_tariffs_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "energy_purchase_packages" (
    "id" serial PRIMARY KEY NOT NULL,
    "solar_owner_id" integer NOT NULL,
    "system_id" integer NOT NULL,
    "name" varchar NOT NULL,
    "description" varchar,
    "amount_kobo" numeric NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "display_order" numeric DEFAULT 0 NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "energy_purchase_packages_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "_energy_purchase_packages_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_solar_owner_id" integer NOT NULL,
    "version_system_id" integer NOT NULL,
    "version_name" varchar NOT NULL,
    "version_description" varchar,
    "version_amount_kobo" numeric NOT NULL,
    "version_active" boolean DEFAULT true NOT NULL,
    "version_display_order" numeric DEFAULT 0 NOT NULL,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "_energy_purchase_packages_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "payment_transactions" (
    "id" serial PRIMARY KEY NOT NULL,
    "customer_id" integer NOT NULL,
    "solar_owner_id" integer NOT NULL,
    "relationship_id" integer NOT NULL,
    "system_id" integer NOT NULL,
    "purchase_package_id" integer,
    "provider" "enum_payment_transactions_provider" DEFAULT 'paystack' NOT NULL,
    "reference" varchar NOT NULL,
    "provider_reference" varchar,
    "amount_kobo" numeric NOT NULL,
    "currency" "enum_payment_transactions_currency" DEFAULT 'NGN' NOT NULL,
    "tariff_naira_per_k_wh" numeric NOT NULL,
    "energy_k_wh" numeric NOT NULL,
    "status" "enum_payment_transactions_status" DEFAULT 'initiated' NOT NULL,
    "initiated_at" timestamp(3) with time zone NOT NULL,
    "provider_status" varchar,
    "provider_message" varchar,
    "provider_channel" varchar,
    "provider_paid_at" timestamp(3) with time zone,
    "last_verified_at" timestamp(3) with time zone,
    "verified_at" timestamp(3) with time zone,
    "paid_at" timestamp(3) with time zone,
    "reversed_at" timestamp(3) with time zone,
    "failure_code" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payment_transactions_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "_payment_transactions_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_customer_id" integer NOT NULL,
    "version_solar_owner_id" integer NOT NULL,
    "version_relationship_id" integer NOT NULL,
    "version_system_id" integer NOT NULL,
    "version_purchase_package_id" integer,
    "version_provider" "enum__payment_transactions_v_version_provider" DEFAULT 'paystack' NOT NULL,
    "version_reference" varchar NOT NULL,
    "version_provider_reference" varchar,
    "version_amount_kobo" numeric NOT NULL,
    "version_currency" "enum__payment_transactions_v_version_currency" DEFAULT 'NGN' NOT NULL,
    "version_tariff_naira_per_k_wh" numeric NOT NULL,
    "version_energy_k_wh" numeric NOT NULL,
    "version_status" "enum__payment_transactions_v_version_status" DEFAULT 'initiated' NOT NULL,
    "version_initiated_at" timestamp(3) with time zone NOT NULL,
    "version_provider_status" varchar,
    "version_provider_message" varchar,
    "version_provider_channel" varchar,
    "version_provider_paid_at" timestamp(3) with time zone,
    "version_last_verified_at" timestamp(3) with time zone,
    "version_verified_at" timestamp(3) with time zone,
    "version_paid_at" timestamp(3) with time zone,
    "version_reversed_at" timestamp(3) with time zone,
    "version_failure_code" varchar,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "_payment_transactions_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "energy_allocation_requests" (
    "id" serial PRIMARY KEY NOT NULL,
    "payment_id" integer NOT NULL,
    "customer_id" integer NOT NULL,
    "solar_owner_id" integer NOT NULL,
    "relationship_id" integer NOT NULL,
    "system_id" integer NOT NULL,
    "requested_k_wh" numeric NOT NULL,
    "status" "enum_energy_allocation_requests_status" DEFAULT 'pending' NOT NULL,
    "requested_at" timestamp(3) with time zone NOT NULL,
    "reviewed_at" timestamp(3) with time zone,
    "rejection_reason" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "energy_allocation_requests_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "_energy_allocation_requests_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_payment_id" integer NOT NULL,
    "version_customer_id" integer NOT NULL,
    "version_solar_owner_id" integer NOT NULL,
    "version_relationship_id" integer NOT NULL,
    "version_system_id" integer NOT NULL,
    "version_requested_k_wh" numeric NOT NULL,
    "version_status" "enum__energy_allocation_requests_v_version_status" DEFAULT 'pending' NOT NULL,
    "version_requested_at" timestamp(3) with time zone NOT NULL,
    "version_reviewed_at" timestamp(3) with time zone,
    "version_rejection_reason" varchar,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "_energy_allocation_requests_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "energy_allocation_records" (
    "id" serial PRIMARY KEY NOT NULL,
    "request_id" integer NOT NULL,
    "payment_id" integer NOT NULL,
    "customer_id" integer NOT NULL,
    "solar_owner_id" integer NOT NULL,
    "system_id" integer NOT NULL,
    "energy_k_wh" numeric NOT NULL,
    "reference" varchar NOT NULL,
    "approved_at" timestamp(3) with time zone NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "energy_allocation_records_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "_energy_allocation_records_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_request_id" integer NOT NULL,
    "version_payment_id" integer NOT NULL,
    "version_customer_id" integer NOT NULL,
    "version_solar_owner_id" integer NOT NULL,
    "version_system_id" integer NOT NULL,
    "version_energy_k_wh" numeric NOT NULL,
    "version_reference" varchar NOT NULL,
    "version_approved_at" timestamp(3) with time zone NOT NULL,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "_energy_allocation_records_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "energy_wallets" (
    "id" serial PRIMARY KEY NOT NULL,
    "customer_id" integer NOT NULL,
    "solar_owner_id" integer NOT NULL,
    "relationship_id" integer NOT NULL,
    "system_id" integer NOT NULL,
    "balance_k_wh" numeric DEFAULT 0 NOT NULL,
    "total_allocated_k_wh" numeric DEFAULT 0 NOT NULL,
    "total_consumed_k_wh" numeric DEFAULT 0 NOT NULL,
    "low_balance_threshold_k_wh" numeric DEFAULT 5 NOT NULL,
    "version" numeric DEFAULT 0 NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "energy_wallets_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "_energy_wallets_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_customer_id" integer NOT NULL,
    "version_solar_owner_id" integer NOT NULL,
    "version_relationship_id" integer NOT NULL,
    "version_system_id" integer NOT NULL,
    "version_balance_k_wh" numeric DEFAULT 0 NOT NULL,
    "version_total_allocated_k_wh" numeric DEFAULT 0 NOT NULL,
    "version_total_consumed_k_wh" numeric DEFAULT 0 NOT NULL,
    "version_low_balance_threshold_k_wh" numeric DEFAULT 5 NOT NULL,
    "version_version" numeric DEFAULT 0 NOT NULL,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "_energy_wallets_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "energy_ledger_entries" (
    "id" serial PRIMARY KEY NOT NULL,
    "customer_id" integer,
    "solar_owner_id" integer NOT NULL,
    "system_id" integer NOT NULL,
    "wallet_id" integer,
    "account_type" "enum_energy_ledger_entries_account_type" NOT NULL,
    "direction" "enum_energy_ledger_entries_direction" NOT NULL,
    "energy_k_wh" numeric NOT NULL,
    "balance_after_k_wh" numeric NOT NULL,
    "allocation_id" integer,
    "consumption_id" integer,
    "idempotency_key" varchar NOT NULL,
    "recorded_at" timestamp(3) with time zone NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "energy_ledger_entries_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "_energy_ledger_entries_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_customer_id" integer,
    "version_solar_owner_id" integer NOT NULL,
    "version_system_id" integer NOT NULL,
    "version_wallet_id" integer,
    "version_account_type" "enum__energy_ledger_entries_v_version_account_type" NOT NULL,
    "version_direction" "enum__energy_ledger_entries_v_version_direction" NOT NULL,
    "version_energy_k_wh" numeric NOT NULL,
    "version_balance_after_k_wh" numeric NOT NULL,
    "version_allocation_id" integer,
    "version_consumption_id" integer,
    "version_idempotency_key" varchar NOT NULL,
    "version_recorded_at" timestamp(3) with time zone NOT NULL,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "_energy_ledger_entries_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "meter_registrations" (
    "id" serial PRIMARY KEY NOT NULL,
    "customer_id" integer NOT NULL,
    "solar_owner_id" integer NOT NULL,
    "relationship_id" integer NOT NULL,
    "system_id" integer NOT NULL,
    "meter_identifier" varchar NOT NULL,
    "status" "enum_meter_registrations_status" DEFAULT 'pending' NOT NULL,
    "source" "enum_meter_registrations_source" DEFAULT 'not-configured' NOT NULL,
    "last_cumulative_k_wh" numeric,
    "last_reading_at" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "meter_registrations_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "_meter_registrations_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_customer_id" integer NOT NULL,
    "version_solar_owner_id" integer NOT NULL,
    "version_relationship_id" integer NOT NULL,
    "version_system_id" integer NOT NULL,
    "version_meter_identifier" varchar NOT NULL,
    "version_status" "enum__meter_registrations_v_version_status" DEFAULT 'pending' NOT NULL,
    "version_source" "enum__meter_registrations_v_version_source" DEFAULT 'not-configured' NOT NULL,
    "version_last_cumulative_k_wh" numeric,
    "version_last_reading_at" timestamp(3) with time zone,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "_meter_registrations_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "meter_readings" (
    "id" serial PRIMARY KEY NOT NULL,
    "meter_id" integer NOT NULL,
    "customer_id" integer NOT NULL,
    "solar_owner_id" integer NOT NULL,
    "system_id" integer NOT NULL,
    "cumulative_k_wh" numeric NOT NULL,
    "measured_at" timestamp(3) with time zone NOT NULL,
    "source" "enum_meter_readings_source" NOT NULL,
    "quality" "enum_meter_readings_quality" NOT NULL,
    "dedupe_key" varchar NOT NULL,
    "status" "enum_meter_readings_status" NOT NULL,
    "consumption_k_wh" numeric,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "meter_readings_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "_meter_readings_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_meter_id" integer NOT NULL,
    "version_customer_id" integer NOT NULL,
    "version_solar_owner_id" integer NOT NULL,
    "version_system_id" integer NOT NULL,
    "version_cumulative_k_wh" numeric NOT NULL,
    "version_measured_at" timestamp(3) with time zone NOT NULL,
    "version_source" "enum__meter_readings_v_version_source" NOT NULL,
    "version_quality" "enum__meter_readings_v_version_quality" NOT NULL,
    "version_dedupe_key" varchar NOT NULL,
    "version_status" "enum__meter_readings_v_version_status" NOT NULL,
    "version_consumption_k_wh" numeric,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "_meter_readings_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "consumption_records" (
    "id" serial PRIMARY KEY NOT NULL,
    "customer_id" integer NOT NULL,
    "solar_owner_id" integer NOT NULL,
    "system_id" integer NOT NULL,
    "wallet_id" integer NOT NULL,
    "meter_id" integer NOT NULL,
    "reading_id" integer NOT NULL,
    "energy_k_wh" numeric NOT NULL,
    "status" "enum_consumption_records_status" NOT NULL,
    "recorded_at" timestamp(3) with time zone NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "consumption_records_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "_consumption_records_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_customer_id" integer NOT NULL,
    "version_solar_owner_id" integer NOT NULL,
    "version_system_id" integer NOT NULL,
    "version_wallet_id" integer NOT NULL,
    "version_meter_id" integer NOT NULL,
    "version_reading_id" integer NOT NULL,
    "version_energy_k_wh" numeric NOT NULL,
    "version_status" "enum__consumption_records_v_version_status" NOT NULL,
    "version_recorded_at" timestamp(3) with time zone NOT NULL,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "_consumption_records_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "media" (
    "id" serial PRIMARY KEY NOT NULL,
    "alt" varchar NOT NULL,
    "_h_folders_id" integer,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "url" varchar,
    "thumbnail_u_r_l" varchar,
    "filename" varchar,
    "mime_type" varchar,
    "filesize" numeric,
    "width" numeric,
    "height" numeric,
    "original_filename" varchar,
    "original_url" varchar,
    "original_mime_type" varchar,
    "original_filesize" numeric,
    "original_width" numeric,
    "original_height" numeric,
    "original_prefix" varchar,
    "original__objectkey" varchar,
    "focal_x" numeric,
    "focal_y" numeric
  );

  CREATE TABLE "media_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "tags_id" integer,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "_media_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_alt" varchar NOT NULL,
    "version__h_folders_id" integer,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version_url" varchar,
    "version_thumbnail_u_r_l" varchar,
    "version_filename" varchar,
    "version_mime_type" varchar,
    "version_filesize" numeric,
    "version_width" numeric,
    "version_height" numeric,
    "version_original_filename" varchar,
    "version_original_url" varchar,
    "version_original_mime_type" varchar,
    "version_original_filesize" numeric,
    "version_original_width" numeric,
    "version_original_height" numeric,
    "version_original_prefix" varchar,
    "version_original__objectkey" varchar,
    "version_focal_x" numeric,
    "version_focal_y" numeric,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "_media_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "tags_id" integer,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "folders" (
    "id" serial PRIMARY KEY NOT NULL,
    "_h_folders_id" integer,
    "name" varchar NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "folders_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "_folders_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version__h_folders_id" integer,
    "version_name" varchar NOT NULL,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "_folders_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "tags" (
    "id" serial PRIMARY KEY NOT NULL,
    "_h_tags_id" integer,
    "name" varchar NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "tags_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "_tags_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version__h_tags_id" integer,
    "version_name" varchar NOT NULL,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "_tags_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "payload_kv" (
    "id" serial PRIMARY KEY NOT NULL,
    "key" varchar NOT NULL,
    "data" jsonb NOT NULL
  );

  CREATE TABLE "payload_locked_documents" (
    "id" serial PRIMARY KEY NOT NULL,
    "global_slug" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_locked_documents_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer,
    "profile_images_id" integer,
    "solar_systems_id" integer,
    "energy_records_id" integer,
    "sharing_records_id" integer,
    "app_notifications_id" integer,
    "system_alerts_id" integer,
    "telemetry_ingestion_events_id" integer,
    "solar_owner_applications_id" integer,
    "solar_owner_profiles_id" integer,
    "customer_profiles_id" integer,
    "customer_relationships_id" integer,
    "energy_tariffs_id" integer,
    "energy_purchase_packages_id" integer,
    "payment_transactions_id" integer,
    "energy_allocation_requests_id" integer,
    "energy_allocation_records_id" integer,
    "energy_wallets_id" integer,
    "energy_ledger_entries_id" integer,
    "meter_registrations_id" integer,
    "meter_readings_id" integer,
    "consumption_records_id" integer,
    "media_id" integer,
    "folders_id" integer,
    "tags_id" integer
  );

  CREATE TABLE "payload_preferences" (
    "id" serial PRIMARY KEY NOT NULL,
    "key" varchar,
    "value" jsonb,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_preferences_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  CREATE TABLE "payload_migrations" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar,
    "batch" numeric,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_llm_instructions" (
    "id" varchar PRIMARY KEY NOT NULL,
    "entity_slug" varchar NOT NULL,
    "entity_type" "enum_payload_llm_instructions_entity_type" NOT NULL,
    "additional_instructions" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_llm_instructions_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" varchar NOT NULL,
    "path" varchar NOT NULL,
    "admins_id" integer,
    "users_id" integer
  );

  ALTER TABLE "admins_sessions" ADD CONSTRAINT "admins_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "admins_rels" ADD CONSTRAINT "admins_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "admins_rels" ADD CONSTRAINT "admins_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "admins_rels" ADD CONSTRAINT "admins_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_avatar_id_profile_images_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."profile_images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_images" ADD CONSTRAINT "profile_images_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "profile_images_rels" ADD CONSTRAINT "profile_images_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."profile_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_images_rels" ADD CONSTRAINT "profile_images_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_images_rels" ADD CONSTRAINT "profile_images_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_profile_images_v" ADD CONSTRAINT "_profile_images_v_parent_id_profile_images_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."profile_images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_profile_images_v" ADD CONSTRAINT "_profile_images_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_profile_images_v_rels" ADD CONSTRAINT "_profile_images_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_profile_images_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_profile_images_v_rels" ADD CONSTRAINT "_profile_images_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_profile_images_v_rels" ADD CONSTRAINT "_profile_images_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solar_systems" ADD CONSTRAINT "solar_systems_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solar_systems_rels" ADD CONSTRAINT "solar_systems_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."solar_systems"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solar_systems_rels" ADD CONSTRAINT "solar_systems_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solar_systems_rels" ADD CONSTRAINT "solar_systems_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solar_systems_v" ADD CONSTRAINT "_solar_systems_v_parent_id_solar_systems_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_solar_systems_v" ADD CONSTRAINT "_solar_systems_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_solar_systems_v_rels" ADD CONSTRAINT "_solar_systems_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_solar_systems_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solar_systems_v_rels" ADD CONSTRAINT "_solar_systems_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solar_systems_v_rels" ADD CONSTRAINT "_solar_systems_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "energy_records" ADD CONSTRAINT "energy_records_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "energy_records" ADD CONSTRAINT "energy_records_system_id_solar_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "energy_records_rels" ADD CONSTRAINT "energy_records_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."energy_records"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "energy_records_rels" ADD CONSTRAINT "energy_records_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "energy_records_rels" ADD CONSTRAINT "energy_records_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_energy_records_v" ADD CONSTRAINT "_energy_records_v_parent_id_energy_records_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."energy_records"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_records_v" ADD CONSTRAINT "_energy_records_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_records_v" ADD CONSTRAINT "_energy_records_v_version_system_id_solar_systems_id_fk" FOREIGN KEY ("version_system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_records_v_rels" ADD CONSTRAINT "_energy_records_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_energy_records_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_energy_records_v_rels" ADD CONSTRAINT "_energy_records_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_energy_records_v_rels" ADD CONSTRAINT "_energy_records_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sharing_records" ADD CONSTRAINT "sharing_records_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sharing_records" ADD CONSTRAINT "sharing_records_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sharing_records" ADD CONSTRAINT "sharing_records_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sharing_records" ADD CONSTRAINT "sharing_records_source_system_id_solar_systems_id_fk" FOREIGN KEY ("source_system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sharing_records_rels" ADD CONSTRAINT "sharing_records_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sharing_records"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sharing_records_rels" ADD CONSTRAINT "sharing_records_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sharing_records_rels" ADD CONSTRAINT "sharing_records_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sharing_records_v" ADD CONSTRAINT "_sharing_records_v_parent_id_sharing_records_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sharing_records"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sharing_records_v" ADD CONSTRAINT "_sharing_records_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sharing_records_v" ADD CONSTRAINT "_sharing_records_v_version_sender_id_users_id_fk" FOREIGN KEY ("version_sender_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sharing_records_v" ADD CONSTRAINT "_sharing_records_v_version_recipient_id_users_id_fk" FOREIGN KEY ("version_recipient_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sharing_records_v" ADD CONSTRAINT "_sharing_records_v_version_source_system_id_solar_systems_id_fk" FOREIGN KEY ("version_source_system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sharing_records_v_rels" ADD CONSTRAINT "_sharing_records_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_sharing_records_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sharing_records_v_rels" ADD CONSTRAINT "_sharing_records_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sharing_records_v_rels" ADD CONSTRAINT "_sharing_records_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "app_notifications" ADD CONSTRAINT "app_notifications_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "app_notifications_rels" ADD CONSTRAINT "app_notifications_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."app_notifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "app_notifications_rels" ADD CONSTRAINT "app_notifications_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "app_notifications_rels" ADD CONSTRAINT "app_notifications_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_app_notifications_v" ADD CONSTRAINT "_app_notifications_v_parent_id_app_notifications_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."app_notifications"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_app_notifications_v" ADD CONSTRAINT "_app_notifications_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_app_notifications_v_rels" ADD CONSTRAINT "_app_notifications_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_app_notifications_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_app_notifications_v_rels" ADD CONSTRAINT "_app_notifications_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_app_notifications_v_rels" ADD CONSTRAINT "_app_notifications_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "system_alerts" ADD CONSTRAINT "system_alerts_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "system_alerts" ADD CONSTRAINT "system_alerts_system_id_solar_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "system_alerts_rels" ADD CONSTRAINT "system_alerts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."system_alerts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "system_alerts_rels" ADD CONSTRAINT "system_alerts_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "system_alerts_rels" ADD CONSTRAINT "system_alerts_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_system_alerts_v" ADD CONSTRAINT "_system_alerts_v_parent_id_system_alerts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."system_alerts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_system_alerts_v" ADD CONSTRAINT "_system_alerts_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_system_alerts_v" ADD CONSTRAINT "_system_alerts_v_version_system_id_solar_systems_id_fk" FOREIGN KEY ("version_system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_system_alerts_v_rels" ADD CONSTRAINT "_system_alerts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_system_alerts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_system_alerts_v_rels" ADD CONSTRAINT "_system_alerts_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_system_alerts_v_rels" ADD CONSTRAINT "_system_alerts_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "telemetry_ingestion_events" ADD CONSTRAINT "telemetry_ingestion_events_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "telemetry_ingestion_events" ADD CONSTRAINT "telemetry_ingestion_events_system_id_solar_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "telemetry_ingestion_events_rels" ADD CONSTRAINT "telemetry_ingestion_events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."telemetry_ingestion_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "telemetry_ingestion_events_rels" ADD CONSTRAINT "telemetry_ingestion_events_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "telemetry_ingestion_events_rels" ADD CONSTRAINT "telemetry_ingestion_events_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_telemetry_ingestion_events_v" ADD CONSTRAINT "_telemetry_ingestion_events_v_parent_id_telemetry_ingestion_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."telemetry_ingestion_events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_telemetry_ingestion_events_v" ADD CONSTRAINT "_telemetry_ingestion_events_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_telemetry_ingestion_events_v" ADD CONSTRAINT "_telemetry_ingestion_events_v_version_system_id_solar_systems_id_fk" FOREIGN KEY ("version_system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_telemetry_ingestion_events_v_rels" ADD CONSTRAINT "_telemetry_ingestion_events_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_telemetry_ingestion_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_telemetry_ingestion_events_v_rels" ADD CONSTRAINT "_telemetry_ingestion_events_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_telemetry_ingestion_events_v_rels" ADD CONSTRAINT "_telemetry_ingestion_events_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solar_owner_applications" ADD CONSTRAINT "solar_owner_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solar_owner_applications" ADD CONSTRAINT "solar_owner_applications_reviewed_by_id_admins_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solar_owner_applications_rels" ADD CONSTRAINT "solar_owner_applications_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."solar_owner_applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solar_owner_applications_rels" ADD CONSTRAINT "solar_owner_applications_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solar_owner_applications_rels" ADD CONSTRAINT "solar_owner_applications_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solar_owner_profiles" ADD CONSTRAINT "solar_owner_profiles_solar_owner_id_users_id_fk" FOREIGN KEY ("solar_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solar_owner_profiles_rels" ADD CONSTRAINT "solar_owner_profiles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."solar_owner_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solar_owner_profiles_rels" ADD CONSTRAINT "solar_owner_profiles_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solar_owner_profiles_rels" ADD CONSTRAINT "solar_owner_profiles_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solar_owner_profiles_v" ADD CONSTRAINT "_solar_owner_profiles_v_parent_id_solar_owner_profiles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."solar_owner_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_solar_owner_profiles_v" ADD CONSTRAINT "_solar_owner_profiles_v_version_solar_owner_id_users_id_fk" FOREIGN KEY ("version_solar_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_solar_owner_profiles_v_rels" ADD CONSTRAINT "_solar_owner_profiles_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_solar_owner_profiles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solar_owner_profiles_v_rels" ADD CONSTRAINT "_solar_owner_profiles_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solar_owner_profiles_v_rels" ADD CONSTRAINT "_solar_owner_profiles_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "customer_profiles_rels" ADD CONSTRAINT "customer_profiles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."customer_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "customer_profiles_rels" ADD CONSTRAINT "customer_profiles_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "customer_profiles_rels" ADD CONSTRAINT "customer_profiles_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_customer_profiles_v" ADD CONSTRAINT "_customer_profiles_v_parent_id_customer_profiles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."customer_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_customer_profiles_v" ADD CONSTRAINT "_customer_profiles_v_version_customer_id_users_id_fk" FOREIGN KEY ("version_customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_customer_profiles_v_rels" ADD CONSTRAINT "_customer_profiles_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_customer_profiles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_customer_profiles_v_rels" ADD CONSTRAINT "_customer_profiles_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_customer_profiles_v_rels" ADD CONSTRAINT "_customer_profiles_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "customer_relationships" ADD CONSTRAINT "customer_relationships_solar_owner_id_users_id_fk" FOREIGN KEY ("solar_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "customer_relationships" ADD CONSTRAINT "customer_relationships_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "customer_relationships" ADD CONSTRAINT "customer_relationships_system_id_solar_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "customer_relationships_rels" ADD CONSTRAINT "customer_relationships_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."customer_relationships"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "customer_relationships_rels" ADD CONSTRAINT "customer_relationships_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "customer_relationships_rels" ADD CONSTRAINT "customer_relationships_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_customer_relationships_v" ADD CONSTRAINT "_customer_relationships_v_parent_id_customer_relationships_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."customer_relationships"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_customer_relationships_v" ADD CONSTRAINT "_customer_relationships_v_version_solar_owner_id_users_id_fk" FOREIGN KEY ("version_solar_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_customer_relationships_v" ADD CONSTRAINT "_customer_relationships_v_version_customer_id_users_id_fk" FOREIGN KEY ("version_customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_customer_relationships_v" ADD CONSTRAINT "_customer_relationships_v_version_system_id_solar_systems_id_fk" FOREIGN KEY ("version_system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_customer_relationships_v_rels" ADD CONSTRAINT "_customer_relationships_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_customer_relationships_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_customer_relationships_v_rels" ADD CONSTRAINT "_customer_relationships_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_customer_relationships_v_rels" ADD CONSTRAINT "_customer_relationships_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "energy_tariffs" ADD CONSTRAINT "energy_tariffs_solar_owner_id_users_id_fk" FOREIGN KEY ("solar_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "energy_tariffs" ADD CONSTRAINT "energy_tariffs_system_id_solar_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "energy_tariffs_rels" ADD CONSTRAINT "energy_tariffs_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."energy_tariffs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "energy_tariffs_rels" ADD CONSTRAINT "energy_tariffs_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "energy_tariffs_rels" ADD CONSTRAINT "energy_tariffs_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_energy_tariffs_v" ADD CONSTRAINT "_energy_tariffs_v_parent_id_energy_tariffs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."energy_tariffs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_tariffs_v" ADD CONSTRAINT "_energy_tariffs_v_version_solar_owner_id_users_id_fk" FOREIGN KEY ("version_solar_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_tariffs_v" ADD CONSTRAINT "_energy_tariffs_v_version_system_id_solar_systems_id_fk" FOREIGN KEY ("version_system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_tariffs_v_rels" ADD CONSTRAINT "_energy_tariffs_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_energy_tariffs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_energy_tariffs_v_rels" ADD CONSTRAINT "_energy_tariffs_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_energy_tariffs_v_rels" ADD CONSTRAINT "_energy_tariffs_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "energy_purchase_packages" ADD CONSTRAINT "energy_purchase_packages_solar_owner_id_users_id_fk" FOREIGN KEY ("solar_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "energy_purchase_packages" ADD CONSTRAINT "energy_purchase_packages_system_id_solar_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "energy_purchase_packages_rels" ADD CONSTRAINT "energy_purchase_packages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."energy_purchase_packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "energy_purchase_packages_rels" ADD CONSTRAINT "energy_purchase_packages_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "energy_purchase_packages_rels" ADD CONSTRAINT "energy_purchase_packages_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_energy_purchase_packages_v" ADD CONSTRAINT "_energy_purchase_packages_v_parent_id_energy_purchase_packages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."energy_purchase_packages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_purchase_packages_v" ADD CONSTRAINT "_energy_purchase_packages_v_version_solar_owner_id_users_id_fk" FOREIGN KEY ("version_solar_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_purchase_packages_v" ADD CONSTRAINT "_energy_purchase_packages_v_version_system_id_solar_systems_id_fk" FOREIGN KEY ("version_system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_purchase_packages_v_rels" ADD CONSTRAINT "_energy_purchase_packages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_energy_purchase_packages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_energy_purchase_packages_v_rels" ADD CONSTRAINT "_energy_purchase_packages_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_energy_purchase_packages_v_rels" ADD CONSTRAINT "_energy_purchase_packages_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_solar_owner_id_users_id_fk" FOREIGN KEY ("solar_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_relationship_id_customer_relationships_id_fk" FOREIGN KEY ("relationship_id") REFERENCES "public"."customer_relationships"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_system_id_solar_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_purchase_package_id_energy_purchase_packages_id_fk" FOREIGN KEY ("purchase_package_id") REFERENCES "public"."energy_purchase_packages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payment_transactions_rels" ADD CONSTRAINT "payment_transactions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payment_transactions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payment_transactions_rels" ADD CONSTRAINT "payment_transactions_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payment_transactions_rels" ADD CONSTRAINT "payment_transactions_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_payment_transactions_v" ADD CONSTRAINT "_payment_transactions_v_parent_id_payment_transactions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payment_transactions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_payment_transactions_v" ADD CONSTRAINT "_payment_transactions_v_version_customer_id_users_id_fk" FOREIGN KEY ("version_customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_payment_transactions_v" ADD CONSTRAINT "_payment_transactions_v_version_solar_owner_id_users_id_fk" FOREIGN KEY ("version_solar_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_payment_transactions_v" ADD CONSTRAINT "_payment_transactions_v_version_relationship_id_customer_relationships_id_fk" FOREIGN KEY ("version_relationship_id") REFERENCES "public"."customer_relationships"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_payment_transactions_v" ADD CONSTRAINT "_payment_transactions_v_version_system_id_solar_systems_id_fk" FOREIGN KEY ("version_system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_payment_transactions_v" ADD CONSTRAINT "_payment_transactions_v_version_purchase_package_id_energy_purchase_packages_id_fk" FOREIGN KEY ("version_purchase_package_id") REFERENCES "public"."energy_purchase_packages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_payment_transactions_v_rels" ADD CONSTRAINT "_payment_transactions_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_payment_transactions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_payment_transactions_v_rels" ADD CONSTRAINT "_payment_transactions_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_payment_transactions_v_rels" ADD CONSTRAINT "_payment_transactions_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "energy_allocation_requests" ADD CONSTRAINT "energy_allocation_requests_payment_id_payment_transactions_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payment_transactions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "energy_allocation_requests" ADD CONSTRAINT "energy_allocation_requests_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "energy_allocation_requests" ADD CONSTRAINT "energy_allocation_requests_solar_owner_id_users_id_fk" FOREIGN KEY ("solar_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "energy_allocation_requests" ADD CONSTRAINT "energy_allocation_requests_relationship_id_customer_relationships_id_fk" FOREIGN KEY ("relationship_id") REFERENCES "public"."customer_relationships"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "energy_allocation_requests" ADD CONSTRAINT "energy_allocation_requests_system_id_solar_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "energy_allocation_requests_rels" ADD CONSTRAINT "energy_allocation_requests_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."energy_allocation_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "energy_allocation_requests_rels" ADD CONSTRAINT "energy_allocation_requests_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "energy_allocation_requests_rels" ADD CONSTRAINT "energy_allocation_requests_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_energy_allocation_requests_v" ADD CONSTRAINT "_energy_allocation_requests_v_parent_id_energy_allocation_requests_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."energy_allocation_requests"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_allocation_requests_v" ADD CONSTRAINT "_energy_allocation_requests_v_version_payment_id_payment_transactions_id_fk" FOREIGN KEY ("version_payment_id") REFERENCES "public"."payment_transactions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_allocation_requests_v" ADD CONSTRAINT "_energy_allocation_requests_v_version_customer_id_users_id_fk" FOREIGN KEY ("version_customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_allocation_requests_v" ADD CONSTRAINT "_energy_allocation_requests_v_version_solar_owner_id_users_id_fk" FOREIGN KEY ("version_solar_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_allocation_requests_v" ADD CONSTRAINT "_energy_allocation_requests_v_version_relationship_id_customer_relationships_id_fk" FOREIGN KEY ("version_relationship_id") REFERENCES "public"."customer_relationships"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_allocation_requests_v" ADD CONSTRAINT "_energy_allocation_requests_v_version_system_id_solar_systems_id_fk" FOREIGN KEY ("version_system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_allocation_requests_v_rels" ADD CONSTRAINT "_energy_allocation_requests_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_energy_allocation_requests_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_energy_allocation_requests_v_rels" ADD CONSTRAINT "_energy_allocation_requests_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_energy_allocation_requests_v_rels" ADD CONSTRAINT "_energy_allocation_requests_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "energy_allocation_records" ADD CONSTRAINT "energy_allocation_records_request_id_energy_allocation_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."energy_allocation_requests"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "energy_allocation_records" ADD CONSTRAINT "energy_allocation_records_payment_id_payment_transactions_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payment_transactions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "energy_allocation_records" ADD CONSTRAINT "energy_allocation_records_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "energy_allocation_records" ADD CONSTRAINT "energy_allocation_records_solar_owner_id_users_id_fk" FOREIGN KEY ("solar_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "energy_allocation_records" ADD CONSTRAINT "energy_allocation_records_system_id_solar_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "energy_allocation_records_rels" ADD CONSTRAINT "energy_allocation_records_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."energy_allocation_records"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "energy_allocation_records_rels" ADD CONSTRAINT "energy_allocation_records_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "energy_allocation_records_rels" ADD CONSTRAINT "energy_allocation_records_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_energy_allocation_records_v" ADD CONSTRAINT "_energy_allocation_records_v_parent_id_energy_allocation_records_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."energy_allocation_records"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_allocation_records_v" ADD CONSTRAINT "_energy_allocation_records_v_version_request_id_energy_allocation_requests_id_fk" FOREIGN KEY ("version_request_id") REFERENCES "public"."energy_allocation_requests"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_allocation_records_v" ADD CONSTRAINT "_energy_allocation_records_v_version_payment_id_payment_transactions_id_fk" FOREIGN KEY ("version_payment_id") REFERENCES "public"."payment_transactions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_allocation_records_v" ADD CONSTRAINT "_energy_allocation_records_v_version_customer_id_users_id_fk" FOREIGN KEY ("version_customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_allocation_records_v" ADD CONSTRAINT "_energy_allocation_records_v_version_solar_owner_id_users_id_fk" FOREIGN KEY ("version_solar_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_allocation_records_v" ADD CONSTRAINT "_energy_allocation_records_v_version_system_id_solar_systems_id_fk" FOREIGN KEY ("version_system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_allocation_records_v_rels" ADD CONSTRAINT "_energy_allocation_records_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_energy_allocation_records_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_energy_allocation_records_v_rels" ADD CONSTRAINT "_energy_allocation_records_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_energy_allocation_records_v_rels" ADD CONSTRAINT "_energy_allocation_records_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "energy_wallets" ADD CONSTRAINT "energy_wallets_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "energy_wallets" ADD CONSTRAINT "energy_wallets_solar_owner_id_users_id_fk" FOREIGN KEY ("solar_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "energy_wallets" ADD CONSTRAINT "energy_wallets_relationship_id_customer_relationships_id_fk" FOREIGN KEY ("relationship_id") REFERENCES "public"."customer_relationships"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "energy_wallets" ADD CONSTRAINT "energy_wallets_system_id_solar_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "energy_wallets_rels" ADD CONSTRAINT "energy_wallets_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."energy_wallets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "energy_wallets_rels" ADD CONSTRAINT "energy_wallets_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "energy_wallets_rels" ADD CONSTRAINT "energy_wallets_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_energy_wallets_v" ADD CONSTRAINT "_energy_wallets_v_parent_id_energy_wallets_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."energy_wallets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_wallets_v" ADD CONSTRAINT "_energy_wallets_v_version_customer_id_users_id_fk" FOREIGN KEY ("version_customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_wallets_v" ADD CONSTRAINT "_energy_wallets_v_version_solar_owner_id_users_id_fk" FOREIGN KEY ("version_solar_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_wallets_v" ADD CONSTRAINT "_energy_wallets_v_version_relationship_id_customer_relationships_id_fk" FOREIGN KEY ("version_relationship_id") REFERENCES "public"."customer_relationships"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_wallets_v" ADD CONSTRAINT "_energy_wallets_v_version_system_id_solar_systems_id_fk" FOREIGN KEY ("version_system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_wallets_v_rels" ADD CONSTRAINT "_energy_wallets_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_energy_wallets_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_energy_wallets_v_rels" ADD CONSTRAINT "_energy_wallets_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_energy_wallets_v_rels" ADD CONSTRAINT "_energy_wallets_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "energy_ledger_entries" ADD CONSTRAINT "energy_ledger_entries_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "energy_ledger_entries" ADD CONSTRAINT "energy_ledger_entries_solar_owner_id_users_id_fk" FOREIGN KEY ("solar_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "energy_ledger_entries" ADD CONSTRAINT "energy_ledger_entries_system_id_solar_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "energy_ledger_entries" ADD CONSTRAINT "energy_ledger_entries_wallet_id_energy_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."energy_wallets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "energy_ledger_entries" ADD CONSTRAINT "energy_ledger_entries_allocation_id_energy_allocation_records_id_fk" FOREIGN KEY ("allocation_id") REFERENCES "public"."energy_allocation_records"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "energy_ledger_entries" ADD CONSTRAINT "energy_ledger_entries_consumption_id_consumption_records_id_fk" FOREIGN KEY ("consumption_id") REFERENCES "public"."consumption_records"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "energy_ledger_entries_rels" ADD CONSTRAINT "energy_ledger_entries_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."energy_ledger_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "energy_ledger_entries_rels" ADD CONSTRAINT "energy_ledger_entries_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "energy_ledger_entries_rels" ADD CONSTRAINT "energy_ledger_entries_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_energy_ledger_entries_v" ADD CONSTRAINT "_energy_ledger_entries_v_parent_id_energy_ledger_entries_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."energy_ledger_entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_ledger_entries_v" ADD CONSTRAINT "_energy_ledger_entries_v_version_customer_id_users_id_fk" FOREIGN KEY ("version_customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_ledger_entries_v" ADD CONSTRAINT "_energy_ledger_entries_v_version_solar_owner_id_users_id_fk" FOREIGN KEY ("version_solar_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_ledger_entries_v" ADD CONSTRAINT "_energy_ledger_entries_v_version_system_id_solar_systems_id_fk" FOREIGN KEY ("version_system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_ledger_entries_v" ADD CONSTRAINT "_energy_ledger_entries_v_version_wallet_id_energy_wallets_id_fk" FOREIGN KEY ("version_wallet_id") REFERENCES "public"."energy_wallets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_ledger_entries_v" ADD CONSTRAINT "_energy_ledger_entries_v_version_allocation_id_energy_allocation_records_id_fk" FOREIGN KEY ("version_allocation_id") REFERENCES "public"."energy_allocation_records"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_ledger_entries_v" ADD CONSTRAINT "_energy_ledger_entries_v_version_consumption_id_consumption_records_id_fk" FOREIGN KEY ("version_consumption_id") REFERENCES "public"."consumption_records"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_energy_ledger_entries_v_rels" ADD CONSTRAINT "_energy_ledger_entries_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_energy_ledger_entries_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_energy_ledger_entries_v_rels" ADD CONSTRAINT "_energy_ledger_entries_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_energy_ledger_entries_v_rels" ADD CONSTRAINT "_energy_ledger_entries_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meter_registrations" ADD CONSTRAINT "meter_registrations_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "meter_registrations" ADD CONSTRAINT "meter_registrations_solar_owner_id_users_id_fk" FOREIGN KEY ("solar_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "meter_registrations" ADD CONSTRAINT "meter_registrations_relationship_id_customer_relationships_id_fk" FOREIGN KEY ("relationship_id") REFERENCES "public"."customer_relationships"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "meter_registrations" ADD CONSTRAINT "meter_registrations_system_id_solar_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "meter_registrations_rels" ADD CONSTRAINT "meter_registrations_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."meter_registrations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meter_registrations_rels" ADD CONSTRAINT "meter_registrations_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meter_registrations_rels" ADD CONSTRAINT "meter_registrations_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_meter_registrations_v" ADD CONSTRAINT "_meter_registrations_v_parent_id_meter_registrations_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."meter_registrations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_meter_registrations_v" ADD CONSTRAINT "_meter_registrations_v_version_customer_id_users_id_fk" FOREIGN KEY ("version_customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_meter_registrations_v" ADD CONSTRAINT "_meter_registrations_v_version_solar_owner_id_users_id_fk" FOREIGN KEY ("version_solar_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_meter_registrations_v" ADD CONSTRAINT "_meter_registrations_v_version_relationship_id_customer_relationships_id_fk" FOREIGN KEY ("version_relationship_id") REFERENCES "public"."customer_relationships"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_meter_registrations_v" ADD CONSTRAINT "_meter_registrations_v_version_system_id_solar_systems_id_fk" FOREIGN KEY ("version_system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_meter_registrations_v_rels" ADD CONSTRAINT "_meter_registrations_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_meter_registrations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_meter_registrations_v_rels" ADD CONSTRAINT "_meter_registrations_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_meter_registrations_v_rels" ADD CONSTRAINT "_meter_registrations_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meter_readings" ADD CONSTRAINT "meter_readings_meter_id_meter_registrations_id_fk" FOREIGN KEY ("meter_id") REFERENCES "public"."meter_registrations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "meter_readings" ADD CONSTRAINT "meter_readings_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "meter_readings" ADD CONSTRAINT "meter_readings_solar_owner_id_users_id_fk" FOREIGN KEY ("solar_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "meter_readings" ADD CONSTRAINT "meter_readings_system_id_solar_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "meter_readings_rels" ADD CONSTRAINT "meter_readings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."meter_readings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meter_readings_rels" ADD CONSTRAINT "meter_readings_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meter_readings_rels" ADD CONSTRAINT "meter_readings_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_meter_readings_v" ADD CONSTRAINT "_meter_readings_v_parent_id_meter_readings_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."meter_readings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_meter_readings_v" ADD CONSTRAINT "_meter_readings_v_version_meter_id_meter_registrations_id_fk" FOREIGN KEY ("version_meter_id") REFERENCES "public"."meter_registrations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_meter_readings_v" ADD CONSTRAINT "_meter_readings_v_version_customer_id_users_id_fk" FOREIGN KEY ("version_customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_meter_readings_v" ADD CONSTRAINT "_meter_readings_v_version_solar_owner_id_users_id_fk" FOREIGN KEY ("version_solar_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_meter_readings_v" ADD CONSTRAINT "_meter_readings_v_version_system_id_solar_systems_id_fk" FOREIGN KEY ("version_system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_meter_readings_v_rels" ADD CONSTRAINT "_meter_readings_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_meter_readings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_meter_readings_v_rels" ADD CONSTRAINT "_meter_readings_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_meter_readings_v_rels" ADD CONSTRAINT "_meter_readings_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "consumption_records" ADD CONSTRAINT "consumption_records_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "consumption_records" ADD CONSTRAINT "consumption_records_solar_owner_id_users_id_fk" FOREIGN KEY ("solar_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "consumption_records" ADD CONSTRAINT "consumption_records_system_id_solar_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "consumption_records" ADD CONSTRAINT "consumption_records_wallet_id_energy_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."energy_wallets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "consumption_records" ADD CONSTRAINT "consumption_records_meter_id_meter_registrations_id_fk" FOREIGN KEY ("meter_id") REFERENCES "public"."meter_registrations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "consumption_records" ADD CONSTRAINT "consumption_records_reading_id_meter_readings_id_fk" FOREIGN KEY ("reading_id") REFERENCES "public"."meter_readings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "consumption_records_rels" ADD CONSTRAINT "consumption_records_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."consumption_records"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "consumption_records_rels" ADD CONSTRAINT "consumption_records_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "consumption_records_rels" ADD CONSTRAINT "consumption_records_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_consumption_records_v" ADD CONSTRAINT "_consumption_records_v_parent_id_consumption_records_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."consumption_records"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_consumption_records_v" ADD CONSTRAINT "_consumption_records_v_version_customer_id_users_id_fk" FOREIGN KEY ("version_customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_consumption_records_v" ADD CONSTRAINT "_consumption_records_v_version_solar_owner_id_users_id_fk" FOREIGN KEY ("version_solar_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_consumption_records_v" ADD CONSTRAINT "_consumption_records_v_version_system_id_solar_systems_id_fk" FOREIGN KEY ("version_system_id") REFERENCES "public"."solar_systems"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_consumption_records_v" ADD CONSTRAINT "_consumption_records_v_version_wallet_id_energy_wallets_id_fk" FOREIGN KEY ("version_wallet_id") REFERENCES "public"."energy_wallets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_consumption_records_v" ADD CONSTRAINT "_consumption_records_v_version_meter_id_meter_registrations_id_fk" FOREIGN KEY ("version_meter_id") REFERENCES "public"."meter_registrations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_consumption_records_v" ADD CONSTRAINT "_consumption_records_v_version_reading_id_meter_readings_id_fk" FOREIGN KEY ("version_reading_id") REFERENCES "public"."meter_readings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_consumption_records_v_rels" ADD CONSTRAINT "_consumption_records_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_consumption_records_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_consumption_records_v_rels" ADD CONSTRAINT "_consumption_records_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_consumption_records_v_rels" ADD CONSTRAINT "_consumption_records_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media__h_folders_id_folders_id_fk" FOREIGN KEY ("_h_folders_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_media_v" ADD CONSTRAINT "_media_v_parent_id_media_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_media_v" ADD CONSTRAINT "_media_v_version__h_folders_id_folders_id_fk" FOREIGN KEY ("version__h_folders_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_media_v_rels" ADD CONSTRAINT "_media_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_media_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_media_v_rels" ADD CONSTRAINT "_media_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_media_v_rels" ADD CONSTRAINT "_media_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_media_v_rels" ADD CONSTRAINT "_media_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "folders" ADD CONSTRAINT "folders__h_folders_id_folders_id_fk" FOREIGN KEY ("_h_folders_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "folders_rels" ADD CONSTRAINT "folders_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "folders_rels" ADD CONSTRAINT "folders_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "folders_rels" ADD CONSTRAINT "folders_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_folders_v" ADD CONSTRAINT "_folders_v_parent_id_folders_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_folders_v" ADD CONSTRAINT "_folders_v_version__h_folders_id_folders_id_fk" FOREIGN KEY ("version__h_folders_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_folders_v_rels" ADD CONSTRAINT "_folders_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_folders_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_folders_v_rels" ADD CONSTRAINT "_folders_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_folders_v_rels" ADD CONSTRAINT "_folders_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tags" ADD CONSTRAINT "tags__h_tags_id_tags_id_fk" FOREIGN KEY ("_h_tags_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tags_rels" ADD CONSTRAINT "tags_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tags_rels" ADD CONSTRAINT "tags_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tags_rels" ADD CONSTRAINT "tags_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tags_v" ADD CONSTRAINT "_tags_v_parent_id_tags_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tags_v" ADD CONSTRAINT "_tags_v_version__h_tags_id_tags_id_fk" FOREIGN KEY ("version__h_tags_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tags_v_rels" ADD CONSTRAINT "_tags_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_tags_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tags_v_rels" ADD CONSTRAINT "_tags_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tags_v_rels" ADD CONSTRAINT "_tags_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_profile_images_fk" FOREIGN KEY ("profile_images_id") REFERENCES "public"."profile_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_solar_systems_fk" FOREIGN KEY ("solar_systems_id") REFERENCES "public"."solar_systems"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_energy_records_fk" FOREIGN KEY ("energy_records_id") REFERENCES "public"."energy_records"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sharing_records_fk" FOREIGN KEY ("sharing_records_id") REFERENCES "public"."sharing_records"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_app_notifications_fk" FOREIGN KEY ("app_notifications_id") REFERENCES "public"."app_notifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_system_alerts_fk" FOREIGN KEY ("system_alerts_id") REFERENCES "public"."system_alerts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_telemetry_ingestion_events_fk" FOREIGN KEY ("telemetry_ingestion_events_id") REFERENCES "public"."telemetry_ingestion_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_solar_owner_applications_fk" FOREIGN KEY ("solar_owner_applications_id") REFERENCES "public"."solar_owner_applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_solar_owner_profiles_fk" FOREIGN KEY ("solar_owner_profiles_id") REFERENCES "public"."solar_owner_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_customer_profiles_fk" FOREIGN KEY ("customer_profiles_id") REFERENCES "public"."customer_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_customer_relationships_fk" FOREIGN KEY ("customer_relationships_id") REFERENCES "public"."customer_relationships"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_energy_tariffs_fk" FOREIGN KEY ("energy_tariffs_id") REFERENCES "public"."energy_tariffs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_energy_purchase_packages_fk" FOREIGN KEY ("energy_purchase_packages_id") REFERENCES "public"."energy_purchase_packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payment_transactions_fk" FOREIGN KEY ("payment_transactions_id") REFERENCES "public"."payment_transactions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_energy_allocation_requests_fk" FOREIGN KEY ("energy_allocation_requests_id") REFERENCES "public"."energy_allocation_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_energy_allocation_records_fk" FOREIGN KEY ("energy_allocation_records_id") REFERENCES "public"."energy_allocation_records"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_energy_wallets_fk" FOREIGN KEY ("energy_wallets_id") REFERENCES "public"."energy_wallets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_energy_ledger_entries_fk" FOREIGN KEY ("energy_ledger_entries_id") REFERENCES "public"."energy_ledger_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_meter_registrations_fk" FOREIGN KEY ("meter_registrations_id") REFERENCES "public"."meter_registrations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_meter_readings_fk" FOREIGN KEY ("meter_readings_id") REFERENCES "public"."meter_readings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_consumption_records_fk" FOREIGN KEY ("consumption_records_id") REFERENCES "public"."consumption_records"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_folders_fk" FOREIGN KEY ("folders_id") REFERENCES "public"."folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_llm_instructions_rels" ADD CONSTRAINT "payload_llm_instructions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_llm_instructions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_llm_instructions_rels" ADD CONSTRAINT "payload_llm_instructions_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_llm_instructions_rels" ADD CONSTRAINT "payload_llm_instructions_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "admins_sessions_order_idx" ON "admins_sessions" USING btree ("_order");
  CREATE INDEX "admins_sessions_parent_id_idx" ON "admins_sessions" USING btree ("_parent_id");
  CREATE INDEX "admins_updated_at_idx" ON "admins" USING btree ("updated_at");
  CREATE INDEX "admins_created_at_idx" ON "admins" USING btree ("created_at");
  CREATE UNIQUE INDEX "admins_email_idx" ON "admins" USING btree ("email");
  CREATE INDEX "admins_rels_order_idx" ON "admins_rels" USING btree ("order");
  CREATE INDEX "admins_rels_parent_idx" ON "admins_rels" USING btree ("parent_id");
  CREATE INDEX "admins_rels_path_idx" ON "admins_rels" USING btree ("path");
  CREATE INDEX "admins_rels_admins_id_idx" ON "admins_rels" USING btree ("admins_id");
  CREATE INDEX "admins_rels_users_id_idx" ON "admins_rels" USING btree ("users_id");
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_avatar_idx" ON "users" USING btree ("avatar_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "users_rels_order_idx" ON "users_rels" USING btree ("order");
  CREATE INDEX "users_rels_parent_idx" ON "users_rels" USING btree ("parent_id");
  CREATE INDEX "users_rels_path_idx" ON "users_rels" USING btree ("path");
  CREATE INDEX "users_rels_admins_id_idx" ON "users_rels" USING btree ("admins_id");
  CREATE INDEX "users_rels_users_id_idx" ON "users_rels" USING btree ("users_id");
  CREATE INDEX "profile_images_owner_idx" ON "profile_images" USING btree ("owner_id");
  CREATE INDEX "profile_images_updated_at_idx" ON "profile_images" USING btree ("updated_at");
  CREATE INDEX "profile_images_created_at_idx" ON "profile_images" USING btree ("created_at");
  CREATE UNIQUE INDEX "profile_images_filename_idx" ON "profile_images" USING btree ("filename");
  CREATE INDEX "profile_images_original_original_filename_idx" ON "profile_images" USING btree ("original_filename");
  CREATE INDEX "profile_images_rels_order_idx" ON "profile_images_rels" USING btree ("order");
  CREATE INDEX "profile_images_rels_parent_idx" ON "profile_images_rels" USING btree ("parent_id");
  CREATE INDEX "profile_images_rels_path_idx" ON "profile_images_rels" USING btree ("path");
  CREATE INDEX "profile_images_rels_admins_id_idx" ON "profile_images_rels" USING btree ("admins_id");
  CREATE INDEX "profile_images_rels_users_id_idx" ON "profile_images_rels" USING btree ("users_id");
  CREATE INDEX "_profile_images_v_parent_idx" ON "_profile_images_v" USING btree ("parent_id");
  CREATE INDEX "_profile_images_v_version_version_owner_idx" ON "_profile_images_v" USING btree ("version_owner_id");
  CREATE INDEX "_profile_images_v_version_version_updated_at_idx" ON "_profile_images_v" USING btree ("version_updated_at");
  CREATE INDEX "_profile_images_v_version_version_created_at_idx" ON "_profile_images_v" USING btree ("version_created_at");
  CREATE INDEX "_profile_images_v_version_version_filename_idx" ON "_profile_images_v" USING btree ("version_filename");
  CREATE INDEX "_profile_images_v_version_original_version_original_file_idx" ON "_profile_images_v" USING btree ("version_original_filename");
  CREATE INDEX "_profile_images_v_created_at_idx" ON "_profile_images_v" USING btree ("created_at");
  CREATE INDEX "_profile_images_v_updated_at_idx" ON "_profile_images_v" USING btree ("updated_at");
  CREATE INDEX "_profile_images_v_rels_order_idx" ON "_profile_images_v_rels" USING btree ("order");
  CREATE INDEX "_profile_images_v_rels_parent_idx" ON "_profile_images_v_rels" USING btree ("parent_id");
  CREATE INDEX "_profile_images_v_rels_path_idx" ON "_profile_images_v_rels" USING btree ("path");
  CREATE INDEX "_profile_images_v_rels_admins_id_idx" ON "_profile_images_v_rels" USING btree ("admins_id");
  CREATE INDEX "_profile_images_v_rels_users_id_idx" ON "_profile_images_v_rels" USING btree ("users_id");
  CREATE INDEX "solar_systems_owner_idx" ON "solar_systems" USING btree ("owner_id");
  CREATE UNIQUE INDEX "solar_systems_customer_registration_code_idx" ON "solar_systems" USING btree ("customer_registration_code");
  CREATE INDEX "solar_systems_gateway_reference_idx" ON "solar_systems" USING btree ("gateway_reference");
  CREATE INDEX "solar_systems_integration_adapter_idx" ON "solar_systems" USING btree ("integration_adapter");
  CREATE INDEX "solar_systems_operational_status_idx" ON "solar_systems" USING btree ("operational_status");
  CREATE INDEX "solar_systems_last_connected_at_idx" ON "solar_systems" USING btree ("last_connected_at");
  CREATE INDEX "solar_systems_last_telemetry_at_idx" ON "solar_systems" USING btree ("last_telemetry_at");
  CREATE INDEX "solar_systems_updated_at_idx" ON "solar_systems" USING btree ("updated_at");
  CREATE INDEX "solar_systems_created_at_idx" ON "solar_systems" USING btree ("created_at");
  CREATE INDEX "solar_systems_rels_order_idx" ON "solar_systems_rels" USING btree ("order");
  CREATE INDEX "solar_systems_rels_parent_idx" ON "solar_systems_rels" USING btree ("parent_id");
  CREATE INDEX "solar_systems_rels_path_idx" ON "solar_systems_rels" USING btree ("path");
  CREATE INDEX "solar_systems_rels_admins_id_idx" ON "solar_systems_rels" USING btree ("admins_id");
  CREATE INDEX "solar_systems_rels_users_id_idx" ON "solar_systems_rels" USING btree ("users_id");
  CREATE INDEX "_solar_systems_v_parent_idx" ON "_solar_systems_v" USING btree ("parent_id");
  CREATE INDEX "_solar_systems_v_version_version_owner_idx" ON "_solar_systems_v" USING btree ("version_owner_id");
  CREATE INDEX "_solar_systems_v_version_version_customer_registration_c_idx" ON "_solar_systems_v" USING btree ("version_customer_registration_code");
  CREATE INDEX "_solar_systems_v_version_version_gateway_reference_idx" ON "_solar_systems_v" USING btree ("version_gateway_reference");
  CREATE INDEX "_solar_systems_v_version_version_integration_adapter_idx" ON "_solar_systems_v" USING btree ("version_integration_adapter");
  CREATE INDEX "_solar_systems_v_version_version_operational_status_idx" ON "_solar_systems_v" USING btree ("version_operational_status");
  CREATE INDEX "_solar_systems_v_version_version_last_connected_at_idx" ON "_solar_systems_v" USING btree ("version_last_connected_at");
  CREATE INDEX "_solar_systems_v_version_version_last_telemetry_at_idx" ON "_solar_systems_v" USING btree ("version_last_telemetry_at");
  CREATE INDEX "_solar_systems_v_version_version_updated_at_idx" ON "_solar_systems_v" USING btree ("version_updated_at");
  CREATE INDEX "_solar_systems_v_version_version_created_at_idx" ON "_solar_systems_v" USING btree ("version_created_at");
  CREATE INDEX "_solar_systems_v_created_at_idx" ON "_solar_systems_v" USING btree ("created_at");
  CREATE INDEX "_solar_systems_v_updated_at_idx" ON "_solar_systems_v" USING btree ("updated_at");
  CREATE INDEX "_solar_systems_v_rels_order_idx" ON "_solar_systems_v_rels" USING btree ("order");
  CREATE INDEX "_solar_systems_v_rels_parent_idx" ON "_solar_systems_v_rels" USING btree ("parent_id");
  CREATE INDEX "_solar_systems_v_rels_path_idx" ON "_solar_systems_v_rels" USING btree ("path");
  CREATE INDEX "_solar_systems_v_rels_admins_id_idx" ON "_solar_systems_v_rels" USING btree ("admins_id");
  CREATE INDEX "_solar_systems_v_rels_users_id_idx" ON "_solar_systems_v_rels" USING btree ("users_id");
  CREATE INDEX "energy_records_owner_idx" ON "energy_records" USING btree ("owner_id");
  CREATE INDEX "energy_records_system_idx" ON "energy_records" USING btree ("system_id");
  CREATE INDEX "energy_records_kind_idx" ON "energy_records" USING btree ("kind");
  CREATE INDEX "energy_records_recorded_at_idx" ON "energy_records" USING btree ("recorded_at");
  CREATE INDEX "energy_records_source_idx" ON "energy_records" USING btree ("source");
  CREATE INDEX "energy_records_source_reference_idx" ON "energy_records" USING btree ("source_reference");
  CREATE UNIQUE INDEX "energy_records_dedupe_key_idx" ON "energy_records" USING btree ("dedupe_key");
  CREATE INDEX "energy_records_telemetry_status_idx" ON "energy_records" USING btree ("telemetry_status");
  CREATE INDEX "energy_records_received_at_idx" ON "energy_records" USING btree ("received_at");
  CREATE INDEX "energy_records_updated_at_idx" ON "energy_records" USING btree ("updated_at");
  CREATE INDEX "energy_records_created_at_idx" ON "energy_records" USING btree ("created_at");
  CREATE INDEX "energy_records_rels_order_idx" ON "energy_records_rels" USING btree ("order");
  CREATE INDEX "energy_records_rels_parent_idx" ON "energy_records_rels" USING btree ("parent_id");
  CREATE INDEX "energy_records_rels_path_idx" ON "energy_records_rels" USING btree ("path");
  CREATE INDEX "energy_records_rels_admins_id_idx" ON "energy_records_rels" USING btree ("admins_id");
  CREATE INDEX "energy_records_rels_users_id_idx" ON "energy_records_rels" USING btree ("users_id");
  CREATE INDEX "_energy_records_v_parent_idx" ON "_energy_records_v" USING btree ("parent_id");
  CREATE INDEX "_energy_records_v_version_version_owner_idx" ON "_energy_records_v" USING btree ("version_owner_id");
  CREATE INDEX "_energy_records_v_version_version_system_idx" ON "_energy_records_v" USING btree ("version_system_id");
  CREATE INDEX "_energy_records_v_version_version_kind_idx" ON "_energy_records_v" USING btree ("version_kind");
  CREATE INDEX "_energy_records_v_version_version_recorded_at_idx" ON "_energy_records_v" USING btree ("version_recorded_at");
  CREATE INDEX "_energy_records_v_version_version_source_idx" ON "_energy_records_v" USING btree ("version_source");
  CREATE INDEX "_energy_records_v_version_version_source_reference_idx" ON "_energy_records_v" USING btree ("version_source_reference");
  CREATE INDEX "_energy_records_v_version_version_dedupe_key_idx" ON "_energy_records_v" USING btree ("version_dedupe_key");
  CREATE INDEX "_energy_records_v_version_version_telemetry_status_idx" ON "_energy_records_v" USING btree ("version_telemetry_status");
  CREATE INDEX "_energy_records_v_version_version_received_at_idx" ON "_energy_records_v" USING btree ("version_received_at");
  CREATE INDEX "_energy_records_v_version_version_updated_at_idx" ON "_energy_records_v" USING btree ("version_updated_at");
  CREATE INDEX "_energy_records_v_version_version_created_at_idx" ON "_energy_records_v" USING btree ("version_created_at");
  CREATE INDEX "_energy_records_v_created_at_idx" ON "_energy_records_v" USING btree ("created_at");
  CREATE INDEX "_energy_records_v_updated_at_idx" ON "_energy_records_v" USING btree ("updated_at");
  CREATE INDEX "_energy_records_v_rels_order_idx" ON "_energy_records_v_rels" USING btree ("order");
  CREATE INDEX "_energy_records_v_rels_parent_idx" ON "_energy_records_v_rels" USING btree ("parent_id");
  CREATE INDEX "_energy_records_v_rels_path_idx" ON "_energy_records_v_rels" USING btree ("path");
  CREATE INDEX "_energy_records_v_rels_admins_id_idx" ON "_energy_records_v_rels" USING btree ("admins_id");
  CREATE INDEX "_energy_records_v_rels_users_id_idx" ON "_energy_records_v_rels" USING btree ("users_id");
  CREATE INDEX "sharing_records_owner_idx" ON "sharing_records" USING btree ("owner_id");
  CREATE INDEX "sharing_records_sender_idx" ON "sharing_records" USING btree ("sender_id");
  CREATE INDEX "sharing_records_recipient_idx" ON "sharing_records" USING btree ("recipient_id");
  CREATE INDEX "sharing_records_source_system_idx" ON "sharing_records" USING btree ("source_system_id");
  CREATE INDEX "sharing_records_status_idx" ON "sharing_records" USING btree ("status");
  CREATE INDEX "sharing_records_allocation_reference_idx" ON "sharing_records" USING btree ("allocation_reference");
  CREATE INDEX "sharing_records_recorded_at_idx" ON "sharing_records" USING btree ("recorded_at");
  CREATE INDEX "sharing_records_completed_at_idx" ON "sharing_records" USING btree ("completed_at");
  CREATE INDEX "sharing_records_updated_at_idx" ON "sharing_records" USING btree ("updated_at");
  CREATE INDEX "sharing_records_created_at_idx" ON "sharing_records" USING btree ("created_at");
  CREATE INDEX "sharing_records_rels_order_idx" ON "sharing_records_rels" USING btree ("order");
  CREATE INDEX "sharing_records_rels_parent_idx" ON "sharing_records_rels" USING btree ("parent_id");
  CREATE INDEX "sharing_records_rels_path_idx" ON "sharing_records_rels" USING btree ("path");
  CREATE INDEX "sharing_records_rels_admins_id_idx" ON "sharing_records_rels" USING btree ("admins_id");
  CREATE INDEX "sharing_records_rels_users_id_idx" ON "sharing_records_rels" USING btree ("users_id");
  CREATE INDEX "_sharing_records_v_parent_idx" ON "_sharing_records_v" USING btree ("parent_id");
  CREATE INDEX "_sharing_records_v_version_version_owner_idx" ON "_sharing_records_v" USING btree ("version_owner_id");
  CREATE INDEX "_sharing_records_v_version_version_sender_idx" ON "_sharing_records_v" USING btree ("version_sender_id");
  CREATE INDEX "_sharing_records_v_version_version_recipient_idx" ON "_sharing_records_v" USING btree ("version_recipient_id");
  CREATE INDEX "_sharing_records_v_version_version_source_system_idx" ON "_sharing_records_v" USING btree ("version_source_system_id");
  CREATE INDEX "_sharing_records_v_version_version_status_idx" ON "_sharing_records_v" USING btree ("version_status");
  CREATE INDEX "_sharing_records_v_version_version_allocation_reference_idx" ON "_sharing_records_v" USING btree ("version_allocation_reference");
  CREATE INDEX "_sharing_records_v_version_version_recorded_at_idx" ON "_sharing_records_v" USING btree ("version_recorded_at");
  CREATE INDEX "_sharing_records_v_version_version_completed_at_idx" ON "_sharing_records_v" USING btree ("version_completed_at");
  CREATE INDEX "_sharing_records_v_version_version_updated_at_idx" ON "_sharing_records_v" USING btree ("version_updated_at");
  CREATE INDEX "_sharing_records_v_version_version_created_at_idx" ON "_sharing_records_v" USING btree ("version_created_at");
  CREATE INDEX "_sharing_records_v_created_at_idx" ON "_sharing_records_v" USING btree ("created_at");
  CREATE INDEX "_sharing_records_v_updated_at_idx" ON "_sharing_records_v" USING btree ("updated_at");
  CREATE INDEX "_sharing_records_v_rels_order_idx" ON "_sharing_records_v_rels" USING btree ("order");
  CREATE INDEX "_sharing_records_v_rels_parent_idx" ON "_sharing_records_v_rels" USING btree ("parent_id");
  CREATE INDEX "_sharing_records_v_rels_path_idx" ON "_sharing_records_v_rels" USING btree ("path");
  CREATE INDEX "_sharing_records_v_rels_admins_id_idx" ON "_sharing_records_v_rels" USING btree ("admins_id");
  CREATE INDEX "_sharing_records_v_rels_users_id_idx" ON "_sharing_records_v_rels" USING btree ("users_id");
  CREATE INDEX "app_notifications_owner_idx" ON "app_notifications" USING btree ("owner_id");
  CREATE INDEX "app_notifications_type_idx" ON "app_notifications" USING btree ("type");
  CREATE INDEX "app_notifications_updated_at_idx" ON "app_notifications" USING btree ("updated_at");
  CREATE INDEX "app_notifications_created_at_idx" ON "app_notifications" USING btree ("created_at");
  CREATE INDEX "app_notifications_rels_order_idx" ON "app_notifications_rels" USING btree ("order");
  CREATE INDEX "app_notifications_rels_parent_idx" ON "app_notifications_rels" USING btree ("parent_id");
  CREATE INDEX "app_notifications_rels_path_idx" ON "app_notifications_rels" USING btree ("path");
  CREATE INDEX "app_notifications_rels_admins_id_idx" ON "app_notifications_rels" USING btree ("admins_id");
  CREATE INDEX "app_notifications_rels_users_id_idx" ON "app_notifications_rels" USING btree ("users_id");
  CREATE INDEX "_app_notifications_v_parent_idx" ON "_app_notifications_v" USING btree ("parent_id");
  CREATE INDEX "_app_notifications_v_version_version_owner_idx" ON "_app_notifications_v" USING btree ("version_owner_id");
  CREATE INDEX "_app_notifications_v_version_version_type_idx" ON "_app_notifications_v" USING btree ("version_type");
  CREATE INDEX "_app_notifications_v_version_version_updated_at_idx" ON "_app_notifications_v" USING btree ("version_updated_at");
  CREATE INDEX "_app_notifications_v_version_version_created_at_idx" ON "_app_notifications_v" USING btree ("version_created_at");
  CREATE INDEX "_app_notifications_v_created_at_idx" ON "_app_notifications_v" USING btree ("created_at");
  CREATE INDEX "_app_notifications_v_updated_at_idx" ON "_app_notifications_v" USING btree ("updated_at");
  CREATE INDEX "_app_notifications_v_rels_order_idx" ON "_app_notifications_v_rels" USING btree ("order");
  CREATE INDEX "_app_notifications_v_rels_parent_idx" ON "_app_notifications_v_rels" USING btree ("parent_id");
  CREATE INDEX "_app_notifications_v_rels_path_idx" ON "_app_notifications_v_rels" USING btree ("path");
  CREATE INDEX "_app_notifications_v_rels_admins_id_idx" ON "_app_notifications_v_rels" USING btree ("admins_id");
  CREATE INDEX "_app_notifications_v_rels_users_id_idx" ON "_app_notifications_v_rels" USING btree ("users_id");
  CREATE INDEX "system_alerts_owner_idx" ON "system_alerts" USING btree ("owner_id");
  CREATE INDEX "system_alerts_system_idx" ON "system_alerts" USING btree ("system_id");
  CREATE INDEX "system_alerts_severity_idx" ON "system_alerts" USING btree ("severity");
  CREATE INDEX "system_alerts_category_idx" ON "system_alerts" USING btree ("category");
  CREATE INDEX "system_alerts_status_idx" ON "system_alerts" USING btree ("status");
  CREATE INDEX "system_alerts_source_reference_idx" ON "system_alerts" USING btree ("source_reference");
  CREATE INDEX "system_alerts_detected_at_idx" ON "system_alerts" USING btree ("detected_at");
  CREATE INDEX "system_alerts_updated_at_idx" ON "system_alerts" USING btree ("updated_at");
  CREATE INDEX "system_alerts_created_at_idx" ON "system_alerts" USING btree ("created_at");
  CREATE INDEX "system_alerts_rels_order_idx" ON "system_alerts_rels" USING btree ("order");
  CREATE INDEX "system_alerts_rels_parent_idx" ON "system_alerts_rels" USING btree ("parent_id");
  CREATE INDEX "system_alerts_rels_path_idx" ON "system_alerts_rels" USING btree ("path");
  CREATE INDEX "system_alerts_rels_admins_id_idx" ON "system_alerts_rels" USING btree ("admins_id");
  CREATE INDEX "system_alerts_rels_users_id_idx" ON "system_alerts_rels" USING btree ("users_id");
  CREATE INDEX "_system_alerts_v_parent_idx" ON "_system_alerts_v" USING btree ("parent_id");
  CREATE INDEX "_system_alerts_v_version_version_owner_idx" ON "_system_alerts_v" USING btree ("version_owner_id");
  CREATE INDEX "_system_alerts_v_version_version_system_idx" ON "_system_alerts_v" USING btree ("version_system_id");
  CREATE INDEX "_system_alerts_v_version_version_severity_idx" ON "_system_alerts_v" USING btree ("version_severity");
  CREATE INDEX "_system_alerts_v_version_version_category_idx" ON "_system_alerts_v" USING btree ("version_category");
  CREATE INDEX "_system_alerts_v_version_version_status_idx" ON "_system_alerts_v" USING btree ("version_status");
  CREATE INDEX "_system_alerts_v_version_version_source_reference_idx" ON "_system_alerts_v" USING btree ("version_source_reference");
  CREATE INDEX "_system_alerts_v_version_version_detected_at_idx" ON "_system_alerts_v" USING btree ("version_detected_at");
  CREATE INDEX "_system_alerts_v_version_version_updated_at_idx" ON "_system_alerts_v" USING btree ("version_updated_at");
  CREATE INDEX "_system_alerts_v_version_version_created_at_idx" ON "_system_alerts_v" USING btree ("version_created_at");
  CREATE INDEX "_system_alerts_v_created_at_idx" ON "_system_alerts_v" USING btree ("created_at");
  CREATE INDEX "_system_alerts_v_updated_at_idx" ON "_system_alerts_v" USING btree ("updated_at");
  CREATE INDEX "_system_alerts_v_rels_order_idx" ON "_system_alerts_v_rels" USING btree ("order");
  CREATE INDEX "_system_alerts_v_rels_parent_idx" ON "_system_alerts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_system_alerts_v_rels_path_idx" ON "_system_alerts_v_rels" USING btree ("path");
  CREATE INDEX "_system_alerts_v_rels_admins_id_idx" ON "_system_alerts_v_rels" USING btree ("admins_id");
  CREATE INDEX "_system_alerts_v_rels_users_id_idx" ON "_system_alerts_v_rels" USING btree ("users_id");
  CREATE INDEX "telemetry_ingestion_events_owner_idx" ON "telemetry_ingestion_events" USING btree ("owner_id");
  CREATE INDEX "telemetry_ingestion_events_system_idx" ON "telemetry_ingestion_events" USING btree ("system_id");
  CREATE INDEX "telemetry_ingestion_events_adapter_idx" ON "telemetry_ingestion_events" USING btree ("adapter");
  CREATE INDEX "telemetry_ingestion_events_event_reference_hash_idx" ON "telemetry_ingestion_events" USING btree ("event_reference_hash");
  CREATE INDEX "telemetry_ingestion_events_status_idx" ON "telemetry_ingestion_events" USING btree ("status");
  CREATE INDEX "telemetry_ingestion_events_error_code_idx" ON "telemetry_ingestion_events" USING btree ("error_code");
  CREATE INDEX "telemetry_ingestion_events_received_at_idx" ON "telemetry_ingestion_events" USING btree ("received_at");
  CREATE INDEX "telemetry_ingestion_events_measurement_timestamp_idx" ON "telemetry_ingestion_events" USING btree ("measurement_timestamp");
  CREATE INDEX "telemetry_ingestion_events_updated_at_idx" ON "telemetry_ingestion_events" USING btree ("updated_at");
  CREATE INDEX "telemetry_ingestion_events_created_at_idx" ON "telemetry_ingestion_events" USING btree ("created_at");
  CREATE INDEX "telemetry_ingestion_events_rels_order_idx" ON "telemetry_ingestion_events_rels" USING btree ("order");
  CREATE INDEX "telemetry_ingestion_events_rels_parent_idx" ON "telemetry_ingestion_events_rels" USING btree ("parent_id");
  CREATE INDEX "telemetry_ingestion_events_rels_path_idx" ON "telemetry_ingestion_events_rels" USING btree ("path");
  CREATE INDEX "telemetry_ingestion_events_rels_admins_id_idx" ON "telemetry_ingestion_events_rels" USING btree ("admins_id");
  CREATE INDEX "telemetry_ingestion_events_rels_users_id_idx" ON "telemetry_ingestion_events_rels" USING btree ("users_id");
  CREATE INDEX "_telemetry_ingestion_events_v_parent_idx" ON "_telemetry_ingestion_events_v" USING btree ("parent_id");
  CREATE INDEX "_telemetry_ingestion_events_v_version_version_owner_idx" ON "_telemetry_ingestion_events_v" USING btree ("version_owner_id");
  CREATE INDEX "_telemetry_ingestion_events_v_version_version_system_idx" ON "_telemetry_ingestion_events_v" USING btree ("version_system_id");
  CREATE INDEX "_telemetry_ingestion_events_v_version_version_adapter_idx" ON "_telemetry_ingestion_events_v" USING btree ("version_adapter");
  CREATE INDEX "_telemetry_ingestion_events_v_version_version_event_refe_idx" ON "_telemetry_ingestion_events_v" USING btree ("version_event_reference_hash");
  CREATE INDEX "_telemetry_ingestion_events_v_version_version_status_idx" ON "_telemetry_ingestion_events_v" USING btree ("version_status");
  CREATE INDEX "_telemetry_ingestion_events_v_version_version_error_code_idx" ON "_telemetry_ingestion_events_v" USING btree ("version_error_code");
  CREATE INDEX "_telemetry_ingestion_events_v_version_version_received_a_idx" ON "_telemetry_ingestion_events_v" USING btree ("version_received_at");
  CREATE INDEX "_telemetry_ingestion_events_v_version_version_measuremen_idx" ON "_telemetry_ingestion_events_v" USING btree ("version_measurement_timestamp");
  CREATE INDEX "_telemetry_ingestion_events_v_version_version_updated_at_idx" ON "_telemetry_ingestion_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_telemetry_ingestion_events_v_version_version_created_at_idx" ON "_telemetry_ingestion_events_v" USING btree ("version_created_at");
  CREATE INDEX "_telemetry_ingestion_events_v_created_at_idx" ON "_telemetry_ingestion_events_v" USING btree ("created_at");
  CREATE INDEX "_telemetry_ingestion_events_v_updated_at_idx" ON "_telemetry_ingestion_events_v" USING btree ("updated_at");
  CREATE INDEX "_telemetry_ingestion_events_v_rels_order_idx" ON "_telemetry_ingestion_events_v_rels" USING btree ("order");
  CREATE INDEX "_telemetry_ingestion_events_v_rels_parent_idx" ON "_telemetry_ingestion_events_v_rels" USING btree ("parent_id");
  CREATE INDEX "_telemetry_ingestion_events_v_rels_path_idx" ON "_telemetry_ingestion_events_v_rels" USING btree ("path");
  CREATE INDEX "_telemetry_ingestion_events_v_rels_admins_id_idx" ON "_telemetry_ingestion_events_v_rels" USING btree ("admins_id");
  CREATE INDEX "_telemetry_ingestion_events_v_rels_users_id_idx" ON "_telemetry_ingestion_events_v_rels" USING btree ("users_id");
  CREATE UNIQUE INDEX "solar_owner_applications_user_idx" ON "solar_owner_applications" USING btree ("user_id");
  CREATE INDEX "solar_owner_applications_applicant_email_idx" ON "solar_owner_applications" USING btree ("applicant_email");
  CREATE INDEX "solar_owner_applications_status_idx" ON "solar_owner_applications" USING btree ("status");
  CREATE INDEX "solar_owner_applications_reviewed_by_idx" ON "solar_owner_applications" USING btree ("reviewed_by_id");
  CREATE INDEX "solar_owner_applications_updated_at_idx" ON "solar_owner_applications" USING btree ("updated_at");
  CREATE INDEX "solar_owner_applications_created_at_idx" ON "solar_owner_applications" USING btree ("created_at");
  CREATE INDEX "solar_owner_applications_rels_order_idx" ON "solar_owner_applications_rels" USING btree ("order");
  CREATE INDEX "solar_owner_applications_rels_parent_idx" ON "solar_owner_applications_rels" USING btree ("parent_id");
  CREATE INDEX "solar_owner_applications_rels_path_idx" ON "solar_owner_applications_rels" USING btree ("path");
  CREATE INDEX "solar_owner_applications_rels_admins_id_idx" ON "solar_owner_applications_rels" USING btree ("admins_id");
  CREATE INDEX "solar_owner_applications_rels_users_id_idx" ON "solar_owner_applications_rels" USING btree ("users_id");
  CREATE UNIQUE INDEX "solar_owner_profiles_solar_owner_idx" ON "solar_owner_profiles" USING btree ("solar_owner_id");
  CREATE INDEX "solar_owner_profiles_updated_at_idx" ON "solar_owner_profiles" USING btree ("updated_at");
  CREATE INDEX "solar_owner_profiles_created_at_idx" ON "solar_owner_profiles" USING btree ("created_at");
  CREATE INDEX "solar_owner_profiles_rels_order_idx" ON "solar_owner_profiles_rels" USING btree ("order");
  CREATE INDEX "solar_owner_profiles_rels_parent_idx" ON "solar_owner_profiles_rels" USING btree ("parent_id");
  CREATE INDEX "solar_owner_profiles_rels_path_idx" ON "solar_owner_profiles_rels" USING btree ("path");
  CREATE INDEX "solar_owner_profiles_rels_admins_id_idx" ON "solar_owner_profiles_rels" USING btree ("admins_id");
  CREATE INDEX "solar_owner_profiles_rels_users_id_idx" ON "solar_owner_profiles_rels" USING btree ("users_id");
  CREATE INDEX "_solar_owner_profiles_v_parent_idx" ON "_solar_owner_profiles_v" USING btree ("parent_id");
  CREATE INDEX "_solar_owner_profiles_v_version_version_solar_owner_idx" ON "_solar_owner_profiles_v" USING btree ("version_solar_owner_id");
  CREATE INDEX "_solar_owner_profiles_v_version_version_updated_at_idx" ON "_solar_owner_profiles_v" USING btree ("version_updated_at");
  CREATE INDEX "_solar_owner_profiles_v_version_version_created_at_idx" ON "_solar_owner_profiles_v" USING btree ("version_created_at");
  CREATE INDEX "_solar_owner_profiles_v_created_at_idx" ON "_solar_owner_profiles_v" USING btree ("created_at");
  CREATE INDEX "_solar_owner_profiles_v_updated_at_idx" ON "_solar_owner_profiles_v" USING btree ("updated_at");
  CREATE INDEX "_solar_owner_profiles_v_rels_order_idx" ON "_solar_owner_profiles_v_rels" USING btree ("order");
  CREATE INDEX "_solar_owner_profiles_v_rels_parent_idx" ON "_solar_owner_profiles_v_rels" USING btree ("parent_id");
  CREATE INDEX "_solar_owner_profiles_v_rels_path_idx" ON "_solar_owner_profiles_v_rels" USING btree ("path");
  CREATE INDEX "_solar_owner_profiles_v_rels_admins_id_idx" ON "_solar_owner_profiles_v_rels" USING btree ("admins_id");
  CREATE INDEX "_solar_owner_profiles_v_rels_users_id_idx" ON "_solar_owner_profiles_v_rels" USING btree ("users_id");
  CREATE UNIQUE INDEX "customer_profiles_customer_idx" ON "customer_profiles" USING btree ("customer_id");
  CREATE INDEX "customer_profiles_updated_at_idx" ON "customer_profiles" USING btree ("updated_at");
  CREATE INDEX "customer_profiles_created_at_idx" ON "customer_profiles" USING btree ("created_at");
  CREATE INDEX "customer_profiles_rels_order_idx" ON "customer_profiles_rels" USING btree ("order");
  CREATE INDEX "customer_profiles_rels_parent_idx" ON "customer_profiles_rels" USING btree ("parent_id");
  CREATE INDEX "customer_profiles_rels_path_idx" ON "customer_profiles_rels" USING btree ("path");
  CREATE INDEX "customer_profiles_rels_admins_id_idx" ON "customer_profiles_rels" USING btree ("admins_id");
  CREATE INDEX "customer_profiles_rels_users_id_idx" ON "customer_profiles_rels" USING btree ("users_id");
  CREATE INDEX "_customer_profiles_v_parent_idx" ON "_customer_profiles_v" USING btree ("parent_id");
  CREATE INDEX "_customer_profiles_v_version_version_customer_idx" ON "_customer_profiles_v" USING btree ("version_customer_id");
  CREATE INDEX "_customer_profiles_v_version_version_updated_at_idx" ON "_customer_profiles_v" USING btree ("version_updated_at");
  CREATE INDEX "_customer_profiles_v_version_version_created_at_idx" ON "_customer_profiles_v" USING btree ("version_created_at");
  CREATE INDEX "_customer_profiles_v_created_at_idx" ON "_customer_profiles_v" USING btree ("created_at");
  CREATE INDEX "_customer_profiles_v_updated_at_idx" ON "_customer_profiles_v" USING btree ("updated_at");
  CREATE INDEX "_customer_profiles_v_rels_order_idx" ON "_customer_profiles_v_rels" USING btree ("order");
  CREATE INDEX "_customer_profiles_v_rels_parent_idx" ON "_customer_profiles_v_rels" USING btree ("parent_id");
  CREATE INDEX "_customer_profiles_v_rels_path_idx" ON "_customer_profiles_v_rels" USING btree ("path");
  CREATE INDEX "_customer_profiles_v_rels_admins_id_idx" ON "_customer_profiles_v_rels" USING btree ("admins_id");
  CREATE INDEX "_customer_profiles_v_rels_users_id_idx" ON "_customer_profiles_v_rels" USING btree ("users_id");
  CREATE INDEX "customer_relationships_solar_owner_idx" ON "customer_relationships" USING btree ("solar_owner_id");
  CREATE INDEX "customer_relationships_customer_idx" ON "customer_relationships" USING btree ("customer_id");
  CREATE INDEX "customer_relationships_system_idx" ON "customer_relationships" USING btree ("system_id");
  CREATE INDEX "customer_relationships_status_idx" ON "customer_relationships" USING btree ("status");
  CREATE INDEX "customer_relationships_requested_at_idx" ON "customer_relationships" USING btree ("requested_at");
  CREATE UNIQUE INDEX "customer_relationships_relationship_key_idx" ON "customer_relationships" USING btree ("relationship_key");
  CREATE INDEX "customer_relationships_updated_at_idx" ON "customer_relationships" USING btree ("updated_at");
  CREATE INDEX "customer_relationships_created_at_idx" ON "customer_relationships" USING btree ("created_at");
  CREATE INDEX "customer_relationships_rels_order_idx" ON "customer_relationships_rels" USING btree ("order");
  CREATE INDEX "customer_relationships_rels_parent_idx" ON "customer_relationships_rels" USING btree ("parent_id");
  CREATE INDEX "customer_relationships_rels_path_idx" ON "customer_relationships_rels" USING btree ("path");
  CREATE INDEX "customer_relationships_rels_admins_id_idx" ON "customer_relationships_rels" USING btree ("admins_id");
  CREATE INDEX "customer_relationships_rels_users_id_idx" ON "customer_relationships_rels" USING btree ("users_id");
  CREATE INDEX "_customer_relationships_v_parent_idx" ON "_customer_relationships_v" USING btree ("parent_id");
  CREATE INDEX "_customer_relationships_v_version_version_solar_owner_idx" ON "_customer_relationships_v" USING btree ("version_solar_owner_id");
  CREATE INDEX "_customer_relationships_v_version_version_customer_idx" ON "_customer_relationships_v" USING btree ("version_customer_id");
  CREATE INDEX "_customer_relationships_v_version_version_system_idx" ON "_customer_relationships_v" USING btree ("version_system_id");
  CREATE INDEX "_customer_relationships_v_version_version_status_idx" ON "_customer_relationships_v" USING btree ("version_status");
  CREATE INDEX "_customer_relationships_v_version_version_requested_at_idx" ON "_customer_relationships_v" USING btree ("version_requested_at");
  CREATE INDEX "_customer_relationships_v_version_version_relationship_k_idx" ON "_customer_relationships_v" USING btree ("version_relationship_key");
  CREATE INDEX "_customer_relationships_v_version_version_updated_at_idx" ON "_customer_relationships_v" USING btree ("version_updated_at");
  CREATE INDEX "_customer_relationships_v_version_version_created_at_idx" ON "_customer_relationships_v" USING btree ("version_created_at");
  CREATE INDEX "_customer_relationships_v_created_at_idx" ON "_customer_relationships_v" USING btree ("created_at");
  CREATE INDEX "_customer_relationships_v_updated_at_idx" ON "_customer_relationships_v" USING btree ("updated_at");
  CREATE INDEX "_customer_relationships_v_rels_order_idx" ON "_customer_relationships_v_rels" USING btree ("order");
  CREATE INDEX "_customer_relationships_v_rels_parent_idx" ON "_customer_relationships_v_rels" USING btree ("parent_id");
  CREATE INDEX "_customer_relationships_v_rels_path_idx" ON "_customer_relationships_v_rels" USING btree ("path");
  CREATE INDEX "_customer_relationships_v_rels_admins_id_idx" ON "_customer_relationships_v_rels" USING btree ("admins_id");
  CREATE INDEX "_customer_relationships_v_rels_users_id_idx" ON "_customer_relationships_v_rels" USING btree ("users_id");
  CREATE INDEX "energy_tariffs_solar_owner_idx" ON "energy_tariffs" USING btree ("solar_owner_id");
  CREATE INDEX "energy_tariffs_system_idx" ON "energy_tariffs" USING btree ("system_id");
  CREATE INDEX "energy_tariffs_active_from_idx" ON "energy_tariffs" USING btree ("active_from");
  CREATE INDEX "energy_tariffs_active_to_idx" ON "energy_tariffs" USING btree ("active_to");
  CREATE INDEX "energy_tariffs_status_idx" ON "energy_tariffs" USING btree ("status");
  CREATE INDEX "energy_tariffs_updated_at_idx" ON "energy_tariffs" USING btree ("updated_at");
  CREATE INDEX "energy_tariffs_created_at_idx" ON "energy_tariffs" USING btree ("created_at");
  CREATE INDEX "energy_tariffs_rels_order_idx" ON "energy_tariffs_rels" USING btree ("order");
  CREATE INDEX "energy_tariffs_rels_parent_idx" ON "energy_tariffs_rels" USING btree ("parent_id");
  CREATE INDEX "energy_tariffs_rels_path_idx" ON "energy_tariffs_rels" USING btree ("path");
  CREATE INDEX "energy_tariffs_rels_admins_id_idx" ON "energy_tariffs_rels" USING btree ("admins_id");
  CREATE INDEX "energy_tariffs_rels_users_id_idx" ON "energy_tariffs_rels" USING btree ("users_id");
  CREATE INDEX "_energy_tariffs_v_parent_idx" ON "_energy_tariffs_v" USING btree ("parent_id");
  CREATE INDEX "_energy_tariffs_v_version_version_solar_owner_idx" ON "_energy_tariffs_v" USING btree ("version_solar_owner_id");
  CREATE INDEX "_energy_tariffs_v_version_version_system_idx" ON "_energy_tariffs_v" USING btree ("version_system_id");
  CREATE INDEX "_energy_tariffs_v_version_version_active_from_idx" ON "_energy_tariffs_v" USING btree ("version_active_from");
  CREATE INDEX "_energy_tariffs_v_version_version_active_to_idx" ON "_energy_tariffs_v" USING btree ("version_active_to");
  CREATE INDEX "_energy_tariffs_v_version_version_status_idx" ON "_energy_tariffs_v" USING btree ("version_status");
  CREATE INDEX "_energy_tariffs_v_version_version_updated_at_idx" ON "_energy_tariffs_v" USING btree ("version_updated_at");
  CREATE INDEX "_energy_tariffs_v_version_version_created_at_idx" ON "_energy_tariffs_v" USING btree ("version_created_at");
  CREATE INDEX "_energy_tariffs_v_created_at_idx" ON "_energy_tariffs_v" USING btree ("created_at");
  CREATE INDEX "_energy_tariffs_v_updated_at_idx" ON "_energy_tariffs_v" USING btree ("updated_at");
  CREATE INDEX "_energy_tariffs_v_rels_order_idx" ON "_energy_tariffs_v_rels" USING btree ("order");
  CREATE INDEX "_energy_tariffs_v_rels_parent_idx" ON "_energy_tariffs_v_rels" USING btree ("parent_id");
  CREATE INDEX "_energy_tariffs_v_rels_path_idx" ON "_energy_tariffs_v_rels" USING btree ("path");
  CREATE INDEX "_energy_tariffs_v_rels_admins_id_idx" ON "_energy_tariffs_v_rels" USING btree ("admins_id");
  CREATE INDEX "_energy_tariffs_v_rels_users_id_idx" ON "_energy_tariffs_v_rels" USING btree ("users_id");
  CREATE INDEX "energy_purchase_packages_solar_owner_idx" ON "energy_purchase_packages" USING btree ("solar_owner_id");
  CREATE INDEX "energy_purchase_packages_system_idx" ON "energy_purchase_packages" USING btree ("system_id");
  CREATE INDEX "energy_purchase_packages_active_idx" ON "energy_purchase_packages" USING btree ("active");
  CREATE INDEX "energy_purchase_packages_updated_at_idx" ON "energy_purchase_packages" USING btree ("updated_at");
  CREATE INDEX "energy_purchase_packages_created_at_idx" ON "energy_purchase_packages" USING btree ("created_at");
  CREATE INDEX "energy_purchase_packages_rels_order_idx" ON "energy_purchase_packages_rels" USING btree ("order");
  CREATE INDEX "energy_purchase_packages_rels_parent_idx" ON "energy_purchase_packages_rels" USING btree ("parent_id");
  CREATE INDEX "energy_purchase_packages_rels_path_idx" ON "energy_purchase_packages_rels" USING btree ("path");
  CREATE INDEX "energy_purchase_packages_rels_admins_id_idx" ON "energy_purchase_packages_rels" USING btree ("admins_id");
  CREATE INDEX "energy_purchase_packages_rels_users_id_idx" ON "energy_purchase_packages_rels" USING btree ("users_id");
  CREATE INDEX "_energy_purchase_packages_v_parent_idx" ON "_energy_purchase_packages_v" USING btree ("parent_id");
  CREATE INDEX "_energy_purchase_packages_v_version_version_solar_owner_idx" ON "_energy_purchase_packages_v" USING btree ("version_solar_owner_id");
  CREATE INDEX "_energy_purchase_packages_v_version_version_system_idx" ON "_energy_purchase_packages_v" USING btree ("version_system_id");
  CREATE INDEX "_energy_purchase_packages_v_version_version_active_idx" ON "_energy_purchase_packages_v" USING btree ("version_active");
  CREATE INDEX "_energy_purchase_packages_v_version_version_updated_at_idx" ON "_energy_purchase_packages_v" USING btree ("version_updated_at");
  CREATE INDEX "_energy_purchase_packages_v_version_version_created_at_idx" ON "_energy_purchase_packages_v" USING btree ("version_created_at");
  CREATE INDEX "_energy_purchase_packages_v_created_at_idx" ON "_energy_purchase_packages_v" USING btree ("created_at");
  CREATE INDEX "_energy_purchase_packages_v_updated_at_idx" ON "_energy_purchase_packages_v" USING btree ("updated_at");
  CREATE INDEX "_energy_purchase_packages_v_rels_order_idx" ON "_energy_purchase_packages_v_rels" USING btree ("order");
  CREATE INDEX "_energy_purchase_packages_v_rels_parent_idx" ON "_energy_purchase_packages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_energy_purchase_packages_v_rels_path_idx" ON "_energy_purchase_packages_v_rels" USING btree ("path");
  CREATE INDEX "_energy_purchase_packages_v_rels_admins_id_idx" ON "_energy_purchase_packages_v_rels" USING btree ("admins_id");
  CREATE INDEX "_energy_purchase_packages_v_rels_users_id_idx" ON "_energy_purchase_packages_v_rels" USING btree ("users_id");
  CREATE INDEX "payment_transactions_customer_idx" ON "payment_transactions" USING btree ("customer_id");
  CREATE INDEX "payment_transactions_solar_owner_idx" ON "payment_transactions" USING btree ("solar_owner_id");
  CREATE INDEX "payment_transactions_relationship_idx" ON "payment_transactions" USING btree ("relationship_id");
  CREATE INDEX "payment_transactions_system_idx" ON "payment_transactions" USING btree ("system_id");
  CREATE INDEX "payment_transactions_purchase_package_idx" ON "payment_transactions" USING btree ("purchase_package_id");
  CREATE UNIQUE INDEX "payment_transactions_reference_idx" ON "payment_transactions" USING btree ("reference");
  CREATE INDEX "payment_transactions_provider_reference_idx" ON "payment_transactions" USING btree ("provider_reference");
  CREATE INDEX "payment_transactions_status_idx" ON "payment_transactions" USING btree ("status");
  CREATE INDEX "payment_transactions_initiated_at_idx" ON "payment_transactions" USING btree ("initiated_at");
  CREATE INDEX "payment_transactions_last_verified_at_idx" ON "payment_transactions" USING btree ("last_verified_at");
  CREATE INDEX "payment_transactions_updated_at_idx" ON "payment_transactions" USING btree ("updated_at");
  CREATE INDEX "payment_transactions_created_at_idx" ON "payment_transactions" USING btree ("created_at");
  CREATE INDEX "payment_transactions_rels_order_idx" ON "payment_transactions_rels" USING btree ("order");
  CREATE INDEX "payment_transactions_rels_parent_idx" ON "payment_transactions_rels" USING btree ("parent_id");
  CREATE INDEX "payment_transactions_rels_path_idx" ON "payment_transactions_rels" USING btree ("path");
  CREATE INDEX "payment_transactions_rels_admins_id_idx" ON "payment_transactions_rels" USING btree ("admins_id");
  CREATE INDEX "payment_transactions_rels_users_id_idx" ON "payment_transactions_rels" USING btree ("users_id");
  CREATE INDEX "_payment_transactions_v_parent_idx" ON "_payment_transactions_v" USING btree ("parent_id");
  CREATE INDEX "_payment_transactions_v_version_version_customer_idx" ON "_payment_transactions_v" USING btree ("version_customer_id");
  CREATE INDEX "_payment_transactions_v_version_version_solar_owner_idx" ON "_payment_transactions_v" USING btree ("version_solar_owner_id");
  CREATE INDEX "_payment_transactions_v_version_version_relationship_idx" ON "_payment_transactions_v" USING btree ("version_relationship_id");
  CREATE INDEX "_payment_transactions_v_version_version_system_idx" ON "_payment_transactions_v" USING btree ("version_system_id");
  CREATE INDEX "_payment_transactions_v_version_version_purchase_package_idx" ON "_payment_transactions_v" USING btree ("version_purchase_package_id");
  CREATE INDEX "_payment_transactions_v_version_version_reference_idx" ON "_payment_transactions_v" USING btree ("version_reference");
  CREATE INDEX "_payment_transactions_v_version_version_provider_referen_idx" ON "_payment_transactions_v" USING btree ("version_provider_reference");
  CREATE INDEX "_payment_transactions_v_version_version_status_idx" ON "_payment_transactions_v" USING btree ("version_status");
  CREATE INDEX "_payment_transactions_v_version_version_initiated_at_idx" ON "_payment_transactions_v" USING btree ("version_initiated_at");
  CREATE INDEX "_payment_transactions_v_version_version_last_verified_at_idx" ON "_payment_transactions_v" USING btree ("version_last_verified_at");
  CREATE INDEX "_payment_transactions_v_version_version_updated_at_idx" ON "_payment_transactions_v" USING btree ("version_updated_at");
  CREATE INDEX "_payment_transactions_v_version_version_created_at_idx" ON "_payment_transactions_v" USING btree ("version_created_at");
  CREATE INDEX "_payment_transactions_v_created_at_idx" ON "_payment_transactions_v" USING btree ("created_at");
  CREATE INDEX "_payment_transactions_v_updated_at_idx" ON "_payment_transactions_v" USING btree ("updated_at");
  CREATE INDEX "_payment_transactions_v_rels_order_idx" ON "_payment_transactions_v_rels" USING btree ("order");
  CREATE INDEX "_payment_transactions_v_rels_parent_idx" ON "_payment_transactions_v_rels" USING btree ("parent_id");
  CREATE INDEX "_payment_transactions_v_rels_path_idx" ON "_payment_transactions_v_rels" USING btree ("path");
  CREATE INDEX "_payment_transactions_v_rels_admins_id_idx" ON "_payment_transactions_v_rels" USING btree ("admins_id");
  CREATE INDEX "_payment_transactions_v_rels_users_id_idx" ON "_payment_transactions_v_rels" USING btree ("users_id");
  CREATE UNIQUE INDEX "energy_allocation_requests_payment_idx" ON "energy_allocation_requests" USING btree ("payment_id");
  CREATE INDEX "energy_allocation_requests_customer_idx" ON "energy_allocation_requests" USING btree ("customer_id");
  CREATE INDEX "energy_allocation_requests_solar_owner_idx" ON "energy_allocation_requests" USING btree ("solar_owner_id");
  CREATE INDEX "energy_allocation_requests_relationship_idx" ON "energy_allocation_requests" USING btree ("relationship_id");
  CREATE INDEX "energy_allocation_requests_system_idx" ON "energy_allocation_requests" USING btree ("system_id");
  CREATE INDEX "energy_allocation_requests_status_idx" ON "energy_allocation_requests" USING btree ("status");
  CREATE INDEX "energy_allocation_requests_requested_at_idx" ON "energy_allocation_requests" USING btree ("requested_at");
  CREATE INDEX "energy_allocation_requests_updated_at_idx" ON "energy_allocation_requests" USING btree ("updated_at");
  CREATE INDEX "energy_allocation_requests_created_at_idx" ON "energy_allocation_requests" USING btree ("created_at");
  CREATE INDEX "energy_allocation_requests_rels_order_idx" ON "energy_allocation_requests_rels" USING btree ("order");
  CREATE INDEX "energy_allocation_requests_rels_parent_idx" ON "energy_allocation_requests_rels" USING btree ("parent_id");
  CREATE INDEX "energy_allocation_requests_rels_path_idx" ON "energy_allocation_requests_rels" USING btree ("path");
  CREATE INDEX "energy_allocation_requests_rels_admins_id_idx" ON "energy_allocation_requests_rels" USING btree ("admins_id");
  CREATE INDEX "energy_allocation_requests_rels_users_id_idx" ON "energy_allocation_requests_rels" USING btree ("users_id");
  CREATE INDEX "_energy_allocation_requests_v_parent_idx" ON "_energy_allocation_requests_v" USING btree ("parent_id");
  CREATE INDEX "_energy_allocation_requests_v_version_version_payment_idx" ON "_energy_allocation_requests_v" USING btree ("version_payment_id");
  CREATE INDEX "_energy_allocation_requests_v_version_version_customer_idx" ON "_energy_allocation_requests_v" USING btree ("version_customer_id");
  CREATE INDEX "_energy_allocation_requests_v_version_version_solar_owne_idx" ON "_energy_allocation_requests_v" USING btree ("version_solar_owner_id");
  CREATE INDEX "_energy_allocation_requests_v_version_version_relationsh_idx" ON "_energy_allocation_requests_v" USING btree ("version_relationship_id");
  CREATE INDEX "_energy_allocation_requests_v_version_version_system_idx" ON "_energy_allocation_requests_v" USING btree ("version_system_id");
  CREATE INDEX "_energy_allocation_requests_v_version_version_status_idx" ON "_energy_allocation_requests_v" USING btree ("version_status");
  CREATE INDEX "_energy_allocation_requests_v_version_version_requested__idx" ON "_energy_allocation_requests_v" USING btree ("version_requested_at");
  CREATE INDEX "_energy_allocation_requests_v_version_version_updated_at_idx" ON "_energy_allocation_requests_v" USING btree ("version_updated_at");
  CREATE INDEX "_energy_allocation_requests_v_version_version_created_at_idx" ON "_energy_allocation_requests_v" USING btree ("version_created_at");
  CREATE INDEX "_energy_allocation_requests_v_created_at_idx" ON "_energy_allocation_requests_v" USING btree ("created_at");
  CREATE INDEX "_energy_allocation_requests_v_updated_at_idx" ON "_energy_allocation_requests_v" USING btree ("updated_at");
  CREATE INDEX "_energy_allocation_requests_v_rels_order_idx" ON "_energy_allocation_requests_v_rels" USING btree ("order");
  CREATE INDEX "_energy_allocation_requests_v_rels_parent_idx" ON "_energy_allocation_requests_v_rels" USING btree ("parent_id");
  CREATE INDEX "_energy_allocation_requests_v_rels_path_idx" ON "_energy_allocation_requests_v_rels" USING btree ("path");
  CREATE INDEX "_energy_allocation_requests_v_rels_admins_id_idx" ON "_energy_allocation_requests_v_rels" USING btree ("admins_id");
  CREATE INDEX "_energy_allocation_requests_v_rels_users_id_idx" ON "_energy_allocation_requests_v_rels" USING btree ("users_id");
  CREATE UNIQUE INDEX "energy_allocation_records_request_idx" ON "energy_allocation_records" USING btree ("request_id");
  CREATE UNIQUE INDEX "energy_allocation_records_payment_idx" ON "energy_allocation_records" USING btree ("payment_id");
  CREATE INDEX "energy_allocation_records_customer_idx" ON "energy_allocation_records" USING btree ("customer_id");
  CREATE INDEX "energy_allocation_records_solar_owner_idx" ON "energy_allocation_records" USING btree ("solar_owner_id");
  CREATE INDEX "energy_allocation_records_system_idx" ON "energy_allocation_records" USING btree ("system_id");
  CREATE UNIQUE INDEX "energy_allocation_records_reference_idx" ON "energy_allocation_records" USING btree ("reference");
  CREATE INDEX "energy_allocation_records_approved_at_idx" ON "energy_allocation_records" USING btree ("approved_at");
  CREATE INDEX "energy_allocation_records_updated_at_idx" ON "energy_allocation_records" USING btree ("updated_at");
  CREATE INDEX "energy_allocation_records_created_at_idx" ON "energy_allocation_records" USING btree ("created_at");
  CREATE INDEX "energy_allocation_records_rels_order_idx" ON "energy_allocation_records_rels" USING btree ("order");
  CREATE INDEX "energy_allocation_records_rels_parent_idx" ON "energy_allocation_records_rels" USING btree ("parent_id");
  CREATE INDEX "energy_allocation_records_rels_path_idx" ON "energy_allocation_records_rels" USING btree ("path");
  CREATE INDEX "energy_allocation_records_rels_admins_id_idx" ON "energy_allocation_records_rels" USING btree ("admins_id");
  CREATE INDEX "energy_allocation_records_rels_users_id_idx" ON "energy_allocation_records_rels" USING btree ("users_id");
  CREATE INDEX "_energy_allocation_records_v_parent_idx" ON "_energy_allocation_records_v" USING btree ("parent_id");
  CREATE INDEX "_energy_allocation_records_v_version_version_request_idx" ON "_energy_allocation_records_v" USING btree ("version_request_id");
  CREATE INDEX "_energy_allocation_records_v_version_version_payment_idx" ON "_energy_allocation_records_v" USING btree ("version_payment_id");
  CREATE INDEX "_energy_allocation_records_v_version_version_customer_idx" ON "_energy_allocation_records_v" USING btree ("version_customer_id");
  CREATE INDEX "_energy_allocation_records_v_version_version_solar_owner_idx" ON "_energy_allocation_records_v" USING btree ("version_solar_owner_id");
  CREATE INDEX "_energy_allocation_records_v_version_version_system_idx" ON "_energy_allocation_records_v" USING btree ("version_system_id");
  CREATE INDEX "_energy_allocation_records_v_version_version_reference_idx" ON "_energy_allocation_records_v" USING btree ("version_reference");
  CREATE INDEX "_energy_allocation_records_v_version_version_approved_at_idx" ON "_energy_allocation_records_v" USING btree ("version_approved_at");
  CREATE INDEX "_energy_allocation_records_v_version_version_updated_at_idx" ON "_energy_allocation_records_v" USING btree ("version_updated_at");
  CREATE INDEX "_energy_allocation_records_v_version_version_created_at_idx" ON "_energy_allocation_records_v" USING btree ("version_created_at");
  CREATE INDEX "_energy_allocation_records_v_created_at_idx" ON "_energy_allocation_records_v" USING btree ("created_at");
  CREATE INDEX "_energy_allocation_records_v_updated_at_idx" ON "_energy_allocation_records_v" USING btree ("updated_at");
  CREATE INDEX "_energy_allocation_records_v_rels_order_idx" ON "_energy_allocation_records_v_rels" USING btree ("order");
  CREATE INDEX "_energy_allocation_records_v_rels_parent_idx" ON "_energy_allocation_records_v_rels" USING btree ("parent_id");
  CREATE INDEX "_energy_allocation_records_v_rels_path_idx" ON "_energy_allocation_records_v_rels" USING btree ("path");
  CREATE INDEX "_energy_allocation_records_v_rels_admins_id_idx" ON "_energy_allocation_records_v_rels" USING btree ("admins_id");
  CREATE INDEX "_energy_allocation_records_v_rels_users_id_idx" ON "_energy_allocation_records_v_rels" USING btree ("users_id");
  CREATE INDEX "energy_wallets_customer_idx" ON "energy_wallets" USING btree ("customer_id");
  CREATE INDEX "energy_wallets_solar_owner_idx" ON "energy_wallets" USING btree ("solar_owner_id");
  CREATE UNIQUE INDEX "energy_wallets_relationship_idx" ON "energy_wallets" USING btree ("relationship_id");
  CREATE INDEX "energy_wallets_system_idx" ON "energy_wallets" USING btree ("system_id");
  CREATE INDEX "energy_wallets_updated_at_idx" ON "energy_wallets" USING btree ("updated_at");
  CREATE INDEX "energy_wallets_created_at_idx" ON "energy_wallets" USING btree ("created_at");
  CREATE INDEX "energy_wallets_rels_order_idx" ON "energy_wallets_rels" USING btree ("order");
  CREATE INDEX "energy_wallets_rels_parent_idx" ON "energy_wallets_rels" USING btree ("parent_id");
  CREATE INDEX "energy_wallets_rels_path_idx" ON "energy_wallets_rels" USING btree ("path");
  CREATE INDEX "energy_wallets_rels_admins_id_idx" ON "energy_wallets_rels" USING btree ("admins_id");
  CREATE INDEX "energy_wallets_rels_users_id_idx" ON "energy_wallets_rels" USING btree ("users_id");
  CREATE INDEX "_energy_wallets_v_parent_idx" ON "_energy_wallets_v" USING btree ("parent_id");
  CREATE INDEX "_energy_wallets_v_version_version_customer_idx" ON "_energy_wallets_v" USING btree ("version_customer_id");
  CREATE INDEX "_energy_wallets_v_version_version_solar_owner_idx" ON "_energy_wallets_v" USING btree ("version_solar_owner_id");
  CREATE INDEX "_energy_wallets_v_version_version_relationship_idx" ON "_energy_wallets_v" USING btree ("version_relationship_id");
  CREATE INDEX "_energy_wallets_v_version_version_system_idx" ON "_energy_wallets_v" USING btree ("version_system_id");
  CREATE INDEX "_energy_wallets_v_version_version_updated_at_idx" ON "_energy_wallets_v" USING btree ("version_updated_at");
  CREATE INDEX "_energy_wallets_v_version_version_created_at_idx" ON "_energy_wallets_v" USING btree ("version_created_at");
  CREATE INDEX "_energy_wallets_v_created_at_idx" ON "_energy_wallets_v" USING btree ("created_at");
  CREATE INDEX "_energy_wallets_v_updated_at_idx" ON "_energy_wallets_v" USING btree ("updated_at");
  CREATE INDEX "_energy_wallets_v_rels_order_idx" ON "_energy_wallets_v_rels" USING btree ("order");
  CREATE INDEX "_energy_wallets_v_rels_parent_idx" ON "_energy_wallets_v_rels" USING btree ("parent_id");
  CREATE INDEX "_energy_wallets_v_rels_path_idx" ON "_energy_wallets_v_rels" USING btree ("path");
  CREATE INDEX "_energy_wallets_v_rels_admins_id_idx" ON "_energy_wallets_v_rels" USING btree ("admins_id");
  CREATE INDEX "_energy_wallets_v_rels_users_id_idx" ON "_energy_wallets_v_rels" USING btree ("users_id");
  CREATE INDEX "energy_ledger_entries_customer_idx" ON "energy_ledger_entries" USING btree ("customer_id");
  CREATE INDEX "energy_ledger_entries_solar_owner_idx" ON "energy_ledger_entries" USING btree ("solar_owner_id");
  CREATE INDEX "energy_ledger_entries_system_idx" ON "energy_ledger_entries" USING btree ("system_id");
  CREATE INDEX "energy_ledger_entries_wallet_idx" ON "energy_ledger_entries" USING btree ("wallet_id");
  CREATE INDEX "energy_ledger_entries_account_type_idx" ON "energy_ledger_entries" USING btree ("account_type");
  CREATE INDEX "energy_ledger_entries_allocation_idx" ON "energy_ledger_entries" USING btree ("allocation_id");
  CREATE INDEX "energy_ledger_entries_consumption_idx" ON "energy_ledger_entries" USING btree ("consumption_id");
  CREATE UNIQUE INDEX "energy_ledger_entries_idempotency_key_idx" ON "energy_ledger_entries" USING btree ("idempotency_key");
  CREATE INDEX "energy_ledger_entries_recorded_at_idx" ON "energy_ledger_entries" USING btree ("recorded_at");
  CREATE INDEX "energy_ledger_entries_updated_at_idx" ON "energy_ledger_entries" USING btree ("updated_at");
  CREATE INDEX "energy_ledger_entries_created_at_idx" ON "energy_ledger_entries" USING btree ("created_at");
  CREATE INDEX "energy_ledger_entries_rels_order_idx" ON "energy_ledger_entries_rels" USING btree ("order");
  CREATE INDEX "energy_ledger_entries_rels_parent_idx" ON "energy_ledger_entries_rels" USING btree ("parent_id");
  CREATE INDEX "energy_ledger_entries_rels_path_idx" ON "energy_ledger_entries_rels" USING btree ("path");
  CREATE INDEX "energy_ledger_entries_rels_admins_id_idx" ON "energy_ledger_entries_rels" USING btree ("admins_id");
  CREATE INDEX "energy_ledger_entries_rels_users_id_idx" ON "energy_ledger_entries_rels" USING btree ("users_id");
  CREATE INDEX "_energy_ledger_entries_v_parent_idx" ON "_energy_ledger_entries_v" USING btree ("parent_id");
  CREATE INDEX "_energy_ledger_entries_v_version_version_customer_idx" ON "_energy_ledger_entries_v" USING btree ("version_customer_id");
  CREATE INDEX "_energy_ledger_entries_v_version_version_solar_owner_idx" ON "_energy_ledger_entries_v" USING btree ("version_solar_owner_id");
  CREATE INDEX "_energy_ledger_entries_v_version_version_system_idx" ON "_energy_ledger_entries_v" USING btree ("version_system_id");
  CREATE INDEX "_energy_ledger_entries_v_version_version_wallet_idx" ON "_energy_ledger_entries_v" USING btree ("version_wallet_id");
  CREATE INDEX "_energy_ledger_entries_v_version_version_account_type_idx" ON "_energy_ledger_entries_v" USING btree ("version_account_type");
  CREATE INDEX "_energy_ledger_entries_v_version_version_allocation_idx" ON "_energy_ledger_entries_v" USING btree ("version_allocation_id");
  CREATE INDEX "_energy_ledger_entries_v_version_version_consumption_idx" ON "_energy_ledger_entries_v" USING btree ("version_consumption_id");
  CREATE INDEX "_energy_ledger_entries_v_version_version_idempotency_key_idx" ON "_energy_ledger_entries_v" USING btree ("version_idempotency_key");
  CREATE INDEX "_energy_ledger_entries_v_version_version_recorded_at_idx" ON "_energy_ledger_entries_v" USING btree ("version_recorded_at");
  CREATE INDEX "_energy_ledger_entries_v_version_version_updated_at_idx" ON "_energy_ledger_entries_v" USING btree ("version_updated_at");
  CREATE INDEX "_energy_ledger_entries_v_version_version_created_at_idx" ON "_energy_ledger_entries_v" USING btree ("version_created_at");
  CREATE INDEX "_energy_ledger_entries_v_created_at_idx" ON "_energy_ledger_entries_v" USING btree ("created_at");
  CREATE INDEX "_energy_ledger_entries_v_updated_at_idx" ON "_energy_ledger_entries_v" USING btree ("updated_at");
  CREATE INDEX "_energy_ledger_entries_v_rels_order_idx" ON "_energy_ledger_entries_v_rels" USING btree ("order");
  CREATE INDEX "_energy_ledger_entries_v_rels_parent_idx" ON "_energy_ledger_entries_v_rels" USING btree ("parent_id");
  CREATE INDEX "_energy_ledger_entries_v_rels_path_idx" ON "_energy_ledger_entries_v_rels" USING btree ("path");
  CREATE INDEX "_energy_ledger_entries_v_rels_admins_id_idx" ON "_energy_ledger_entries_v_rels" USING btree ("admins_id");
  CREATE INDEX "_energy_ledger_entries_v_rels_users_id_idx" ON "_energy_ledger_entries_v_rels" USING btree ("users_id");
  CREATE INDEX "meter_registrations_customer_idx" ON "meter_registrations" USING btree ("customer_id");
  CREATE INDEX "meter_registrations_solar_owner_idx" ON "meter_registrations" USING btree ("solar_owner_id");
  CREATE UNIQUE INDEX "meter_registrations_relationship_idx" ON "meter_registrations" USING btree ("relationship_id");
  CREATE INDEX "meter_registrations_system_idx" ON "meter_registrations" USING btree ("system_id");
  CREATE UNIQUE INDEX "meter_registrations_meter_identifier_idx" ON "meter_registrations" USING btree ("meter_identifier");
  CREATE INDEX "meter_registrations_status_idx" ON "meter_registrations" USING btree ("status");
  CREATE INDEX "meter_registrations_last_reading_at_idx" ON "meter_registrations" USING btree ("last_reading_at");
  CREATE INDEX "meter_registrations_updated_at_idx" ON "meter_registrations" USING btree ("updated_at");
  CREATE INDEX "meter_registrations_created_at_idx" ON "meter_registrations" USING btree ("created_at");
  CREATE INDEX "meter_registrations_rels_order_idx" ON "meter_registrations_rels" USING btree ("order");
  CREATE INDEX "meter_registrations_rels_parent_idx" ON "meter_registrations_rels" USING btree ("parent_id");
  CREATE INDEX "meter_registrations_rels_path_idx" ON "meter_registrations_rels" USING btree ("path");
  CREATE INDEX "meter_registrations_rels_admins_id_idx" ON "meter_registrations_rels" USING btree ("admins_id");
  CREATE INDEX "meter_registrations_rels_users_id_idx" ON "meter_registrations_rels" USING btree ("users_id");
  CREATE INDEX "_meter_registrations_v_parent_idx" ON "_meter_registrations_v" USING btree ("parent_id");
  CREATE INDEX "_meter_registrations_v_version_version_customer_idx" ON "_meter_registrations_v" USING btree ("version_customer_id");
  CREATE INDEX "_meter_registrations_v_version_version_solar_owner_idx" ON "_meter_registrations_v" USING btree ("version_solar_owner_id");
  CREATE INDEX "_meter_registrations_v_version_version_relationship_idx" ON "_meter_registrations_v" USING btree ("version_relationship_id");
  CREATE INDEX "_meter_registrations_v_version_version_system_idx" ON "_meter_registrations_v" USING btree ("version_system_id");
  CREATE INDEX "_meter_registrations_v_version_version_meter_identifier_idx" ON "_meter_registrations_v" USING btree ("version_meter_identifier");
  CREATE INDEX "_meter_registrations_v_version_version_status_idx" ON "_meter_registrations_v" USING btree ("version_status");
  CREATE INDEX "_meter_registrations_v_version_version_last_reading_at_idx" ON "_meter_registrations_v" USING btree ("version_last_reading_at");
  CREATE INDEX "_meter_registrations_v_version_version_updated_at_idx" ON "_meter_registrations_v" USING btree ("version_updated_at");
  CREATE INDEX "_meter_registrations_v_version_version_created_at_idx" ON "_meter_registrations_v" USING btree ("version_created_at");
  CREATE INDEX "_meter_registrations_v_created_at_idx" ON "_meter_registrations_v" USING btree ("created_at");
  CREATE INDEX "_meter_registrations_v_updated_at_idx" ON "_meter_registrations_v" USING btree ("updated_at");
  CREATE INDEX "_meter_registrations_v_rels_order_idx" ON "_meter_registrations_v_rels" USING btree ("order");
  CREATE INDEX "_meter_registrations_v_rels_parent_idx" ON "_meter_registrations_v_rels" USING btree ("parent_id");
  CREATE INDEX "_meter_registrations_v_rels_path_idx" ON "_meter_registrations_v_rels" USING btree ("path");
  CREATE INDEX "_meter_registrations_v_rels_admins_id_idx" ON "_meter_registrations_v_rels" USING btree ("admins_id");
  CREATE INDEX "_meter_registrations_v_rels_users_id_idx" ON "_meter_registrations_v_rels" USING btree ("users_id");
  CREATE INDEX "meter_readings_meter_idx" ON "meter_readings" USING btree ("meter_id");
  CREATE INDEX "meter_readings_customer_idx" ON "meter_readings" USING btree ("customer_id");
  CREATE INDEX "meter_readings_solar_owner_idx" ON "meter_readings" USING btree ("solar_owner_id");
  CREATE INDEX "meter_readings_system_idx" ON "meter_readings" USING btree ("system_id");
  CREATE INDEX "meter_readings_measured_at_idx" ON "meter_readings" USING btree ("measured_at");
  CREATE UNIQUE INDEX "meter_readings_dedupe_key_idx" ON "meter_readings" USING btree ("dedupe_key");
  CREATE INDEX "meter_readings_status_idx" ON "meter_readings" USING btree ("status");
  CREATE INDEX "meter_readings_updated_at_idx" ON "meter_readings" USING btree ("updated_at");
  CREATE INDEX "meter_readings_created_at_idx" ON "meter_readings" USING btree ("created_at");
  CREATE INDEX "meter_readings_rels_order_idx" ON "meter_readings_rels" USING btree ("order");
  CREATE INDEX "meter_readings_rels_parent_idx" ON "meter_readings_rels" USING btree ("parent_id");
  CREATE INDEX "meter_readings_rels_path_idx" ON "meter_readings_rels" USING btree ("path");
  CREATE INDEX "meter_readings_rels_admins_id_idx" ON "meter_readings_rels" USING btree ("admins_id");
  CREATE INDEX "meter_readings_rels_users_id_idx" ON "meter_readings_rels" USING btree ("users_id");
  CREATE INDEX "_meter_readings_v_parent_idx" ON "_meter_readings_v" USING btree ("parent_id");
  CREATE INDEX "_meter_readings_v_version_version_meter_idx" ON "_meter_readings_v" USING btree ("version_meter_id");
  CREATE INDEX "_meter_readings_v_version_version_customer_idx" ON "_meter_readings_v" USING btree ("version_customer_id");
  CREATE INDEX "_meter_readings_v_version_version_solar_owner_idx" ON "_meter_readings_v" USING btree ("version_solar_owner_id");
  CREATE INDEX "_meter_readings_v_version_version_system_idx" ON "_meter_readings_v" USING btree ("version_system_id");
  CREATE INDEX "_meter_readings_v_version_version_measured_at_idx" ON "_meter_readings_v" USING btree ("version_measured_at");
  CREATE INDEX "_meter_readings_v_version_version_dedupe_key_idx" ON "_meter_readings_v" USING btree ("version_dedupe_key");
  CREATE INDEX "_meter_readings_v_version_version_status_idx" ON "_meter_readings_v" USING btree ("version_status");
  CREATE INDEX "_meter_readings_v_version_version_updated_at_idx" ON "_meter_readings_v" USING btree ("version_updated_at");
  CREATE INDEX "_meter_readings_v_version_version_created_at_idx" ON "_meter_readings_v" USING btree ("version_created_at");
  CREATE INDEX "_meter_readings_v_created_at_idx" ON "_meter_readings_v" USING btree ("created_at");
  CREATE INDEX "_meter_readings_v_updated_at_idx" ON "_meter_readings_v" USING btree ("updated_at");
  CREATE INDEX "_meter_readings_v_rels_order_idx" ON "_meter_readings_v_rels" USING btree ("order");
  CREATE INDEX "_meter_readings_v_rels_parent_idx" ON "_meter_readings_v_rels" USING btree ("parent_id");
  CREATE INDEX "_meter_readings_v_rels_path_idx" ON "_meter_readings_v_rels" USING btree ("path");
  CREATE INDEX "_meter_readings_v_rels_admins_id_idx" ON "_meter_readings_v_rels" USING btree ("admins_id");
  CREATE INDEX "_meter_readings_v_rels_users_id_idx" ON "_meter_readings_v_rels" USING btree ("users_id");
  CREATE INDEX "consumption_records_customer_idx" ON "consumption_records" USING btree ("customer_id");
  CREATE INDEX "consumption_records_solar_owner_idx" ON "consumption_records" USING btree ("solar_owner_id");
  CREATE INDEX "consumption_records_system_idx" ON "consumption_records" USING btree ("system_id");
  CREATE INDEX "consumption_records_wallet_idx" ON "consumption_records" USING btree ("wallet_id");
  CREATE INDEX "consumption_records_meter_idx" ON "consumption_records" USING btree ("meter_id");
  CREATE UNIQUE INDEX "consumption_records_reading_idx" ON "consumption_records" USING btree ("reading_id");
  CREATE INDEX "consumption_records_status_idx" ON "consumption_records" USING btree ("status");
  CREATE INDEX "consumption_records_recorded_at_idx" ON "consumption_records" USING btree ("recorded_at");
  CREATE INDEX "consumption_records_updated_at_idx" ON "consumption_records" USING btree ("updated_at");
  CREATE INDEX "consumption_records_created_at_idx" ON "consumption_records" USING btree ("created_at");
  CREATE INDEX "consumption_records_rels_order_idx" ON "consumption_records_rels" USING btree ("order");
  CREATE INDEX "consumption_records_rels_parent_idx" ON "consumption_records_rels" USING btree ("parent_id");
  CREATE INDEX "consumption_records_rels_path_idx" ON "consumption_records_rels" USING btree ("path");
  CREATE INDEX "consumption_records_rels_admins_id_idx" ON "consumption_records_rels" USING btree ("admins_id");
  CREATE INDEX "consumption_records_rels_users_id_idx" ON "consumption_records_rels" USING btree ("users_id");
  CREATE INDEX "_consumption_records_v_parent_idx" ON "_consumption_records_v" USING btree ("parent_id");
  CREATE INDEX "_consumption_records_v_version_version_customer_idx" ON "_consumption_records_v" USING btree ("version_customer_id");
  CREATE INDEX "_consumption_records_v_version_version_solar_owner_idx" ON "_consumption_records_v" USING btree ("version_solar_owner_id");
  CREATE INDEX "_consumption_records_v_version_version_system_idx" ON "_consumption_records_v" USING btree ("version_system_id");
  CREATE INDEX "_consumption_records_v_version_version_wallet_idx" ON "_consumption_records_v" USING btree ("version_wallet_id");
  CREATE INDEX "_consumption_records_v_version_version_meter_idx" ON "_consumption_records_v" USING btree ("version_meter_id");
  CREATE INDEX "_consumption_records_v_version_version_reading_idx" ON "_consumption_records_v" USING btree ("version_reading_id");
  CREATE INDEX "_consumption_records_v_version_version_status_idx" ON "_consumption_records_v" USING btree ("version_status");
  CREATE INDEX "_consumption_records_v_version_version_recorded_at_idx" ON "_consumption_records_v" USING btree ("version_recorded_at");
  CREATE INDEX "_consumption_records_v_version_version_updated_at_idx" ON "_consumption_records_v" USING btree ("version_updated_at");
  CREATE INDEX "_consumption_records_v_version_version_created_at_idx" ON "_consumption_records_v" USING btree ("version_created_at");
  CREATE INDEX "_consumption_records_v_created_at_idx" ON "_consumption_records_v" USING btree ("created_at");
  CREATE INDEX "_consumption_records_v_updated_at_idx" ON "_consumption_records_v" USING btree ("updated_at");
  CREATE INDEX "_consumption_records_v_rels_order_idx" ON "_consumption_records_v_rels" USING btree ("order");
  CREATE INDEX "_consumption_records_v_rels_parent_idx" ON "_consumption_records_v_rels" USING btree ("parent_id");
  CREATE INDEX "_consumption_records_v_rels_path_idx" ON "_consumption_records_v_rels" USING btree ("path");
  CREATE INDEX "_consumption_records_v_rels_admins_id_idx" ON "_consumption_records_v_rels" USING btree ("admins_id");
  CREATE INDEX "_consumption_records_v_rels_users_id_idx" ON "_consumption_records_v_rels" USING btree ("users_id");
  CREATE INDEX "media__h_folders_idx" ON "media" USING btree ("_h_folders_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_original_original_filename_idx" ON "media" USING btree ("original_filename");
  CREATE INDEX "media_rels_order_idx" ON "media_rels" USING btree ("order");
  CREATE INDEX "media_rels_parent_idx" ON "media_rels" USING btree ("parent_id");
  CREATE INDEX "media_rels_path_idx" ON "media_rels" USING btree ("path");
  CREATE INDEX "media_rels_tags_id_idx" ON "media_rels" USING btree ("tags_id");
  CREATE INDEX "media_rels_admins_id_idx" ON "media_rels" USING btree ("admins_id");
  CREATE INDEX "media_rels_users_id_idx" ON "media_rels" USING btree ("users_id");
  CREATE INDEX "_media_v_parent_idx" ON "_media_v" USING btree ("parent_id");
  CREATE INDEX "_media_v_version_version__h_folders_idx" ON "_media_v" USING btree ("version__h_folders_id");
  CREATE INDEX "_media_v_version_version_updated_at_idx" ON "_media_v" USING btree ("version_updated_at");
  CREATE INDEX "_media_v_version_version_created_at_idx" ON "_media_v" USING btree ("version_created_at");
  CREATE INDEX "_media_v_version_version_filename_idx" ON "_media_v" USING btree ("version_filename");
  CREATE INDEX "_media_v_version_original_version_original_filename_idx" ON "_media_v" USING btree ("version_original_filename");
  CREATE INDEX "_media_v_created_at_idx" ON "_media_v" USING btree ("created_at");
  CREATE INDEX "_media_v_updated_at_idx" ON "_media_v" USING btree ("updated_at");
  CREATE INDEX "_media_v_rels_order_idx" ON "_media_v_rels" USING btree ("order");
  CREATE INDEX "_media_v_rels_parent_idx" ON "_media_v_rels" USING btree ("parent_id");
  CREATE INDEX "_media_v_rels_path_idx" ON "_media_v_rels" USING btree ("path");
  CREATE INDEX "_media_v_rels_tags_id_idx" ON "_media_v_rels" USING btree ("tags_id");
  CREATE INDEX "_media_v_rels_admins_id_idx" ON "_media_v_rels" USING btree ("admins_id");
  CREATE INDEX "_media_v_rels_users_id_idx" ON "_media_v_rels" USING btree ("users_id");
  CREATE INDEX "folders__h_folders_idx" ON "folders" USING btree ("_h_folders_id");
  CREATE INDEX "folders_updated_at_idx" ON "folders" USING btree ("updated_at");
  CREATE INDEX "folders_created_at_idx" ON "folders" USING btree ("created_at");
  CREATE INDEX "folders_rels_order_idx" ON "folders_rels" USING btree ("order");
  CREATE INDEX "folders_rels_parent_idx" ON "folders_rels" USING btree ("parent_id");
  CREATE INDEX "folders_rels_path_idx" ON "folders_rels" USING btree ("path");
  CREATE INDEX "folders_rels_admins_id_idx" ON "folders_rels" USING btree ("admins_id");
  CREATE INDEX "folders_rels_users_id_idx" ON "folders_rels" USING btree ("users_id");
  CREATE INDEX "_folders_v_parent_idx" ON "_folders_v" USING btree ("parent_id");
  CREATE INDEX "_folders_v_version_version__h_folders_idx" ON "_folders_v" USING btree ("version__h_folders_id");
  CREATE INDEX "_folders_v_version_version_updated_at_idx" ON "_folders_v" USING btree ("version_updated_at");
  CREATE INDEX "_folders_v_version_version_created_at_idx" ON "_folders_v" USING btree ("version_created_at");
  CREATE INDEX "_folders_v_created_at_idx" ON "_folders_v" USING btree ("created_at");
  CREATE INDEX "_folders_v_updated_at_idx" ON "_folders_v" USING btree ("updated_at");
  CREATE INDEX "_folders_v_rels_order_idx" ON "_folders_v_rels" USING btree ("order");
  CREATE INDEX "_folders_v_rels_parent_idx" ON "_folders_v_rels" USING btree ("parent_id");
  CREATE INDEX "_folders_v_rels_path_idx" ON "_folders_v_rels" USING btree ("path");
  CREATE INDEX "_folders_v_rels_admins_id_idx" ON "_folders_v_rels" USING btree ("admins_id");
  CREATE INDEX "_folders_v_rels_users_id_idx" ON "_folders_v_rels" USING btree ("users_id");
  CREATE INDEX "tags__h_tags_idx" ON "tags" USING btree ("_h_tags_id");
  CREATE INDEX "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
  CREATE INDEX "tags_created_at_idx" ON "tags" USING btree ("created_at");
  CREATE INDEX "tags_rels_order_idx" ON "tags_rels" USING btree ("order");
  CREATE INDEX "tags_rels_parent_idx" ON "tags_rels" USING btree ("parent_id");
  CREATE INDEX "tags_rels_path_idx" ON "tags_rels" USING btree ("path");
  CREATE INDEX "tags_rels_admins_id_idx" ON "tags_rels" USING btree ("admins_id");
  CREATE INDEX "tags_rels_users_id_idx" ON "tags_rels" USING btree ("users_id");
  CREATE INDEX "_tags_v_parent_idx" ON "_tags_v" USING btree ("parent_id");
  CREATE INDEX "_tags_v_version_version__h_tags_idx" ON "_tags_v" USING btree ("version__h_tags_id");
  CREATE INDEX "_tags_v_version_version_updated_at_idx" ON "_tags_v" USING btree ("version_updated_at");
  CREATE INDEX "_tags_v_version_version_created_at_idx" ON "_tags_v" USING btree ("version_created_at");
  CREATE INDEX "_tags_v_created_at_idx" ON "_tags_v" USING btree ("created_at");
  CREATE INDEX "_tags_v_updated_at_idx" ON "_tags_v" USING btree ("updated_at");
  CREATE INDEX "_tags_v_rels_order_idx" ON "_tags_v_rels" USING btree ("order");
  CREATE INDEX "_tags_v_rels_parent_idx" ON "_tags_v_rels" USING btree ("parent_id");
  CREATE INDEX "_tags_v_rels_path_idx" ON "_tags_v_rels" USING btree ("path");
  CREATE INDEX "_tags_v_rels_admins_id_idx" ON "_tags_v_rels" USING btree ("admins_id");
  CREATE INDEX "_tags_v_rels_users_id_idx" ON "_tags_v_rels" USING btree ("users_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_admins_id_idx" ON "payload_locked_documents_rels" USING btree ("admins_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_profile_images_id_idx" ON "payload_locked_documents_rels" USING btree ("profile_images_id");
  CREATE INDEX "payload_locked_documents_rels_solar_systems_id_idx" ON "payload_locked_documents_rels" USING btree ("solar_systems_id");
  CREATE INDEX "payload_locked_documents_rels_energy_records_id_idx" ON "payload_locked_documents_rels" USING btree ("energy_records_id");
  CREATE INDEX "payload_locked_documents_rels_sharing_records_id_idx" ON "payload_locked_documents_rels" USING btree ("sharing_records_id");
  CREATE INDEX "payload_locked_documents_rels_app_notifications_id_idx" ON "payload_locked_documents_rels" USING btree ("app_notifications_id");
  CREATE INDEX "payload_locked_documents_rels_system_alerts_id_idx" ON "payload_locked_documents_rels" USING btree ("system_alerts_id");
  CREATE INDEX "payload_locked_documents_rels_telemetry_ingestion_events_idx" ON "payload_locked_documents_rels" USING btree ("telemetry_ingestion_events_id");
  CREATE INDEX "payload_locked_documents_rels_solar_owner_applications_i_idx" ON "payload_locked_documents_rels" USING btree ("solar_owner_applications_id");
  CREATE INDEX "payload_locked_documents_rels_solar_owner_profiles_id_idx" ON "payload_locked_documents_rels" USING btree ("solar_owner_profiles_id");
  CREATE INDEX "payload_locked_documents_rels_customer_profiles_id_idx" ON "payload_locked_documents_rels" USING btree ("customer_profiles_id");
  CREATE INDEX "payload_locked_documents_rels_customer_relationships_id_idx" ON "payload_locked_documents_rels" USING btree ("customer_relationships_id");
  CREATE INDEX "payload_locked_documents_rels_energy_tariffs_id_idx" ON "payload_locked_documents_rels" USING btree ("energy_tariffs_id");
  CREATE INDEX "payload_locked_documents_rels_energy_purchase_packages_i_idx" ON "payload_locked_documents_rels" USING btree ("energy_purchase_packages_id");
  CREATE INDEX "payload_locked_documents_rels_payment_transactions_id_idx" ON "payload_locked_documents_rels" USING btree ("payment_transactions_id");
  CREATE INDEX "payload_locked_documents_rels_energy_allocation_requests_idx" ON "payload_locked_documents_rels" USING btree ("energy_allocation_requests_id");
  CREATE INDEX "payload_locked_documents_rels_energy_allocation_records__idx" ON "payload_locked_documents_rels" USING btree ("energy_allocation_records_id");
  CREATE INDEX "payload_locked_documents_rels_energy_wallets_id_idx" ON "payload_locked_documents_rels" USING btree ("energy_wallets_id");
  CREATE INDEX "payload_locked_documents_rels_energy_ledger_entries_id_idx" ON "payload_locked_documents_rels" USING btree ("energy_ledger_entries_id");
  CREATE INDEX "payload_locked_documents_rels_meter_registrations_id_idx" ON "payload_locked_documents_rels" USING btree ("meter_registrations_id");
  CREATE INDEX "payload_locked_documents_rels_meter_readings_id_idx" ON "payload_locked_documents_rels" USING btree ("meter_readings_id");
  CREATE INDEX "payload_locked_documents_rels_consumption_records_id_idx" ON "payload_locked_documents_rels" USING btree ("consumption_records_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_folders_id_idx" ON "payload_locked_documents_rels" USING btree ("folders_id");
  CREATE INDEX "payload_locked_documents_rels_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tags_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_admins_id_idx" ON "payload_preferences_rels" USING btree ("admins_id");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "payload_llm_instructions_entity_slug_idx" ON "payload_llm_instructions" USING btree ("entity_slug");
  CREATE INDEX "payload_llm_instructions_updated_at_idx" ON "payload_llm_instructions" USING btree ("updated_at");
  CREATE INDEX "payload_llm_instructions_created_at_idx" ON "payload_llm_instructions" USING btree ("created_at");
  CREATE INDEX "payload_llm_instructions_rels_order_idx" ON "payload_llm_instructions_rels" USING btree ("order");
  CREATE INDEX "payload_llm_instructions_rels_parent_idx" ON "payload_llm_instructions_rels" USING btree ("parent_id");
  CREATE INDEX "payload_llm_instructions_rels_path_idx" ON "payload_llm_instructions_rels" USING btree ("path");
  CREATE INDEX "payload_llm_instructions_rels_admins_id_idx" ON "payload_llm_instructions_rels" USING btree ("admins_id");
  CREATE INDEX "payload_llm_instructions_rels_users_id_idx" ON "payload_llm_instructions_rels" USING btree ("users_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "admins_sessions" CASCADE;
  DROP TABLE "admins" CASCADE;
  DROP TABLE "admins_rels" CASCADE;
  DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "users_rels" CASCADE;
  DROP TABLE "profile_images" CASCADE;
  DROP TABLE "profile_images_rels" CASCADE;
  DROP TABLE "_profile_images_v" CASCADE;
  DROP TABLE "_profile_images_v_rels" CASCADE;
  DROP TABLE "solar_systems" CASCADE;
  DROP TABLE "solar_systems_rels" CASCADE;
  DROP TABLE "_solar_systems_v" CASCADE;
  DROP TABLE "_solar_systems_v_rels" CASCADE;
  DROP TABLE "energy_records" CASCADE;
  DROP TABLE "energy_records_rels" CASCADE;
  DROP TABLE "_energy_records_v" CASCADE;
  DROP TABLE "_energy_records_v_rels" CASCADE;
  DROP TABLE "sharing_records" CASCADE;
  DROP TABLE "sharing_records_rels" CASCADE;
  DROP TABLE "_sharing_records_v" CASCADE;
  DROP TABLE "_sharing_records_v_rels" CASCADE;
  DROP TABLE "app_notifications" CASCADE;
  DROP TABLE "app_notifications_rels" CASCADE;
  DROP TABLE "_app_notifications_v" CASCADE;
  DROP TABLE "_app_notifications_v_rels" CASCADE;
  DROP TABLE "system_alerts" CASCADE;
  DROP TABLE "system_alerts_rels" CASCADE;
  DROP TABLE "_system_alerts_v" CASCADE;
  DROP TABLE "_system_alerts_v_rels" CASCADE;
  DROP TABLE "telemetry_ingestion_events" CASCADE;
  DROP TABLE "telemetry_ingestion_events_rels" CASCADE;
  DROP TABLE "_telemetry_ingestion_events_v" CASCADE;
  DROP TABLE "_telemetry_ingestion_events_v_rels" CASCADE;
  DROP TABLE "solar_owner_applications" CASCADE;
  DROP TABLE "solar_owner_applications_rels" CASCADE;
  DROP TABLE "solar_owner_profiles" CASCADE;
  DROP TABLE "solar_owner_profiles_rels" CASCADE;
  DROP TABLE "_solar_owner_profiles_v" CASCADE;
  DROP TABLE "_solar_owner_profiles_v_rels" CASCADE;
  DROP TABLE "customer_profiles" CASCADE;
  DROP TABLE "customer_profiles_rels" CASCADE;
  DROP TABLE "_customer_profiles_v" CASCADE;
  DROP TABLE "_customer_profiles_v_rels" CASCADE;
  DROP TABLE "customer_relationships" CASCADE;
  DROP TABLE "customer_relationships_rels" CASCADE;
  DROP TABLE "_customer_relationships_v" CASCADE;
  DROP TABLE "_customer_relationships_v_rels" CASCADE;
  DROP TABLE "energy_tariffs" CASCADE;
  DROP TABLE "energy_tariffs_rels" CASCADE;
  DROP TABLE "_energy_tariffs_v" CASCADE;
  DROP TABLE "_energy_tariffs_v_rels" CASCADE;
  DROP TABLE "energy_purchase_packages" CASCADE;
  DROP TABLE "energy_purchase_packages_rels" CASCADE;
  DROP TABLE "_energy_purchase_packages_v" CASCADE;
  DROP TABLE "_energy_purchase_packages_v_rels" CASCADE;
  DROP TABLE "payment_transactions" CASCADE;
  DROP TABLE "payment_transactions_rels" CASCADE;
  DROP TABLE "_payment_transactions_v" CASCADE;
  DROP TABLE "_payment_transactions_v_rels" CASCADE;
  DROP TABLE "energy_allocation_requests" CASCADE;
  DROP TABLE "energy_allocation_requests_rels" CASCADE;
  DROP TABLE "_energy_allocation_requests_v" CASCADE;
  DROP TABLE "_energy_allocation_requests_v_rels" CASCADE;
  DROP TABLE "energy_allocation_records" CASCADE;
  DROP TABLE "energy_allocation_records_rels" CASCADE;
  DROP TABLE "_energy_allocation_records_v" CASCADE;
  DROP TABLE "_energy_allocation_records_v_rels" CASCADE;
  DROP TABLE "energy_wallets" CASCADE;
  DROP TABLE "energy_wallets_rels" CASCADE;
  DROP TABLE "_energy_wallets_v" CASCADE;
  DROP TABLE "_energy_wallets_v_rels" CASCADE;
  DROP TABLE "energy_ledger_entries" CASCADE;
  DROP TABLE "energy_ledger_entries_rels" CASCADE;
  DROP TABLE "_energy_ledger_entries_v" CASCADE;
  DROP TABLE "_energy_ledger_entries_v_rels" CASCADE;
  DROP TABLE "meter_registrations" CASCADE;
  DROP TABLE "meter_registrations_rels" CASCADE;
  DROP TABLE "_meter_registrations_v" CASCADE;
  DROP TABLE "_meter_registrations_v_rels" CASCADE;
  DROP TABLE "meter_readings" CASCADE;
  DROP TABLE "meter_readings_rels" CASCADE;
  DROP TABLE "_meter_readings_v" CASCADE;
  DROP TABLE "_meter_readings_v_rels" CASCADE;
  DROP TABLE "consumption_records" CASCADE;
  DROP TABLE "consumption_records_rels" CASCADE;
  DROP TABLE "_consumption_records_v" CASCADE;
  DROP TABLE "_consumption_records_v_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_rels" CASCADE;
  DROP TABLE "_media_v" CASCADE;
  DROP TABLE "_media_v_rels" CASCADE;
  DROP TABLE "folders" CASCADE;
  DROP TABLE "folders_rels" CASCADE;
  DROP TABLE "_folders_v" CASCADE;
  DROP TABLE "_folders_v_rels" CASCADE;
  DROP TABLE "tags" CASCADE;
  DROP TABLE "tags_rels" CASCADE;
  DROP TABLE "_tags_v" CASCADE;
  DROP TABLE "_tags_v_rels" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "payload_llm_instructions" CASCADE;
  DROP TABLE "payload_llm_instructions_rels" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_users_account_status";
  DROP TYPE "public"."enum_users_auth_provider";
  DROP TYPE "public"."enum_users_theme";
  DROP TYPE "public"."enum_solar_systems_integration_adapter";
  DROP TYPE "public"."enum_solar_systems_credential_status";
  DROP TYPE "public"."enum_solar_systems_operational_status";
  DROP TYPE "public"."enum_solar_systems_data_source";
  DROP TYPE "public"."enum__solar_systems_v_version_integration_adapter";
  DROP TYPE "public"."enum__solar_systems_v_version_credential_status";
  DROP TYPE "public"."enum__solar_systems_v_version_operational_status";
  DROP TYPE "public"."enum__solar_systems_v_version_data_source";
  DROP TYPE "public"."enum_energy_records_kind";
  DROP TYPE "public"."enum_energy_records_unit";
  DROP TYPE "public"."enum_energy_records_source";
  DROP TYPE "public"."enum_energy_records_quality";
  DROP TYPE "public"."enum_energy_records_telemetry_status";
  DROP TYPE "public"."enum__energy_records_v_version_kind";
  DROP TYPE "public"."enum__energy_records_v_version_unit";
  DROP TYPE "public"."enum__energy_records_v_version_source";
  DROP TYPE "public"."enum__energy_records_v_version_quality";
  DROP TYPE "public"."enum__energy_records_v_version_telemetry_status";
  DROP TYPE "public"."enum_sharing_records_direction";
  DROP TYPE "public"."enum_sharing_records_status";
  DROP TYPE "public"."enum_sharing_records_source";
  DROP TYPE "public"."enum__sharing_records_v_version_direction";
  DROP TYPE "public"."enum__sharing_records_v_version_status";
  DROP TYPE "public"."enum__sharing_records_v_version_source";
  DROP TYPE "public"."enum_app_notifications_type";
  DROP TYPE "public"."enum_app_notifications_severity";
  DROP TYPE "public"."enum__app_notifications_v_version_type";
  DROP TYPE "public"."enum__app_notifications_v_version_severity";
  DROP TYPE "public"."enum_system_alerts_severity";
  DROP TYPE "public"."enum_system_alerts_category";
  DROP TYPE "public"."enum_system_alerts_status";
  DROP TYPE "public"."enum_system_alerts_source";
  DROP TYPE "public"."enum__system_alerts_v_version_severity";
  DROP TYPE "public"."enum__system_alerts_v_version_category";
  DROP TYPE "public"."enum__system_alerts_v_version_status";
  DROP TYPE "public"."enum__system_alerts_v_version_source";
  DROP TYPE "public"."enum_telemetry_ingestion_events_status";
  DROP TYPE "public"."enum__telemetry_ingestion_events_v_version_status";
  DROP TYPE "public"."enum_solar_owner_applications_status";
  DROP TYPE "public"."enum_solar_owner_profiles_status";
  DROP TYPE "public"."enum__solar_owner_profiles_v_version_status";
  DROP TYPE "public"."enum_customer_profiles_status";
  DROP TYPE "public"."enum__customer_profiles_v_version_status";
  DROP TYPE "public"."enum_customer_relationships_status";
  DROP TYPE "public"."enum__customer_relationships_v_version_status";
  DROP TYPE "public"."enum_energy_tariffs_status";
  DROP TYPE "public"."enum__energy_tariffs_v_version_status";
  DROP TYPE "public"."enum_payment_transactions_provider";
  DROP TYPE "public"."enum_payment_transactions_currency";
  DROP TYPE "public"."enum_payment_transactions_status";
  DROP TYPE "public"."enum__payment_transactions_v_version_provider";
  DROP TYPE "public"."enum__payment_transactions_v_version_currency";
  DROP TYPE "public"."enum__payment_transactions_v_version_status";
  DROP TYPE "public"."enum_energy_allocation_requests_status";
  DROP TYPE "public"."enum__energy_allocation_requests_v_version_status";
  DROP TYPE "public"."enum_energy_ledger_entries_account_type";
  DROP TYPE "public"."enum_energy_ledger_entries_direction";
  DROP TYPE "public"."enum__energy_ledger_entries_v_version_account_type";
  DROP TYPE "public"."enum__energy_ledger_entries_v_version_direction";
  DROP TYPE "public"."enum_meter_registrations_status";
  DROP TYPE "public"."enum_meter_registrations_source";
  DROP TYPE "public"."enum__meter_registrations_v_version_status";
  DROP TYPE "public"."enum__meter_registrations_v_version_source";
  DROP TYPE "public"."enum_meter_readings_source";
  DROP TYPE "public"."enum_meter_readings_quality";
  DROP TYPE "public"."enum_meter_readings_status";
  DROP TYPE "public"."enum__meter_readings_v_version_source";
  DROP TYPE "public"."enum__meter_readings_v_version_quality";
  DROP TYPE "public"."enum__meter_readings_v_version_status";
  DROP TYPE "public"."enum_consumption_records_status";
  DROP TYPE "public"."enum__consumption_records_v_version_status";
  DROP TYPE "public"."enum_payload_llm_instructions_entity_type";`)
}

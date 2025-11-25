Table "public"."activity_basic" {
  "activity_id" bigint [pk, not null, note: 'rolling ID with Sequence', increment, ref: < "public"."activity_geometry"."activity_id", ref: < "public"."employer"."activity_id", ref: < "public"."regional_details"."activity_id", ref: < "public"."shoreline_types"."activity_id", ref: < "public"."waterbody_data"."activity_id"]
  "legacy_id" uuid [default: `gen_random_id()`, note: 'legacy identifier for record (if applicable)']
  "created_by" varchar(64) [not null]
  "activity_type" varchar(32) [not null]
  "activity_subtype" varchar(128) [not null]
  "short_id" varchar(32) [not null, note: 'YY/SubtypeCode/first 8 digits of UUID']
  "received_timestamp" "timestamp with time zone" [not null]
  "created_timestamp" "timestamp with time zone" [not null]
  "activity_date" date [not null]
  "form_status" text [not null, default: `Draft`, note: 'Form state: Draft / Submitted']
}

Table "public"."jurisdictions" {
  "activity_id" bigint [pk, not null, ref: < "public"."activity_basic"."activity_id"]
  "jurisdiction" varchar(128) [not null]
  "percent_covered" smallint [not null]
}

Table "public"."project_code" {
  "id" bigint [not null, ref: < "public"."activity_basic"."activity_id"]
  "activity_id" bigserial [not null, increment]
  "description" text [not null]

  Indexes {
    (id, activity_id) [pk, name: "pk_table_4_id"]
  }
}

Table "public"."employer" {
  "activity_id" bigint [pk, not null]
  "employer" text [not null]
}

Table "public"."funding_agency" {
  "activity_id" bigint [not null, ref: < "public"."activity_basic"."activity_id"]
  "agency" text [not null]

  Indexes {
    (activity_id, agency) [pk, name: "pk_table_6_id"]
  }
}

Table "public"."riso_areas" {
  "activity_id" bigint [not null, ref: < "public"."activity_basic"."activity_id"]
  "organization_area" bigint [not null]

  Indexes {
    (activity_id, organization_area) [pk, name: "pk_table_8_id"]
  }
}

Table "public"."activity_geometry" {
  "activity_id" bigint [pk, not null]
  "centroid" point
  "area_m" integer
  "utm_zone" smallint
  "utm_easting" integer
  "utm_northing" integer
  "latitude" "double precision"
  "longitude" "double precision"
  "location_description" text
  "geom" "bit [note: 'postgis column'] varying" [note: 'postgis column']
}

Table "public"."regional_details" {
  "activity_id" bigint [pk]
  "biogeoclimatic_zone" bigint [unique]
  "invasive_plant_management_areas" varchar(500)
  "ownership" varchar(500)
  "regional_districts" varchar(500)
  "flnro_districts" varchar(500)
  "moti_districts" varchar(500)
  "elevation" smallint [note: 'meters']
}

Table "public"."platform" {
  "id" bigint [pk, not null, ref: < "public"."activity_basic"."activity_id"]
  "src" varchar(8) [note: 'batch, ios, android']
}

Table "public"."observation_plant_terrestrial_information" {
  "activity_id" bigint [pk, not null, ref: < "public"."activity_basic"."activity_id"]
  "soil_texture" varchar(64)
  "recent_observation" varchar(8)
  "aspect" varchar(32)
  "specific_use" varchar(32)
  "visible_well_nearby" varchar(8)
  "slope_percent" varchar(32)
}

Table "public"."terrestrial_invasive_plant" {
  "activity_id" bigint [not null, ref: < "public"."activity_basic"."activity_id"]
  "invasive_plant" varchar(64) [ref: < "public"."voucher_specimen_collection"."invasive_plant"]
  "observation_type" varchar(32) [note: 'positive/negative observation']
  "plant_density" varchar(64)
  "distribution" varchar(128)
  "life_stage" varchar(64)

  Indexes {
    (activity_id, invasive_plant) [pk, name: "pk_table_11_id"]
  }
}

Table "public"."voucher_specimen_collection" {
  "activity_id" bigint [not null, ref: < "public"."terrestrial_invasive_plant"."activity_id", ref: < "public"."aquatic_plant_observation_detail"."activity_id"]
  "invasive_plant" varchar(64)
  "voucher_sample_id" bigint
  "date_collected" date
  "date_verified" date
  "herbarium" varchar(128)
  "accession_number" varchar(128)
  "completed_by_person" varchar(128) [default: 128]
  "completed_by_org" varchar(128)
  "utm_zone" smallint
  "utm_easting" integer
  "utm_northing" integer

  Indexes {
    (activity_id, invasive_plant) [pk, name: "pk_table_12_id"]
  }
}

Table "public"."suitable_for_biocontrol" {
  "activity_id" bigint [pk, not null, ref: < "public"."activity_basic"."activity_id"]
  "suitable_for_biocontrol" varchar(8) [note: 'yes/no/unknown']
}

Table "public"."participant" {
  "id" bigserial [not null, increment]
  "activity_id" bigint [not null, ref: < "public"."activity_basic"."activity_id"]
  "name" bigint
  "pac_number" bigint

  Indexes {
    (id, activity_id) [pk, name: "pk_table_14_id"]
  }
}

Table "public"."pre_treatment_observation" {
  "activity_id" bigint [pk, not null, ref: < "public"."activity_basic"."activity_id"]
  "pre_treatment_observation" varchar(8)
}

Table "public"."shoreline_types" {
  "activity_id" bigint [not null]
  "shoreline_type" varchar(500) [not null]
  "percent_covered" smallint

  Indexes {
    (activity_id, shoreline_type) [pk, name: "pk_table_16_id"]
  }
}

Table "public"."batch" {
  "activity_id" bigint [not null, ref: < "public"."activity_basic"."activity_id"]
  "batch_id" bigint [not null]
  "row_id" bigint [not null]

  Indexes {
    (activity_id, batch_id, row_id) [pk, name: "pk_table_17_id"]
  }
}

Table "public"."waterbody_data" {
  "activity_id" bigint [pk, not null]
  "type" bigint
  "name_gazetted" varchar(500) [default: 128]
  "name_local" varchar(500) [default: 128]
  "access" varchar(64)
  "use" varchar(32)[]
  "max_depth_m" smallint
  "secchi_depth" smallint
  "colour" varchar(64)
  "adjacent_land_use" varchar(32)[]
  "inflow_permanent" varchar(32)[]
  "inflow_temp" varchar(32)[]
  "outflow_permanent" varchar(32)[]
  "outflow_seasonal" varchar(32)[]
  "tidal_influence" text
  "substrate_type" varchar(32)[]
  "water_level_management" varchar(32)[]
  "comment" varchar(256)
}

Table "public"."aquatic_plant_observation_detail" {
  "activity_id" bigint [not null, ref: < "public"."activity_basic"."activity_id"]
  "invasive_plant" varchar(500) [ref: < "public"."voucher_specimen_collection"."invasive_plant"]
  "observation_type" varchar(32) [note: 'positive/negative observation']
  "density" varchar(64)
  "distribution" varchar(128)
  "life_stage" varchar(32)
  "sample_point_id" varchar(64)

  Indexes {
    (activity_id, invasive_plant) [pk, name: "pk_table_19_id"]
  }
}

--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.19
-- Dumped by pg_dump version 9.6.19

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: activity_incoming_data; Type: TABLE DATA; Schema: invasivesbc; Owner: invasivebc
--
INSERT INTO invasivesbc.activity_incoming_data (activity_incoming_data_id, activity_id, version, activity_type, activity_subtype, created_timestamp, received_timestamp, deleted_timestamp, geom, geog, media_keys, activity_payload, biogeoclimatic_zones, regional_invasive_species_organization_areas, invasive_plant_management_areas, ownership, regional_districts, flnro_districts, moti_districts, elevation, well_proximity, utm_zone, utm_northing, utm_easting, albers_northing, albers_easting, created_by, form_status, sync_status, review_status, reviewed_by, reviewed_at, species_positive, species_negative) VALUES (3469, NULL, NULL, 'Observation', 'Activity_Testing', '2021-08-30 22:47:33.836438', '2021-08-30 22:47:33.836438', NULL, NULL, '0103000020E61000000100000007000000D7A9E3061D095FC024E5FA7985A348403BE8FFC21E095FC0D684E78F74A348405ADC9E1309095FC0A465D9B173A34840BCC14CE50B095FC02A49B42381A348401BF51DE210095FC05604095886A348401438F64D16095FC0BDF401E985A34840D7A9E3061D095FC024E5FA7985A34840', '{}', '[{}]', NULL, NULL, NULL, 'Jamie', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Not Validated', 'Save Successful', 'Not Reviewed', NULL, NULL, '{BC}', '{}');
INSERT INTO invasivesbc.activity_incoming_data (activity_incoming_data_id, activity_id, version, activity_type, activity_subtype, created_timestamp, received_timestamp, deleted_timestamp, geom, geog, media_keys, activity_payload, biogeoclimatic_zones, regional_invasive_species_organization_areas, invasive_plant_management_areas, ownership, regional_districts, flnro_districts, moti_districts, elevation, well_proximity, utm_zone, utm_northing, utm_easting, albers_northing, albers_easting, created_by, form_status, sync_status, review_status, reviewed_by, reviewed_at, species_positive, species_negative) VALUES (3467, NULL, NULL, 'Observation', 'Activity_Testing', '2021-08-30 22:40:10.791805', '2021-08-30 22:40:10.791805', NULL, NULL, '0103000020E610000001000000080000006A5531CC21095FC0D021EB5555A34840CE934D8823095FC00242B6A332A348404BBC7A45EF085FC0A1B576BC2EA348409B75FC19FF085FC0B4E0E54945A3484063F2349202095FC0560683373FA34840843E855D0F095FC08825911540A34840761DA41F19095FC06CE3CE9953A348406A5531CC21095FC0D021EB5555A34840', '{}', '[{}]', NULL, NULL, NULL, 'Jamie', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Not Validated', 'Save Successful', 'Not Reviewed', NULL, NULL, '{BC}', '{}');
INSERT INTO invasivesbc.activity_incoming_data (activity_incoming_data_id, activity_id, version, activity_type, activity_subtype, created_timestamp, received_timestamp, deleted_timestamp, geom, geog, media_keys, activity_payload, biogeoclimatic_zones, regional_invasive_species_organization_areas, invasive_plant_management_areas, ownership, regional_districts, flnro_districts, moti_districts, elevation, well_proximity, utm_zone, utm_northing, utm_easting, albers_northing, albers_easting, created_by, form_status, sync_status, review_status, reviewed_by, reviewed_at, species_positive, species_negative) VALUES (3468, NULL, NULL, 'Observation', 'Activity_Testing', '2021-08-30 22:45:18.511162', '2021-08-30 22:45:18.511162', NULL, NULL, '0103000020E6100000010000000D000000D90195813F095FC074FA218829A34840A83BF58D3D095FC007A72CBD0AA348405D8DBE782A095FC0C25CAF51F3A2484043A5275719095FC067342914EBA248405ADC9E1309095FC0704ABF92E4A2484042A6E4C6F5085FC01F38CFD3D5A24840C47F31E9E2085FC060D12CDACBA24840D3F98011D8085FC02CFF84B7F0A248402F7B7539DF085FC0B2E25F29FEA24840991D4B9FDC085FC099527A820FA34840BF74E629E6085FC0A9CB0C3B28A34840B90EB3A031095FC03F2937D52AA34840D90195813F095FC074FA218829A34840', '{}', '[{}]', NULL, NULL, NULL, 'Jamie', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Not Validated', 'Save Successful', 'Not Reviewed', NULL, NULL, '{BC}', '{}');
INSERT INTO invasivesbc.activity_incoming_data (activity_incoming_data_id, activity_id, version, activity_type, activity_subtype, created_timestamp, received_timestamp, deleted_timestamp, geom, geog, media_keys, activity_payload, biogeoclimatic_zones, regional_invasive_species_organization_areas, invasive_plant_management_areas, ownership, regional_districts, flnro_districts, moti_districts, elevation, well_proximity, utm_zone, utm_northing, utm_easting, albers_northing, albers_easting, created_by, form_status, sync_status, review_status, reviewed_by, reviewed_at, species_positive, species_negative) VALUES (3470, NULL, NULL, 'Observation', 'Activity_Testing', '2021-08-30 22:47:33.836438', '2021-08-30 22:47:33.836438', NULL, NULL, '0103000020E61000000100000008000000C98745594A095FC01620BF7523A348403BE7425342095FC0A368100109A348404B61927B37095FC0E14F913201A34840ED862F6931095FC06AE548790CA3484056D096E42F095FC0525563D21DA34840B50368E134095FC0A61930662AA3484075C378C53D095FC0A61930662AA34840C98745594A095FC01620BF7523A34840', '{}', '[{}]', NULL, NULL, NULL, 'Jamie', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Not Validated', 'Save Successful', 'Not Reviewed', NULL, NULL, '{BC, BY}', '{}');
INSERT INTO invasivesbc.activity_incoming_data (activity_incoming_data_id, activity_id, version, activity_type, activity_subtype, created_timestamp, received_timestamp, deleted_timestamp, geom, geog, media_keys, activity_payload, biogeoclimatic_zones, regional_invasive_species_organization_areas, invasive_plant_management_areas, ownership, regional_districts, flnro_districts, moti_districts, elevation, well_proximity, utm_zone, utm_northing, utm_easting, albers_northing, albers_easting, created_by, form_status, sync_status, review_status, reviewed_by, reviewed_at, species_positive, species_negative) VALUES (3471, NULL, NULL, 'Observation', 'Activity_Testing', '2021-08-30 22:48:56.899388', '2021-08-30 22:48:56.899388', NULL, NULL, '0103000020E6100000010000000500000034850389FF085FC0DBEA1A1929A3484068FD7F51FF085FC077ADBBCC03A348401339B3BDF2085FC0DE9DB45D03A348401339B3BDF2085FC042DB13AA28A3484034850389FF085FC0DBEA1A1929A34840', '{}', '[{}]', NULL, NULL, NULL, 'Jamie', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Not Validated', 'Save Successful', 'Not Reviewed', NULL, NULL, '{}', '{BC}');
--
-- Name: activity_incoming_data_activity_incoming_data_id_seq; Type: SEQUENCE SET; Schema: invasivesbc; Owner: invasivebc
--

SELECT pg_catalog.setval('invasivesbc.activity_incoming_data_activity_incoming_data_id_seq', 3592, true);


--
-- PostgreSQL database dump complete
--


update activity_incoming_data set species_positive = '{BC}' where activity_incoming_data_id = 3469;

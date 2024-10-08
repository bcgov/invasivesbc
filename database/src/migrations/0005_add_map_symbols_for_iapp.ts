import { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw(
    //language=PostgreSQL
    `
      set search_path = invasivesbc,public;

      alter table iapp_invbc_mapping
        add column if not exists iapp_description varchar(100);

      delete
      from iapp_invbc_mapping
      where mapping_id = 45;

      UPDATE code
      SET code_description =
            CASE
              when code_name = 'L' then '1 | <= 1plant/m2 (Low)'
              when code_name = 'M' then '2 | 2-5 plants/m2 (Med)'
              when code_name = 'H' then '3 | 6-10 plants/m2 (High)'
              when code_name = 'D' then '4 | >10 plants/m2 (Dense)'
              end
      where code_header_id = 27
        and code_name in ('L', 'M', 'H', 'D');

      UPDATE code
      SET code_description =
            CASE
              when code_name = 'RS' then '1 | rare individual, a single occurrence'
              when code_name = 'FS' then '2 | few sporadically occurring individuals'
              when code_name = 'CL' then '3 | single patch or clump of a species'
              when code_name = 'SS' then '4 | several sporadically occurring individuals'
              when code_name = 'FP' then '5 | a few patches or clumps of a species'
              when code_name = 'WS' then '6 | several well-spaced patches or clumps'
              when code_name = 'CU' then '7 | continuous uniform occurrence of well-spaced individuals'
              when code_name = 'CO' then '8 | continuous occurrence of a species with a few gaps in the distribution'
              when code_name = 'CD' then '9 | continuous dense occurrence of a species'
              end
      where code_header_id = 29
        and code_name in ('RS', 'FS', 'CL', 'SS', 'FP', 'WS', 'CU', 'CO', 'CD');

      update code
      set code_description = 'Reed canary grass (Phalaris arundinacea)'
      where code_header_id = 39
        and code_name = 'RE';

      update code
      set code_description = 'Giant mannagrass / reed sweetgrass (Glyceria maxima)'
      where code_header_id = 39
        and code_name = 'SW';

      UPDATE iapp_invbc_mapping
      SET invbc_name =
            CASE
              when char_code = 'NA' then 'North Africa grass (Ventenata dubia)'
              when char_code = 'RE' then 'Reed canary grass (Phalaris arundinacea)'
              when char_code = 'TS' then 'Fuller''s Teasel (Dipsacus fullonum)'
              when char_code = 'RC' then 'European common reed (Phragmites australis subsp. australis)'
              when char_code = 'GK' then 'Giant knotweed (Reynoutria / Fallopia sachalinensis)'
              when char_code = 'SW' then 'Giant mannagrass / reed sweetgrass (Glyceria maxima)'
              end
      where char_code in ('NA', 'RE', 'TS', 'RC', 'GK', 'SW');

      update iapp_invbc_mapping
      set char_code =
            case
              when iapp_name = 'Didymo (DIDY GEM)' then 'DI'
              when iapp_name = 'Knapweed species (CENT SPP)' then 'KS'
              when iapp_name = 'Sowthistle species (SONC SPP)' then 'SO'
              when iapp_name = 'Yellow hawkweed (HIER PRA)' then 'YH'
              end
      where iapp_name in ('Didymo (DIDY GEM)', 'Knapweed species (CENT SPP)', 'Sowthistle species (SONC SPP)',
                          'Yellow hawkweed (HIER PRA)');

      UPDATE iapp_invbc_mapping
      SET iapp_description =
            CASE
              WHEN char_code = 'BB' THEN 'Bachelor''s button (Centaurea cyanus)'
              WHEN char_code = 'KB' THEN 'Bighead knapweed (Centaurea macrocephala)'
              WHEN char_code = 'BP' THEN 'Bigleaf periwinkle / large periwinkle (Vinca major)'
              WHEN char_code = 'BO' THEN 'Bohemian knotweed (Fallopia x bohemica)'
              WHEN char_code = 'ED' THEN 'Brazilian waterweed (Egeria densa)'
              WHEN char_code = 'UR' THEN 'Bur buttercup (Ceratocephalus testiculatus)'
              WHEN char_code = 'BU' THEN 'Burdock species (Arctium spp)'
              WHEN char_code = 'BD' THEN 'Butterfly bush (Buddleja davidii)'
              WHEN char_code = 'LC' THEN 'Cherry laurel (Prunus laurocerasus)'
              WHEN char_code = 'RC' THEN 'Common reed (Phragmites australis subsp. australis)'
              WHEN char_code = 'CU' THEN 'Cudweed (Gnaphalium uliginosum)'
              WHEN char_code = 'CL' THEN 'Cutleaf blackberry (Rubus laciniatus)'
              WHEN char_code = 'DT' THEN 'Dalmatian toadflax (Linaria dalmatica)'
              WHEN char_code = 'DR' THEN 'Dame''s rocket (Hesperis matronalis)'
              WHEN char_code = 'SL' THEN 'Daphne / spurge laurel (Daphne laureola)'
              WHEN char_code = 'BF' THEN 'False brome (Brachypodium sylvaticum)'
              WHEN char_code = 'FL' THEN 'Fragrant water lily (Nymphaea odorata subsp. odorata)'
              WHEN char_code = 'GK' THEN 'Giant knotweed (Fallopia sachalinensis)'
              WHEN char_code = 'GP' THEN 'Globe-pod hoary cress (Lepidium appelianum al-shehbaz)'
              WHEN char_code = 'GS' THEN 'Groundsel (Senecio vulgaris)'
              WHEN char_code = 'HC' THEN 'Heart-podded hoary cress (Lepidium draba)'
              WHEN char_code = 'BI' THEN 'Hedge false bindweed (Calystegia sepium)'
              WHEN char_code = 'GR' THEN 'Herb robert (Geranium robertianum)'
              WHEN char_code = 'PO' THEN 'Himalayan knotweed (Polygonum polystachyum)'
              WHEN char_code = 'JK' THEN 'Japanese knotweed (Fallopia japonica)'
              WHEN char_code = 'JW' THEN 'Japanese wireweed (Sargassum muticum)'
              WHEN char_code = 'KH' THEN 'King devil hawkweed (Hieracium floribundum)'
              WHEN char_code = 'KO' THEN 'Kochia (Kochia scoparia)'
              WHEN char_code = 'LT' THEN 'Lady''s-thumb (Polygonum persicaria)'
              WHEN char_code = 'LL' THEN 'Large yellow loosestrife / spotted loosestrife (Lysimachia punctata)'
              WHEN char_code = 'LH' THEN 'Lens-pod hoary cress (Lepidium chalepense l.)'
              WHEN char_code = 'RF' THEN 'Lesser celandine / fig buttercup (Ranunculus ficaria)'
              WHEN char_code = 'MX' THEN 'Maltese star thistle (Centaurea melitensis)'
              WHEN char_code = 'MT' THEN 'Marsh plume thistle/Marsh thistle (Cirsium palustre)'
              WHEN char_code = 'MG' THEN 'Meadow goats-beard (Tragopogon pratensis)'
              WHEN char_code = 'MH' THEN 'Meadow hawkweed (Hieracium caespitosum)'
              WHEN char_code = 'MK' THEN 'Meadow knapweed (Centaurea debeauxii)'
              WHEN char_code = 'ME' THEN 'Mouse ear hawkweed (Hieracium pilosella)'
              WHEN char_code = 'NS' THEN 'Nightshade (Solanum spp)'
              WHEN char_code = 'NT' THEN 'Nodding thistle (Carduus nutans)'
              WHEN char_code = 'OM' THEN 'Old man''s beard / traveller''s joy (Clematis vitalba)'
              WHEN char_code = 'OH' THEN 'Orange hawkweed (Hieracium aurantiacum)'
              WHEN char_code = 'PF' THEN 'Parrot feather (Myriophyllum aquaticum)'
              WHEN char_code = 'PS' THEN 'Perennial sow thistle (Sonchus arvensis)'
              WHEN char_code = 'LP' THEN 'Portuguese laurel (Prunus lusitanica)'
              WHEN char_code = 'PC' THEN 'Prickly comfrey (Symphytum asperum)'
              WHEN char_code = 'PV' THEN 'Puncturevine (Tribulus terrestris)'
              WHEN char_code = 'PD' THEN 'Purple deadnettle (Lamium purpureum)'
              WHEN char_code = 'QA' THEN 'Queen anne''s lace / wild carrot (Daucus carota)'
              WHEN char_code = 'QH' THEN 'Queen devil hawkweed (Hieracium praealtum)'
              WHEN char_code = 'RK' THEN 'Russian knapweed (Acroptilon repens)'
              WHEN char_code = 'RT' THEN 'Russian thistle (Salsola kali)'
              WHEN char_code = 'SN' THEN 'Salt-meadow cord grass (Spartina patens)'
              WHEN char_code = 'SH' THEN 'Scentless chamomile (Matricaria perforata)'
              WHEN char_code = 'SP' THEN 'Shepherd''s-purse (Capsella bursa-pastoris)'
              WHEN char_code = 'HG' THEN 'Smooth cat''s ear (Hypochaeris glabra)'
              WHEN char_code = 'SX' THEN 'Spotted hawkweed (Hieracium maculatum)'
              WHEN char_code = 'SK' THEN 'Spotted knapweed (Centaurea biebersteinii)'
              WHEN char_code = 'SJ' THEN 'St. John''s wort/Saint John''s wort/ Goatweed (Hypericum perforatum)'
              WHEN char_code = 'TH' THEN 'Tall hawkweed (Hieracium piloselloides)'
              WHEN char_code = 'TR' THEN 'Tansy ragwort (Senecio jacobaea)'
              WHEN char_code = 'TS' THEN 'Teasel (Dipsacus fullonum)'
              WHEN char_code = 'VL' THEN 'Velvet leaf (Abutilon theophrasti)'
              WHEN char_code = 'NO' THEN 'Watercress (Nasturtium officinale)'
              WHEN char_code = 'WG' THEN 'Western goat''s-beard (Tragopogon dubius)'
              WHEN char_code = 'WP' THEN 'Whiplash hawkweed (Hieracium flagellare)'
              WHEN char_code = 'WC' THEN 'White cockle (Lychnis alba)'
              WHEN char_code = 'SR' THEN 'White spanish broom (Cytisus multiflorus)'
              WHEN char_code = 'WB' THEN 'Wild buckwheat (Polygonum convolvulus)'
              WHEN char_code = 'WM' THEN 'Wild mustard (Sinapis arvensis)'
              WHEN char_code = 'WO' THEN 'Wild oats (Avena fatua)'
              WHEN char_code = 'PW' THEN 'Wild parsnip (Pastinaca sativa)'
              WHEN char_code = 'YD' THEN 'Yellow devil hawkweed (Hieracium glomeratum)'
              WHEN char_code = 'HS' THEN 'Yellow hawkweed species (Hieracium spp)'
              WHEN char_code = 'YN' THEN 'Yellow nutsedge (Cyperus esculentus)'
              WHEN char_code = 'DI' THEN 'Didymo (Didymosphenia geminata)'
              WHEN char_code = 'KS' THEN 'Knapweed species (Centaurea spp.)'
              WHEN char_code = 'SO' THEN 'Sowthistle species (Sonchus species)'
              WHEN char_code = 'YH' THEN 'Yellow hawkweed (Hieracium pratense)'
              ELSE invbc_name
              END;


      drop view if exists iapp_site_summary_slow cascade;


      CREATE VIEW invasivesbc.iapp_site_summary_slow AS
      WITH sites_grouped AS (SELECT site_selection_extract.site_id,
                                    site_selection_extract.all_species_on_site,
                                    string_agg(iim.char_code, ', ' order by char_code) as map_symbol,
                                    site_selection_extract.decimal_longitude,
                                    site_selection_extract.decimal_latitude
                             FROM invasivesbc.site_selection_extract
                                    left join iapp_invbc_mapping iim
                                              on iim.iapp_description = site_selection_extract.invasive_plant
                             GROUP BY site_selection_extract.site_id, site_selection_extract.all_species_on_site,
                                      site_selection_extract.decimal_longitude,
                                      site_selection_extract.decimal_latitude),
           date_summary AS (SELECT sse_1.site_id,
                                   (SELECT string_agg(DISTINCT (bio_agents.biological_agent)::text,
                                                      ', '::text) AS string_agg
                                    FROM (SELECT biological_dispersal_extract.biological_agent
                                          FROM invasivesbc.biological_dispersal_extract
                                          WHERE (biological_dispersal_extract.site_id = sse_1.site_id)
                                          UNION
                                          SELECT biological_treatment_extract.biological_agent
                                          FROM invasivesbc.biological_treatment_extract
                                          WHERE (biological_treatment_extract.site_id = sse_1.site_id)
                                          UNION
                                          SELECT biological_monitoring_extract.biological_agent
                                          FROM invasivesbc.biological_monitoring_extract
                                          WHERE (biological_monitoring_extract.site_id = sse_1.site_id)) bio_agents) AS biological_agent,
                                   min(se.survey_date)                                                               AS min_survey,
                                   max(se.survey_date)                                                               AS max_survey,
                                   min(cte.treatment_date)                                                           AS min_chemical_treatment_dates,
                                   max(cte.treatment_date)                                                           AS max_chemical_treatment_dates,
                                   min(cme.inspection_date)                                                          AS min_chemical_treatment_monitoring_dates,
                                   max(cme.inspection_date)                                                          AS max_chemical_treatment_monitoring_dates,
                                   min(bde.inspection_date)                                                          AS min_bio_dispersal_dates,
                                   max(bde.inspection_date)                                                          AS max_bio_dispersal_dates,
                                   min(bte.treatment_date)                                                           AS min_bio_treatment_dates,
                                   max(bte.treatment_date)                                                           AS max_bio_treatment_dates,
                                   min(bme.inspection_date)                                                          AS min_bio_treatment_monitoring_dates,
                                   max(bme.inspection_date)                                                          AS max_bio_treatment_monitoring_dates,
                                   min(mte.treatment_date)                                                           AS min_mechanical_treatment_dates,
                                   max(mte.treatment_date)                                                           AS max_mechanical_treatment_dates,
                                   min(mme.inspection_date)                                                          AS min_mechanical_treatment_monitoring_dates,
                                   max(mme.inspection_date)                                                          AS max_mechanical_treatment_monitoring_dates
                            FROM ((((((((sites_grouped sse_1
                              LEFT JOIN invasivesbc.survey_extract se ON ((sse_1.site_id = se.site_id)))
                              LEFT JOIN invasivesbc.chemical_treatment_extract cte
                                        ON ((sse_1.site_id = cte.site_id)))
                              LEFT JOIN invasivesbc.chemical_monitoring_extract cme
                                       ON ((sse_1.site_id = cme.site_id)))
                              LEFT JOIN invasivesbc.biological_dispersal_extract bde
                                      ON ((sse_1.site_id = bde.site_id)))
                              LEFT JOIN invasivesbc.biological_treatment_extract bte
                                     ON ((sse_1.site_id = bte.site_id)))
                              LEFT JOIN invasivesbc.biological_monitoring_extract bme
                                    ON ((sse_1.site_id = bme.site_id)))
                              LEFT JOIN invasivesbc.mechanical_treatment_extract mte
                                   ON ((sse_1.site_id = mte.site_id)))
                              LEFT JOIN invasivesbc.mechanical_monitoring_extract mme
                                  ON ((sse_1.site_id = mme.site_id)))
                            GROUP BY sse_1.site_id)
      SELECT sse.site_id,
             sse.all_species_on_site,
             sse.map_symbol,
             ds.biological_agent,
             sse.decimal_longitude,
             sse.decimal_latitude,
             ds.min_survey,
             ds.max_survey,
             ds.min_chemical_treatment_dates,
             ds.max_chemical_treatment_dates,
             ds.min_chemical_treatment_monitoring_dates,
             ds.max_chemical_treatment_monitoring_dates,
             ds.min_bio_dispersal_dates,
             ds.max_bio_dispersal_dates,
             ds.min_bio_treatment_dates,
             ds.max_bio_treatment_dates,
             ds.min_bio_treatment_monitoring_dates,
             ds.max_bio_treatment_monitoring_dates,
             ds.min_mechanical_treatment_dates,
             ds.max_mechanical_treatment_dates,
             ds.min_mechanical_treatment_monitoring_dates,
             ds.max_mechanical_treatment_monitoring_dates,
             CASE
               WHEN (ds.min_survey IS NULL) THEN false
               ELSE true
               END AS has_surveys,
             CASE
               WHEN (ds.max_bio_treatment_monitoring_dates IS NULL) THEN false
               ELSE true
               END AS has_biological_treatment_monitorings,
             CASE
               WHEN (ds.max_bio_treatment_dates IS NULL) THEN false
               ELSE true
               END AS has_biological_treatments,
             CASE
               WHEN (ds.min_bio_dispersal_dates IS NULL) THEN false
               ELSE true
               END AS has_biological_dispersals,
             CASE
               WHEN (ds.max_chemical_treatment_monitoring_dates IS NULL) THEN false
               ELSE true
               END AS has_chemical_treatment_monitorings,
             CASE
               WHEN (ds.min_chemical_treatment_dates IS NULL) THEN false
               ELSE true
               END AS has_chemical_treatments,
             CASE
               WHEN (ds.max_mechanical_treatment_dates IS NULL) THEN false
               ELSE true
               END AS has_mechanical_treatments,
             CASE
               WHEN (ds.max_mechanical_treatment_monitoring_dates IS NULL) THEN false
               ELSE true
               END AS has_mechanical_treatment_monitorings
      FROM (sites_grouped sse
        JOIN date_summary ds ON ((ds.site_id = sse.site_id)));


      CREATE MATERIALIZED VIEW invasivesbc.iapp_site_summary AS
      WITH jurisdiction_data AS (SELECT DISTINCT regexp_split_to_array((survey_extract.jurisdictions)::text,
                                                                       '($1<=)(, )'::text) AS jurisdictions,
                                                 survey_extract.site_id
                                 FROM invasivesbc.survey_extract),
           paper_file_list AS (SELECT DISTINCT se.site_paper_file_id,
                                               se.site_id
                               FROM invasivesbc.survey_extract se
                               GROUP BY se.site_id, se.site_paper_file_id),
           agencies AS (SELECT sea.site_id,
                               string_agg(DISTINCT (sea.survey_agency)::text, ', '::text) AS agency_agg
                        FROM invasivesbc.survey_extract sea
                        GROUP BY sea.site_id),
           areas AS (SELECT DISTINCT ON (z_1.site_id) z_1.site_id,
                                                      z_1.estimated_area_hectares,
                                                      z_1.survey_date
                     FROM invasivesbc.survey_extract z_1
                     ORDER BY z_1.site_id, z_1.survey_date DESC),
           rd_riso AS (SELECT DISTINCT s.site_id,
                                       s.regional_district,
                                       s.regional_invasive_species_organization,
                                       s.invasive_plant_management_area
                       FROM invasivesbc.site_selection_extract s
                       GROUP BY s.site_id, s.regional_district, s.regional_invasive_species_organization,
                                s.invasive_plant_management_area)
      SELECT i.site_id,
             i.all_species_on_site,
             i.map_symbol,
             i.biological_agent,
             i.decimal_longitude,
             i.decimal_latitude,
             i.min_survey,
             i.max_survey,
             i.min_chemical_treatment_dates,
             i.max_chemical_treatment_dates,
             i.min_chemical_treatment_monitoring_dates,
             i.max_chemical_treatment_monitoring_dates,
             i.min_bio_dispersal_dates,
             i.max_bio_dispersal_dates,
             i.min_bio_treatment_dates,
             i.max_bio_treatment_dates,
             i.min_bio_treatment_monitoring_dates,
             i.max_bio_treatment_monitoring_dates,
             i.min_mechanical_treatment_dates,
             i.max_mechanical_treatment_dates,
             i.min_mechanical_treatment_monitoring_dates,
             i.max_mechanical_treatment_monitoring_dates,
             i.has_surveys,
             i.has_biological_treatment_monitorings,
             i.has_biological_treatments,
             i.has_biological_dispersals,
             i.has_chemical_treatment_monitorings,
             i.has_chemical_treatments,
             i.has_mechanical_treatments,
             i.has_mechanical_treatment_monitorings,
             jd.jurisdictions,
             z.estimated_area_hectares                                  AS reported_area,
             string_to_array((i.all_species_on_site)::text, ', '::text) AS all_species_on_site_as_array,
             p.site_paper_file_id,
             a.agency_agg                                               AS agencies,
             r.regional_district,
             r.regional_invasive_species_organization,
             r.invasive_plant_management_area
      FROM (((((invasivesbc.iapp_site_summary_slow i
        JOIN jurisdiction_data jd ON ((i.site_id = jd.site_id)))
        JOIN paper_file_list p ON ((jd.site_id = p.site_id)))
        JOIN agencies a ON ((p.site_id = a.site_id)))
        JOIN areas z ON ((a.site_id = z.site_id)))
        JOIN rd_riso r ON ((a.site_id = r.site_id)));

      CREATE MATERIALIZED VIEW invasivesbc.iapp_site_summary_and_geojson AS
      SELECT i.site_id,
             i.all_species_on_site,
             i.map_symbol,
             i.biological_agent,
             i.decimal_longitude,
             i.decimal_latitude,
             i.min_survey,
             i.max_survey,
             i.min_chemical_treatment_dates,
             i.max_chemical_treatment_dates,
             i.min_chemical_treatment_monitoring_dates,
             i.max_chemical_treatment_monitoring_dates,
             i.min_bio_dispersal_dates,
             i.max_bio_dispersal_dates,
             i.min_bio_treatment_dates,
             i.max_bio_treatment_dates,
             i.min_bio_treatment_monitoring_dates,
             i.max_bio_treatment_monitoring_dates,
             i.min_mechanical_treatment_dates,
             i.max_mechanical_treatment_dates,
             i.min_mechanical_treatment_monitoring_dates,
             i.max_mechanical_treatment_monitoring_dates,
             i.has_surveys,
             i.has_biological_treatment_monitorings,
             i.has_biological_treatments,
             i.has_biological_dispersals,
             i.has_chemical_treatment_monitorings,
             i.has_chemical_treatments,
             i.has_mechanical_treatments,
             i.has_mechanical_treatment_monitorings,
             i.jurisdictions,
             i.reported_area,
             i.all_species_on_site_as_array,
             i.site_paper_file_id,
             i.agencies,
             i.regional_district,
             i.regional_invasive_species_organization,
             i.invasive_plant_management_area,
             s.geog,
             CASE
               WHEN (i.has_biological_treatment_monitorings OR i.has_chemical_treatment_monitorings OR
                     i.has_mechanical_treatment_monitorings) THEN 'Yes'::text
               ELSE 'No'::text
               END                                                   AS monitored,
             json_build_object('type', 'Feature', 'properties',
                               json_build_object('site_id', i.site_id, 'species', i.all_species_on_site,
                                                 'map_symbol', i.map_symbol,
                                                 'has_surveys',
                                                 i.has_surveys, 'has_biological_treatments',
                                                 i.has_biological_treatments,
                                                 'has_biological_monitorings', i.has_biological_treatment_monitorings,
                                                 'has_biological_dispersals', i.has_biological_dispersals,
                                                 'has_chemical_treatments', i.has_chemical_treatments,
                                                 'has_chemical_monitorings', i.has_chemical_treatment_monitorings,
                                                 'has_mechanical_treatments', i.has_mechanical_treatments,
                                                 'has_mechanical_monitorings', i.has_mechanical_treatment_monitorings,
                                                 'earliest_survey', i.min_survey, 'latest_survey', i.max_survey,
                                                 'earliest_chemical_treatment', i.min_chemical_treatment_dates,
                                                 'latest_chemical_treatment', i.max_chemical_treatment_dates,
                                                 'earliest_chemical_monitoring',
                                                 i.min_chemical_treatment_monitoring_dates,
                                                 'latest_chemical_monitoring',
                                                 i.max_chemical_treatment_monitoring_dates,
                                                 'earliest_bio_dispersal', i.min_bio_dispersal_dates,
                                                 'latest_bio_dispersal',
                                                 i.max_bio_dispersal_dates, 'earliest_bio_treatment',
                                                 i.min_bio_treatment_dates, 'latest_bio_treatment',
                                                 i.max_bio_treatment_dates,
                                                 'earliest_bio_monitoring', i.min_bio_treatment_monitoring_dates,
                                                 'latest_bio_monitoring', i.max_bio_treatment_monitoring_dates,
                                                 'earliest_mechanical_treatment', i.min_mechanical_treatment_dates,
                                                 'latest_mechanical_treatment', i.max_mechanical_treatment_dates,
                                                 'earliest_mechanical_monitoring',
                                                 i.min_mechanical_treatment_monitoring_dates,
                                                 'latest_mechanical_monitoring',
                                                 i.max_mechanical_treatment_monitoring_dates, 'reported_area',
                                                 i.reported_area, 'jurisdictions', i.jurisdictions,
                                                 'regional_district',
                                                 i.regional_district, 'regional_invasive_species_organization',
                                                 i.regional_invasive_species_organization), 'geometry',
                               (public.st_asgeojson(s.geog))::jsonb) AS geojson
      FROM (invasivesbc.iapp_site_summary i
        JOIN invasivesbc.iapp_spatial s ON ((i.site_id = s.site_id)));



      CREATE INDEX iapp_site_summary_and_geojson_geom_idx ON invasivesbc.iapp_site_summary_and_geojson USING gist (geog);
      CREATE INDEX iapp_site_summary_and_geojson_site_id_idx ON invasivesbc.iapp_site_summary_and_geojson USING btree (site_id,
                                                                                                                       site_paper_file_id,
                                                                                                                       jurisdictions,
                                                                                                                       all_species_on_site,
                                                                                                                       max_survey,
                                                                                                                       agencies,
                                                                                                                       has_biological_treatments,
                                                                                                                       biological_agent,
                                                                                                                       has_chemical_treatments,
                                                                                                                       has_mechanical_treatments,
                                                                                                                       has_biological_dispersals,
                                                                                                                       monitored,
                                                                                                                       all_species_on_site_as_array,
                                                                                                                       regional_district,
                                                                                                                       regional_invasive_species_organization,
                                                                                                                       invasive_plant_management_area,
                                                                                                                       map_symbol);
      CREATE INDEX iapp_site_summary_and_geojson_site_id_only_idx ON invasivesbc.iapp_site_summary_and_geojson USING btree (site_id);
      CREATE INDEX iapp_vector_tile_transform_index ON invasivesbc.iapp_site_summary_and_geojson USING gist (st_transform((geog)::geometry, 3857));

    `
  );
}

export async function down(knex: Knex) {
  await knex.raw(
    //language=PostgreSQL
    `
      set search_path to invasivesbc, public;

    `
  );
}

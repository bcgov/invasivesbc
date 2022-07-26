import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Creates columns for jurisdiction and species, recalls Brian's ...02 migration, then creates/fills iapp_invbc_mapping mapping table
  await knex.raw(`
  	set search_path=invasivesbc,public;
    drop materialized view invasivesbc.iapp_site_summary_and_geojson;
drop materialized view invasivesbc.iapp_site_summary;

CREATE MATERIALIZED VIEW invasivesbc.iapp_site_summary
    TABLESPACE pg_default
    AS WITH jurisdiction_data AS (
            SELECT DISTINCT regexp_split_to_array(survey_extract.jurisdictions::text, '($1<=)(, )'::text) AS jurisdictions,
                survey_extract.estimated_area_hectares,
                survey_extract.site_id
              FROM invasivesbc.survey_extract
            )
    SELECT i.site_id,
        i.all_species_on_site,
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
        jd.estimated_area_hectares AS reported_area,
        string_to_array(i.all_species_on_site::text, ', '::text) AS all_species_on_site_as_array
      FROM invasivesbc.iapp_site_summary_slow i
        JOIN jurisdiction_data jd ON i.site_id = jd.site_id
      WHERE 1 = 1
    WITH DATA;
    
    
    CREATE MATERIALIZED VIEW invasivesbc.iapp_site_summary_and_geojson
    TABLESPACE pg_default
    AS SELECT i.site_id,
        i.all_species_on_site,
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
        json_build_object('type', 'Feature', 'properties', json_build_object('site_id', i.site_id, 'species', i.all_species_on_site, 'has_surveys', i.has_surveys, 'has_biological_treatments', i.has_biological_treatments, 'has_biological_monitorings', i.has_biological_treatment_monitorings, 'has_biological_dispersals', i.has_biological_dispersals, 'has_chemical_treatments', i.has_chemical_treatments, 'has_chemical_monitorings', i.has_chemical_treatment_monitorings, 'has_mechanical_treatments', i.has_mechanical_treatments, 'has_mechanical_monitorings', i.has_mechanical_treatment_monitorings, 'earliest_survey', i.min_survey, 'latest_survey', i.max_survey, 'earliest_chemical_treatment', i.min_chemical_treatment_dates, 'latest_chemical_treatment', i.max_chemical_treatment_dates, 'earliest_chemical_monitoring', i.min_chemical_treatment_monitoring_dates, 'latest_chemical_monitoring', i.max_chemical_treatment_monitoring_dates, 'earliest_bio_dispersal', i.min_bio_dispersal_dates, 'latest_bio_dispersal', i.max_bio_dispersal_dates, 'earliest_bio_treatment', i.min_bio_treatment_dates, 'latest_bio_treatment', i.max_bio_treatment_dates, 'earliest_bio_monitoring', i.min_bio_treatment_monitoring_dates, 'latest_bio_monitoring', i.max_bio_treatment_monitoring_dates, 'earliest_mechanical_treatment', i.min_mechanical_treatment_dates, 'latest_mechanical_treatment', i.max_mechanical_treatment_dates, 'earliest_mechanical_monitoring', i.min_mechanical_treatment_monitoring_dates, 'latest_mechanical_monitoring', i.max_mechanical_treatment_monitoring_dates, 'reported_area', i.reported_area, 'jurisdictions', i.jurisdictions), 'geometry', st_asgeojson(s.geog)::jsonb) AS geojson
      FROM invasivesbc.iapp_site_summary i
        JOIN invasivesbc.iapp_spatial s ON i.site_id = s.site_id
      WHERE 1 = 1
    WITH DATA;

    DROP TABLE IF EXISTS iapp_invbc_mapping;
    CREATE TABLE iapp_invbc_mapping (
      mapping_id serial PRIMARY KEY,
      char_code VARCHAR(2),
      invbc_name VARCHAR(100),
      iapp_name VARCHAR(100),
      environment VARCHAR(1),
      comments VARCHAR(300)
    );

    GRANT SELECT ON iapp_invbc_mapping TO invasivebc;

    INSERT INTO invasivesbc.iapp_invbc_mapping (char_code,invbc_name,iapp_name,environment,"comments") VALUES
      ('AR','African rue / harmal (Peganum harmala)','African rue / harmal (PEGA HAR)','T',''),
      ('HB','Annual hawksbeard (Crepis tectorum)','Annual hawksbeard (CREP TEC)','T',''),
      ('AS','Annual sow thistle (Sonchus oleraceus)','Annual sow thistle (SONC OLE)','T',''),
      ('AB','American beachgrass (Ammophila breviligulata)','','A',''),
      ('YC','Amphibious yellow cress (Rorippa amphibian)','','A',''),
      ('BY','Baby''s breath (Gypsophila paniculata)','Baby''s breath (GYPS PAN)','T',''),
      ('BB','Bachelor''s-button / Cornflower (Centaurea cyanus)','Bachelor''s button (CENT CYA)','T',''),
      ('BA','Barnyard grass (Echinochloa crusgalli)','Barnyard grass (ECHI CRU)','T',''),
      ('KB','Bighead / GIant knapweed (Centaurea macrocephala)','Bighead knapweed (CENT MAC)','T',''),
      ('BP','Bigleaf / large periwinkle (Vinca major)','Bigleaf periwinkle / large periwinkle (VINC MAJ)','T','');
    INSERT INTO invasivesbc.iapp_invbc_mapping (char_code,invbc_name,iapp_name,environment,"comments") VALUES
      ('BH','Black henbane (Hyoscyamus niger)','Black henbane (HYOS NIG)','T',''),
      ('BL','Black knapweed (Centaurea nigra)','Black knapweed (CENT NIG)','T',''),
      ('RB','Black locust (Robinia pseudoacacia)','Black locust (ROBI PSE)','T',''),
      ('BC','Bladder campion (Silene vulgaris)','Bladder campion (SILE VUL)','T',''),
      ('BW','Blueweed (Echium vulgare)','Blueweed (ECHI VUL)','T',''),
      ('RI','Bog bulrush / ricefield bulrush (Schoenoplectus mucronatus)','Bog bulrush / ricefield bulrush (SCHO MUC)','A',''),
      ('BO','Bohemian knotweed (Reynoutria / Fallopia x bohemica)','Bohemian knotweed (FALL BOH)','B',''),
      ('ED','Brazilian elodea (Egeria densa)','Brazilian waterweed (EGER DEN)','A',''),
      ('RA','Bristly locust / rose acacia (Robinia hispida)','Bristly locust / rose acacia (ROBI HIS)','T',''),
      ('PB','Broad-leaved peavine (Lathyrus latifolius)','','T','');
    INSERT INTO invasivesbc.iapp_invbc_mapping (char_code,invbc_name,iapp_name,environment,"comments") VALUES
      ('BK','Brown knapweed (Centaurea jacea)','Brown knapweed (CENT JAC)','T',''),
      ('FF','Buffalo-bur (Solanum rostratum)','','T',''),
      ('BG','Bulbous bluegrass (Poa bulbosa)','','T',''),
      ('BT','Bull thistle (Cirsium vulgare)','Bull thistle (CIRS VUL)','T',''),
      ('UR','Bur / Hornseed buttercup (Ceratocephala testiculata)','Bur buttercup (CERA TES)','T',''),
      ('CB','Bur chervil (Anthriscus caucalis)','Bur chervil (ANTH CAU)','T',''),
      ('BU','Common burdock (Arctium minus)','Burdock species (ARCT SPP)','T','We removed the option for "burdock species" and separated it into two separate burdock species that were being lumped before.  '),
      ('GB','Great burdock (Arctium lappa)','Burdock species (ARCT SPP)','T',''),
      ('BD','Butterfly-bush (Buddleja davidii)','Butterfly bush (BUDD DAV)','T',''),
      ('AM','Camel thorn (Alhagi maurorum)','Camel thorn (ALHA MAU)','T','');
    INSERT INTO invasivesbc.iapp_invbc_mapping (char_code,invbc_name,iapp_name,environment,"comments") VALUES
      ('CT','Canada thistle (Cirsium arvense)','Canada thistle (CIRS ARV)','T',''),
      ('CA','Caraway (Carum carvi)','Caraway (CARU CAR)','T',''),
      ('CG','Carpet burweed (Soliva sessilis)','Carpet burweed (SOLI SES)','T',''),
      ('DB','Cheatgrass / downy brome (Bromus tectorum)','Cheatgrass / downy brome (BROM TEC)','T',''),
      ('LC','Cherry-laurel (Prunus laurocerasus)','Cherry laurel (PRUN LAU)','T',''),
      ('CY','Chicory (Cichorium intybus)','Chicory (CICH INT)','T',''),
      ('CH','Chilean tarweed (Madia sativa)','Chilean tarweed (MADI SAT)','T',''),
      ('CE','Clary sage (Salvia sclarea)','Clary sage (SALV SCL)','T',''),
      ('CF','Coltsfoot (Tussilago farfara)','Coltsfoot (TUSS FAR)','T',''),
      ('AO','Common bugloss (Anchusa officinalis)','Common bugloss (ANCH OFF)','T','');
    INSERT INTO invasivesbc.iapp_invbc_mapping (char_code,invbc_name,iapp_name,environment,"comments") VALUES
      ('CO','Common comfrey (Symphytum officinale)','Common comfrey (SYMP OFF)','T',''),
      ('CC','Common crupina (Crupina vulgaris)','','T',''),
      ('PE','Common evening-primrose (Oenothera biennis)','','T',''),
      ('FC','Common frogbit (Hydrocharis morsus-range)','','A',''),
      ('GS','Common groundsel (Senecio vulgaris)','','T',''),
      ('CX','Common hawkweed (Hieracium lachenalii)','Common hawkweed (HIER VUL)','T',''),
      ('ET','Common hawthorn (Crataegus monogyna)','','T',''),
      ('DN','Common dead-nettle (Lamium amplexicaule)','','T',''),
      ('CP','Common periwinkle (Vinca minor)','Common periwinkle (VINC MIN)','T',''),
      ('RC','European Common Reed (Phragmites australis subsp. australis)','Common reed (PHRA AUS)','B','');
    INSERT INTO invasivesbc.iapp_invbc_mapping (char_code,invbc_name,iapp_name,environment,"comments") VALUES
      ('TC','Common tansy (Tanacetum vulgare)','Common tansy (TANA VUL)','T',''),
      ('RR','Corn-spurry (Spergula arvensis)','','T',''),
      ('CR','Creeping buttercup (Ranunculus repens)','Creeping buttercup (RANU REP)','T',''),
      ('CU','Marsh cudweed (Gnaphalium uliginosum)','Cudweed (GNAP ULI)','T',''),
      ('CD','Curled dock (Rumex crispus)','Curled dock (RUME CRI)','T',''),
      ('UP','Curly leaf pondweed (Potamogeton crispus)','Curly leaf pondweed (POTA CRI)','A',''),
      ('CL','Cutleaf evergreen blackberry (Rubus laciniatus)','Cutleaf blackberry (RUBU LAC)','T',''),
      ('CS','Cypress spurge (Euphorbia cyparissias)','Cypress spurge (EUPH CYP)','T',''),
      ('DT','Dalmatian toadflax (Linaria genistifolia spp. dalmatica)','Dalmatian toadflax (LINA DAL)','T',''),
      ('DR','Dames rocket (Hesperis matronalis)','Dame''s rocket (HESP MAT)','T','');
    INSERT INTO invasivesbc.iapp_invbc_mapping (char_code,invbc_name,iapp_name,environment,"comments") VALUES
      ('SL','Daphne / spurge-laurel (Daphne laureola)','Daphne / spurge laurel (DAPH LAU)','T',''),
      ('FU','Death-cap fungus (Amanita phalloides)','','T',''),
      ('DC','Dense-flowered cordgrass (Spartina densiflora)','Dense-flowered cordgrass (SPAR DEN)','A',''),
      ('','','Didymo (DIDY GEM)','','Removed from IAPP list as it is native.'),
      ('DK','Diffuse knapweed (Centaurea diffusa)','Diffuse knapweed (CENT DIF)','T',''),
      ('DO','Dodder (Cuscuta spp.)','Dodder (CUSC SPP)','B',''),
      ('DE','Dwarf / Japanese eel-grass (Zostera japonica)','','T',''),
      ('DW','Dyer''s woad (Isatis tinctoria)','','T',''),
      ('ES','Eggleaf spurge (Euphorbia oblongata)','','T',''),
      ('EC','English cordgrass (Spartina anglica)','English cordgrass (SPAR ANG)','A','');
    INSERT INTO invasivesbc.iapp_invbc_mapping (char_code,invbc_name,iapp_name,environment,"comments") VALUES
      ('HO','English holly (Ilex aquifolium)','English holly (ILEX AQU)','T',''),
      ('EI','English ivy (Hedera helix)','English ivy (HEDE HEL)','T',''),
      ('EW','Eurasian watermilfoil (Myriophyllum spicatum)','Eurasian watermilfoil (MYRI SPI)','A',''),
      ('EB','European beachgrass (Ammophila arenaria)','','A',''),
      ('EH','European hawkweed (Hieracium sabaudum)','European hawkweed (HIER SAB)','T',''),
      ('MQ','European water clover (Marsilea quadrifolia)','','A',''),
      ('WE','European waterlily (Nymphaea alba)','European waterlily (NYMP ALB)','A',''),
      ('EY','Eyebright (Euphrasia nemorosa)','Eyebright (EUPH NEM)','T',''),
      ('BF','Slender false brome / false brome (Brachypodium sylvaticum)','False brome (BRAC SYL)','T',''),
      ('FW','Fanwort (Cabomba caroliniana)','','A','');
    INSERT INTO invasivesbc.iapp_invbc_mapping (char_code,invbc_name,iapp_name,environment,"comments") VALUES
      ('FM','Feathered mosquito-fern (Azolla pinnata)','','A',''),
      ('FY','Fernleaf yarrow (Achillea filipendulina)','','T',''),
      ('FB','Field bindweed (Convolvulus arvensis)','Field bindweed (CONV ARV)','T',''),
      ('FS','Field scabious (Knautia arvensis)','Field scabious (KNAU ARV)','T',''),
      ('FP','Flat pea / flat peavine (Lathyrus sylvestris)','Flat pea / flat peavine (LATH SYL)','T',''),
      ('FR','Flowering rush (Butomus umbellatus)','Flowering rush (BUTO UMB)','A',''),
      ('FG','Foxglove (Digitalis purpurea)','','T',''),
      ('FL','Fragrant waterlily (Nymphaea odorata subsp. odorata)','Fragrant water lily (NYMP ODO)','A',''),
      ('GM','French broom (Genista monspessulana)','','T',''),
      ('GL','Garden yellow loosestrife (Lysimachia vulgaris)','Garden yellow loosestrife (LYSI VUL)','B','');
    INSERT INTO invasivesbc.iapp_invbc_mapping (char_code,invbc_name,iapp_name,environment,"comments") VALUES
      ('AP','Garlic mustard (Alliaria petiolata)','Garlic mustard (ALLI PET)','T',''),
      ('MA','Giant chickweed (Myosoton aquaticum)','','T',''),
      ('GH','Giant hogweed (Heracleum mantegazzianum)','Giant hogweed (HERA MAN)','T',''),
      ('GK','Giant knotweed (Reynourtia / Fallopia sachalinensis)','Giant knotweed (FALL SAC)','B',''),
      ('SW','Giant mannagrass / reed sweetgrass (Glyceria maxima)','Giant mannagrass / reed sweetgrass (GLYC MAX)','B',''),
      ('AD','Giant reed / giant cane (Arundo donax)','Giant reed / giant cane (ARUN DON)','B',''),
      ('SV','Giant salvinia (Salvinia molesta)','','A',''),
      ('GP','Globe-pod hoarycress (Lepidium appelianum )','Globe-pod hoary cress (LEPI APP)','T',''),
      ('RG','Goat''s rue / french lilac (Galega officinalis)','Goat''s rue / french lilac (GALE OFF)','T',''),
      ('GO','Gorse (Ulex europaeus)','Gorse (ULEX EUR)','T','');
    INSERT INTO invasivesbc.iapp_invbc_mapping (char_code,invbc_name,iapp_name,environment,"comments") VALUES
      ('GW','Goutweed / bishop''s weed (Aegopodium podagraria)','Goutweed / bishop''s weed (AEGO POD)','T',''),
      ('LB','Great leopard''s-bane (Doronicum pardalianches)','','T',''),
      ('GC','Greater celandine (Chelidonium majus)','Greater celandine (CHEL MAJ)','T',''),
      ('GN','Greater knapweed (Centaurea scabiosa)','Greater knapweed (CENT SCA)','T',''),
      ('GF','Green foxtail / green bristlegrass (Setaria viridis)','Green foxtail / green bristlegrass (SETA VIR)','T',''),
      ('GS','Common groundsel (Senecio vulgaris)','Groundsel (SENE VUL)','T',''),
      ('HR','Hairy cat''s-ear (Hypochaeris radicata)','Hairy cat''s-ear (HYPO RAD)','T',''),
      ('AH','Halogeton / saltlover (Halogeton glomeratus)','','T',''),
      ('HC','Heart-podded hoarycress (Lepidium / Cardaria draba)','Heart-podded hoary cress (CARD DRA)','T',''),
      ('BI','Hedge bindweed (Calystegia sepium)','Hedge false bindweed (CALY SEP)','T','');
    INSERT INTO invasivesbc.iapp_invbc_mapping (char_code,invbc_name,iapp_name,environment,"comments") VALUES
      ('HD','Hedgehog dogtail (Cynosurus echinatus)','','T',''),
      ('GR','Herb-Robert (Geranium robertianum)','Herb robert (GERA ROB)','T',''),
      ('HI','Himalayan blackberry (Rubus armeniacus)','Himalayan blackberry (RUBU ARM)','T',''),
      ('PO','Himalayan knotweed (Persicaria wallichii / Polygonum polystachyum)','Himalayan knotweed (POLY POL)','B',''),
      ('HA','Hoary alyssum (Berteroa incana)','Hoary alyssum (BERT INC)','T',''),
      ('HT','Hound''s-tongue (Cynoglossum officinale)','Hound''s-tongue (CYNO OFF)','T',''),
      ('HY','Hydrilla (Hydrilla verticillata)','','A',''),
      ('IS','Iberian starthistle (Centaurea iberica)','','T',''),
      ('IA','Italian arum (Arum italicum)','','T',''),
      ('IT','Italian plumeless thistle (Carduus pycnocephalus)','','T','');
    INSERT INTO invasivesbc.iapp_invbc_mapping (char_code,invbc_name,iapp_name,environment,"comments") VALUES
      ('JP','Japanese butterbur (Petasites japonicus)','Japanese butterbur (PETA JAP)','T',''),
      ('JK','Japanese knotweed (Reynoutria / Fallopia japonica)','Japanese knotweed (FALL JAP)','B',''),
      ('JW','Wireweed (Sargassum muticum)','Japanese wireweed (SARG MUT)','T',''),
      ('JE','Jewelweed / Spotted touch-me-not (Impatiens capensis)','','T',''),
      ('JI','Jimsonweed (Datura stramonium)','','T',''),
      ('GJ','Johnsongrass (Sorghum halepense)','','B',''),
      ('JG','Jointed goatgrass (Aegilops cylindrica)','Jointed goatgrass (AEGI CYL)','T',''),
      ('KH','Kingdevil hawkweed (Pilosella floribunda / Hieracium floribundum)','King devil hawkweed (HIER FLO)','T',''),
      ('','','Knapweed species (CENT SPP)','','removed from IAPP list as other options are available.'),
      ('KO','Kochia / Summer Cypress (Bassia / Kochia scoparia)','Kochia (KOCH SCO)','T','');
    INSERT INTO invasivesbc.iapp_invbc_mapping (char_code,invbc_name,iapp_name,environment,"comments") VALUES
      ('KU','Kudzu (Pueraria montana)','','T',''),
      ('LT','Lady''s-thumb (Persicaria maculosa / Polygonum persicaria)','Lady''s-thumb (POLY PER)','T',''),
      ('LL','Large yellow / spotted loosestrife (Lysimachia punctata)','Large yellow loosestrife / spotted loosestrife (LYSI PUN)','A',''),
      ('LS','Leafy spurge (Euphorbia esula)','Leafy spurge (EUPH ESU)','T',''),
      ('LH','Lens-pod / Chalapa hoarycress  (Lepidium chalepense)','Lens-pod hoary cress (LEPI CHA)','T',''),
      ('RF','Lesser celandine / fig buttercup (Ficaria verna / Ranunculus ficaria)','Lesser celandine / fig buttercup (RANU FIC)','T',''),
      ('LO','Longspine sandbur (Cenchrus longispinus)','Longspine sandbur (CENC LON)','T',''),
      ('OW','Major oxygen weed (Lagarosiphon)','','A',''),
      ('MX','Maltese star-thistle (Centaurea melitensis)','Maltese star thistle (CENT MEL)','T',''),
      ('MT','Marsh plume thistle / Marsh thistle (Cirsium palustre)','Marsh plume thistle/Marsh thistle (CIRS PAL)','T','');
    INSERT INTO invasivesbc.iapp_invbc_mapping (char_code,invbc_name,iapp_name,environment,"comments") VALUES
      ('MB','Meadow buttercup (Ranunculus acris)','Meadow buttercup (RANU ACR)','T',''),
      ('MC','Meadow clary (Salvia pratensis)','','T',''),
      ('MG','Meadow salsify / goats-beard (Tragopogon pratensis)','Meadow goats-beard (TRAG PRA)','T',''),
      ('MH','Meadow hawkweed (Pilosella caespitosa / Hieracium caespitosum)','Meadow hawkweed (HIER CAE)','T',''),
      ('MK','Meadow knapweed (Centaurea x moncktonii / debeauxii)','Meadow knapweed (CENT DEB)','T',''),
      ('MS','Mediterranean sage (Salvia aethiopsis)','','T',''),
      ('TM','Medusahead (Taeniatherum caput-medusae)','','T',''),
      ('MI','Milk thistle (Silybum marianum)','Milk thistle (SILY MAR)','T',''),
      ('MO','Mountain bluet (Centaurea montana)','Mountain bluet (CENT MON)','T',''),
      ('ME','Mouse ear hawkweed (Pilosella officinarum / Hieracium pilosella)','Mouse ear hawkweed (HIER PIL)','T','');
    INSERT INTO invasivesbc.iapp_invbc_mapping (char_code,invbc_name,iapp_name,environment,"comments") VALUES
      ('MU','Mullein (Verbascum thapsus)','Mullein (VERB THA)','T',''),
      ('EM','Myrtle spurge (Euphorbia myrsinites)','Myrtle spurge (EUPH MYR)','T',''),
      ('NC','Night-flowering catchfly (Silene noctiflora)','Night-flowering catchfly (SILE NOC)','T',''),
      ('NS','Silverleaf nightshade (Solanum elaeagnifolium)','Nightshade (SOLA SPP)','T','We removed the option for "burdock species" and separated it into two separate burdock species that were being lumped before.  '),
      ('BN','American black nightshade (Solanum americanum)','','T',''),
      ('EU','European bittersweet / climbing nightshade (Solanum dulcamara)','','T',''),
      ('NT','Nodding / musk thistle (Carduus nutans)','Nodding thistle (CARD NUT)','T',''),
      ('NA','North africa grass (Ventenata dubia)','North africa grass (VENT DUB)','T',''),
      ('OM','Old man''s beard / traveler''s joy (Clematis vitalba)','Old man''s beard / traveller''s joy (CLEM VIT)','T',''),
      ('OH','Orange hawkweed (Pilosella aurantiaca / Hieracium aurantiacum)','Orange hawkweed (HIER AUR)','T','');
    INSERT INTO invasivesbc.iapp_invbc_mapping (char_code,invbc_name,iapp_name,environment,"comments") VALUES
      ('OD','Oxeye daisy (Leucanthemum vulgare)','Oxeye daisy (LEUC VUL)','T',''),
      ('PF','Parrot''s feather / Brazilian watermilfoil (Myriophyllum aquaticum)','Parrot feather (MYRI AQU)','A',''),
      ('EP','Paterson''s Curse (Echium plantagineum)','','T',''),
      ('PP','Perennial pepperweed (Lepidium latifolium)','Perennial pepperweed (LEPI LAT)','T',''),
      ('PS','Perennial sow-thistle (Sonchus arvensis)','Perennial sow thistle (SONC ARV)','T',''),
      ('PT','Plumeless thistle (Carduus acanthoides)','Plumeless thistle (CARD ACA)','T',''),
      ('PH','Poison hemlock (Conium maculatum)','Poison hemlock (CONI MAC)','T',''),
      ('PA','Polar hawkweed (Hieracium atratum)','Polar hawkweed (HIER ATR)','T',''),
      ('IM','Policeman''s helmet / himalayan balsam (Impatiens glandulifera)','Policeman''s helmet / himalayan balsam (IMPA GLA)','B',''),
      ('PR','Portuguese broom (Cytisus striatus)','Portuguese broom (CYTI STR)','T','');
    INSERT INTO invasivesbc.iapp_invbc_mapping (char_code,invbc_name,iapp_name,environment,"comments") VALUES
      ('LP','Portugese laurel (Prunus lusitanica)','Portuguese laurel (PRUN LUS)','T',''),
      ('PC','Prickly / rough comfrey (Symphytum asperum)','Prickly comfrey (SYMP ASP)','T',''),
      ('TO','Princess tree / Royal Paulownia (Paulownia tomentosa)','','T',''),
      ('PV','Puncture vine (Tribulus terrestris)','Puncturevine (TRIB TER)','T',''),
      ('PD','Purple dead-nettle (Lamium purpureum)','Purple deadnettle (LAMI PUR)','T',''),
      ('PU','Purple / red starthistle (Centaurea calcitrapa)','','T',''),
      ('PL','Purple loosestrife (Lythrum salicaria)','Purple loosestrife (LYTH SAL)','B',''),
      ('PN','Purple nutsedge (Cyperus rotundus)','','T',''),
      ('QA','Queen Anne''s lace / wild carrot (Daucus carota)','Queen anne''s lace / wild carrot (DAUC CAR)','T',''),
      ('QH','Queendevil hawkweed (Pilosella praealta / Hieracium praealtum)','Queen devil hawkweed (HIER PRE)','T','');
    INSERT INTO invasivesbc.iapp_invbc_mapping (char_code,invbc_name,iapp_name,environment,"comments") VALUES
      ('BR','Red bartsia (Odontites serotina)','','T',''),
      ('RP','Redroot amaranth / rough pigweed (Amaranthus retroflexus)','Redroot amaranth / rough pigweed (AMAR RET)','T',''),
      ('RE','Reed canary grass (Phalaris arundinacea)','','B',''),
      ('RS','Rush skeletonweed (Chondrilla juncea)','Rush skeletonweed (CHON JUN)','T',''),
      ('RK','Russian knapweed (Rhaponticum / Acroptilon repens)','Russian knapweed (ACRO REP)','T',''),
      ('RO','Russian olive (Elaeagnus angustifolia)','Russian olive (ELAE ANG)','T',''),
      ('RT','Russian thistle (Salsola tragus / kali)','Russian thistle (SALS KAL)','T',''),
      ('TA','Saltcedar / tamarisk (Tamarix ramosissima)','Saltcedar / tamarisk (TAMA RAM)','T',''),
      ('SN','Salt-meadow cordgrass (Spartina patens)','Salt-meadow cord grass (SPAR PAT)','A',''),
      ('SH','Scentless chamomile (Tripleurospermum inodorum / Matricaria perforata)','Scentless chamomile (MATR PER)','T','');
    INSERT INTO invasivesbc.iapp_invbc_mapping (char_code,invbc_name,iapp_name,environment,"comments") VALUES
      ('SB','Scotch broom (Cytisus scoparius)','Scotch broom (CYTI SCO)','T',''),
      ('ST','Scotch thistle (Onopordum acanthium)','Scotch thistle (ONOP ACA)','T',''),
      ('SS','Sheep sorrel (Rumex acetosella)','Sheep sorrel (RUME ACE)','T',''),
      ('SP','Shepherd''s purse (Capsella bursa-pastoris)','Shepherd''s-purse (CAPS BUR)','T',''),
      ('SG','Shiny geranium (Geranium lucidum)','Shiny geranium (GERA LUC)','T',''),
      ('CN','Short-fringed knapweed (Centaurea nigrescens)','Short-fringed knapweed (CENT NIR)','T',''),
      ('SE','Siberian elm (Ulmus pumila)','Siberian elm (ULMU PUM)','T',''),
      ('HG','Smooth cat''s-ear (Hypochaeris glabra)','Smooth cat''s ear (HYPO GLA)','T',''),
      ('SA','Smooth cordgrass (Spartina alterniflora)','','A',''),
      ('FT','Slender meadow foxtail (Alopecurus myosuroides)','','T','');
    INSERT INTO invasivesbc.iapp_invbc_mapping (char_code,invbc_name,iapp_name,environment,"comments") VALUES
      ('WT','Slenderflower thistle / winged thistle (Carduus tenuiflorus)','','T',''),
      ('MN','Smallflower / small touch-me-not (Impatiens parviflora)','','T',''),
      ('SM','Smooth hawkweed (Hieracium laevigatum)','Smooth hawkweed (HIER LAE)','T',''),
      ('','','Sowthistle species (SONC SPP)','','removed from IAPP list as other options are available.'),
      ('BS','Spanish bluebells (Hyacinthoides hispanica)','Spanish bluebells (HYAC HIS)','T',''),
      ('SI','Spanish broom (Spartium junceum)','Spanish broom (SPAR JUN)','T',''),
      ('SX','Spotted / mottled hawkweed (Hieracium maculatum)','Spotted hawkweed (HIER MAC)','T',''),
      ('SK','Spotted knapweed (Centaurea stoebe / biebersteinii)','Spotted knapweed (CENT BIE)','T',''),
      ('MV','Spring millet grass (Milium vernale)','','T',''),
      ('TP','Spurge flax (Thymelaea passerina)','','T','');
    INSERT INTO invasivesbc.iapp_invbc_mapping (char_code,invbc_name,iapp_name,environment,"comments") VALUES
      ('CV','Squarrose knapweed (Centaurea virgata ssp. squarrosa)','','T',''),
      ('SJ','St. John''s-wort (Hypericum perforatum)','St. John''s wort/Saint John''s wort/ Goatweed (HYPE PER)','T',''),
      ('SC','Sulphur cinquefoil (Potentilla recta)','Sulphur cinquefoil (POTE REC)','T',''),
      ('SF','Sweet fennel (Foeniculum vulgare)','Sweet fennel (FOEN VUL)','T',''),
      ('SY','Syrian bean-caper (Zygophyllum fabago)','','T',''),
      ('TH','Tall hawkweed (Pilosella / Hieracium piloselloides)','Tall hawkweed (HIER OID)','T',''),
      ('TR','Tansy ragwort (Jacobaea vulgaris / Senecio jacobaea)','Tansy ragwort (SENE JAC)','T',''),
      ('TB','Tartary buckwheat (Fagopyrum tataricum)','Tartary buckwheat (FAGO TAT)','T',''),
      ('TS','Fueller''s Teasel (Dipsacus fullonum)','Teasel (DIPS FUL)','T',''),
      ('TX','Texas blueweed (Helianthus ciliaris)','','T','');
    INSERT INTO invasivesbc.iapp_invbc_mapping (char_code,invbc_name,iapp_name,environment,"comments") VALUES
      ('AA','Tree of heaven (Ailanthus altissima)','Tree of heaven (AILA ALT)','T',''),
      ('LM','Variable leaf milfoil (Myriophyllum heterophyllum)','','A',''),
      ('VL','Velvet-leaf (Abutilon theophrasti)','Velvet leaf (ABUT THE)','T',''),
      ('WA','Wall hawkweed (Hieracium murorum)','Wall hawkweed (HIER MUR)','T',''),
      ('NO','Common watercress (Nasturtium officinale)','Watercress (NAST OFF)','A',''),
      ('WL','Wand loosestrife (Lythrum virgatum)','','B',''),
      ('TN','Water chestnut (Trapa natans)','','A',''),
      ('WH','Water hyacinth (Eichhornia crassipes)','Water hyacinth (EICH CRA)','A',''),
      ('LW','Water lettuce (Pistia stratiotes)','Water lettuce (PIST STR)','A',''),
      ('AQ','Water soldier (Stratiotes aloides)','','A','');
    INSERT INTO invasivesbc.iapp_invbc_mapping (char_code,invbc_name,iapp_name,environment,"comments") VALUES
      ('WG','Western salsify / goat''s-beard (Tragopogon dubius)','Western goat''s-beard (TRAG DUB)','T',''),
      ('WP','Whiplash hawkweed (Pilosella flagellaris / Hieracium flagellare)','Whiplash hawkweed (HIER FLA)','T',''),
      ('WC','White cockle (Silene latifolia / Lychnis alba)','White cockle (LYCH ALB)','T',''),
      ('SR','White flowered broom (Cytisus multiflorus)','White spanish broom (CYTI MUL)','T',''),
      ('WB','Wild buckwheat (Fallopia convolvulus / Polygonum convolvulus)','Wild buckwheat (POLY CON)','T',''),
      ('WI','Wild chervil (Anthriscus sylvestris)','Wild chervil (ANTH SYL)','T',''),
      ('WF','Wild four o''clock (Mirabilis nyctaginea)','Wild four o''clock (MIRA NYC)','T',''),
      ('WM','Wild / corn mustard (Sinapis arvensis)','Wild mustard (SINA ARV)','T',''),
      ('WO','Wild oat (Avena fatua)','Wild oats (AVEN FAT)','T',''),
      ('PW','Wild / common parsnip (Pastinaca sativa)','Wild parsnip (PAST SAT)','T','');
    INSERT INTO invasivesbc.iapp_invbc_mapping (char_code,invbc_name,iapp_name,environment,"comments") VALUES
      ('WS','Wood sage (Salvia nemorosa)','Wood sage (SALV NEM)','T',''),
      ('WW','Wormwood (Artemisia absinthium)','Wormwood (ARTE ABS)','T',''),
      ('YA','Yellow archangel (Lamiastrum galeobdolon)','Yellow archangel (LAMI GAL)','T',''),
      ('YT','Yellow/common toadflax (Linaria vulgaris)','Yellow/common toadflax (LINA VUL)','T',''),
      ('YD','Yellowdevil hawkweed (Pilosella glomerata / Hieracium glomeratum)','Yellow devil hawkweed (HIER GLO)','T',''),
      ('YF','Yellow floating heart (Nymphoides peltata)','Yellow floating heart (NYMP PEL)','A',''),
      ('','','Yellow hawkweed (HIER PRA)','','Removed from IAPP based on confirmation by Sandy and Susan and updated HW key.'),
      ('HS','Yellow hawkweed species (Hieracium / Pilosella spp.)','Yellow hawkweed species (HIER SPP)','T',''),
      ('YI','Yellow iris (Iris pseudacorus)','Yellow iris (IRIS PSE)','A',''),
      ('YN','Yellow nutsedge / nut-grass (Cyperus esculentus)','Yellow nutsedge (CYPE ESC)','T','');
    INSERT INTO invasivesbc.iapp_invbc_mapping (char_code,invbc_name,iapp_name,environment,"comments") VALUES
      ('YS','Yellow starthistle (Centaurea solstitialis)','','T','');

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=invasivesbc,public;
    drop table if exists invasivesbc.iapp_invbc_mapping;
    drop materialized view invasivesbc.iapp_site_summary_and_geojson;
    drop materialized view invasivesbc.iapp_site_summary;
  `);
}

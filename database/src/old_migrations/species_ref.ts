import * as Knex from 'knex';
//For now moving to one consolidated migration for plant reporting.

//Why:  Knex silently failing on view create, making troubleshooting which of the 10+ plant views is failing.
//      Deploying plant views then becomes a process of manually pasting the sql to the db.
//      Having one consolidated file allows for quick troubleshooting and deployments.
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  	set search_path=invasivesbc,public;
    -- invasivesbc.species_ref_raw definition

-- Drop table

-- DROP TABLE invasivesbc.species_ref_raw;

CREATE TABLE  if not exists invasivesbc.species_ref_raw (
	species_id serial4 NOT NULL,
	common_name varchar(50) NOT NULL,
	latin_name varchar(50) NOT NULL,
	genus varchar(4) NOT NULL,
	species varchar(3) NOT NULL,
	map_symbol varchar(2) NOT NULL
);

INSERT INTO invasivesbc.species_ref_raw (common_name,latin_name,genus,species,map_symbol) VALUES
	 ('Russian knapweed','Acroptilon repens','ACRO','REP','RK'),
	 ('Jointed goatgrass','Aegilops cylindrica','AEGI','CYL','JG'),
	 ('Wild oats','Avena fatua','AVEN','FAT','WO'),
	 ('Hoary alyssum','Berteroa incana','BERT','INC','HA'),
	 ('Shepherd''s-purse','Capsella bursa-pastoris','CAPS','BUR','SP'),
	 ('Plumeless thistle','Carduus acanthoides','CARD','ACA','PT'),
	 ('Nodding thistle','Carduus nutans','CARD','NUT','NT'),
	 ('Caraway','Carum carvi','CARU','CAR','CA'),
	 ('Spotted knapweed','Centaurea biebersteinii','CENT','BIE','SK'),
	 ('Diffuse knapweed','Centaurea diffusa','CENT','DIF','DK');
INSERT INTO invasivesbc.species_ref_raw (common_name,latin_name,genus,species,map_symbol) VALUES
	 ('Greater knapweed','Centaurea scabiosa','CENT','SCA','GN'),
	 ('Yellow starthistle','Centaurea solstitialis','CENT','SOL','YS'),
	 ('Knapweed species','Centaurea spp.','CENT','SPP','KS'),
	 ('Rush skeletonweed','Chondrilla juncea','CHON','JUN','RS'),
	 ('Chicory','Cichorium intybus','CICH','INT','CY'),
	 ('Canada thistle','Cirsium arvense','CIRS','ARV','CT'),
	 ('Marsh plume thistle/Marsh thistle','Cirsium palustre','CIRS','PAL','MT'),
	 ('Bull thistle','Cirsium vulgare','CIRS','VUL','BT'),
	 ('Poison hemlock','Conium maculatum','CONI','MAC','PH'),
	 ('Field bindweed','Convolvulus arvensis','CONV','ARV','FB');
INSERT INTO invasivesbc.species_ref_raw (common_name,latin_name,genus,species,map_symbol) VALUES
	 ('Common crupina','Crupina vulgaris','CRUP','VUL','CC'),
	 ('Dodder','Cuscuta spp.','CUSC','SPP','DO'),
	 ('Hound''s-tongue','Cynoglossum officinale','CYNO','OFF','HT'),
	 ('Yellow nutsedge','Cyperus esculentus','CYPE','ESC','YN'),
	 ('Purple nutsedge','Cyperus rotundus','CYPE','ROT','PN'),
	 ('Teasel','Dipsacus fullonum','DIPS','FUL','TS'),
	 ('Barnyard grass','Echinochloa crusgalli','ECHI','CRU','BA'),
	 ('Leafy spurge','Euphorbia esula','EUPH','ESU','LS'),
	 ('Eyebright','Euphrasia nemorosa','EUPH','NEM','EY'),
	 ('Tartary buckwheat','Fagopyrum tataricum','FAGO','TAT','TB');
INSERT INTO invasivesbc.species_ref_raw (common_name,latin_name,genus,species,map_symbol) VALUES
	 ('Cudweed','Gnaphalium uliginosum','GNAP','ULI','CU'),
	 ('Giant hogweed','Heracleum mantegazzianum','HERA','MAN','GH'),
	 ('Dame''s rocket','Hesperis matronalis','HESP','MAT','DR'),
	 ('Orange hawkweed','Hieracium aurantiacum','HIER','AUR','OH'),
	 ('Yellow hawkweed','Hieracium pratense','HIER','PRA','YH'),
	 ('St. John''s wort/Saint John''s wort/ Goatweed','Hypericum perforatum','HYPE','PER','SJ'),
	 ('Field scabious','Knautia arvensis','KNAU','ARV','FS'),
	 ('Kochia','Kochia scoparia','KOCH','SCO','KO'),
	 ('Perennial pepperweed','Lepidium latifolium','LEPI','LAT','PP'),
	 ('Oxeye daisy','Leucanthemum vulgare','LEUC','VUL','OD');
INSERT INTO invasivesbc.species_ref_raw (common_name,latin_name,genus,species,map_symbol) VALUES
	 ('Dalmatian toadflax','Linaria dalmatica','LINA','DAL','DT'),
	 ('White cockle','Lychnis alba','LYCH','ALB','WC'),
	 ('Purple loosestrife','Lythrum salicaria','LYTH','SAL','PL'),
	 ('Chilean tarweed','Madia sativa','MADI','SAT','CH'),
	 ('Scentless chamomile','Matricaria perforata','MATR','PER','SH'),
	 ('Scotch thistle','Onopordum acanthium','ONOP','ACA','ST'),
	 ('Wild buckwheat','Polygonum convolvulus','POLY','CON','WB'),
	 ('Lady''s-thumb','Polygonum persicaria','POLY','PER','LT'),
	 ('Himalayan knotweed','Polygonum polystachyum','POLY','POL','PO'),
	 ('Sulphur cinquefoil','Potentilla recta','POTE','REC','SC');
INSERT INTO invasivesbc.species_ref_raw (common_name,latin_name,genus,species,map_symbol) VALUES
	 ('Creeping buttercup','Ranunculus repens','RANU','REP','CR'),
	 ('Sheep sorrel','Rumex acetosella','RUME','ACE','SS'),
	 ('Curled dock','Rumex crispus','RUME','CRI','CD'),
	 ('Russian thistle','Salsola kali','SALS','KAL','RT'),
	 ('Tansy ragwort','Senecio jacobaea','SENE','JAC','TR'),
	 ('Groundsel','Senecio vulgaris','SENE','VUL','GS'),
	 ('Night-flowering catchfly','Silene noctiflora','SILE','NOC','NC'),
	 ('Nightshade','Solanum spp','SOLA','SPP','NI'),
	 ('Perennial sow thistle','Sonchus arvensis','SONC','ARV','PS'),
	 ('Annual sow thistle','Sonchus oleraceus','SONC','OLE','AS');
INSERT INTO invasivesbc.species_ref_raw (common_name,latin_name,genus,species,map_symbol) VALUES
	 ('Sowthistle species','Sonchus species','SONC','SPP','SO'),
	 ('Common tansy','Tanacetum vulgare','TANA','VUL','TC'),
	 ('Western goat''s-beard','Tragopogon dubius','TRAG','DUB','WG'),
	 ('Meadow goats-beard','Tragopogon pratensis','TRAG','PRA','MG'),
	 ('Puncturevine','Tribulus terrestris','TRIB','TER','PV'),
	 ('Gorse','Ulex europaeus','ULEX','EUR','GO'),
	 ('Burdock species','Arctium spp','ARCT','SPP','BU'),
	 ('Mountain bluet','Centaurea montana','CENT','MON','MO'),
	 ('Blueweed','Echium vulgare','ECHI','VUL','BW'),
	 ('English ivy','Hedera helix','HEDE','HEL','EI');
INSERT INTO invasivesbc.species_ref_raw (common_name,latin_name,genus,species,map_symbol) VALUES
	 ('Polar hawkweed','Hieracium atratum','HIER','ATR','PA'),
	 ('Meadow hawkweed','Hieracium caespitosum','HIER','CAE','MH'),
	 ('Whiplash hawkweed','Hieracium flagellare','HIER','FLA','WP'),
	 ('King devil hawkweed','Hieracium floribundum','HIER','FLO','KH'),
	 ('Yellow devil hawkweed','Hieracium glomeratum','HIER','GLO','YD'),
	 ('Smooth hawkweed','Hieracium laevigatum','HIER','LAE','SM'),
	 ('Spotted hawkweed','Hieracium maculatum','HIER','MAC','SX'),
	 ('Wall hawkweed','Hieracium murorum','HIER','MUR','WA'),
	 ('Tall hawkweed','Hieracium piloselloides','HIER','OID','TH'),
	 ('Mouse ear hawkweed','Hieracium pilosella','HIER','PIL','ME');
INSERT INTO invasivesbc.species_ref_raw (common_name,latin_name,genus,species,map_symbol) VALUES
	 ('Queen devil hawkweed','Hieracium praealtum','HIER','PRE','QH'),
	 ('European hawkweed','Hieracium sabaudum','HIER','SAB','EH'),
	 ('Meadow buttercup','Ranunculus acris','RANU','ACR','MB'),
	 ('Saltwater cord grass','Spartina alterniflora','SPAR','ALT','SA'),
	 ('Salt-meadow cord grass','Spartina patens','SPAR','PAT','SN'),
	 ('Carpet burweed','Soliva sessilis','SOLI','SES','CG'),
	 ('Black knapweed','Centaurea nigra','CENT','NIG','BL'),
	 ('Annual hawksbeard','Crepis tectorum','CREP','TEC','HB'),
	 ('Hairy cat''s-ear','Hypochaeris radicata','HYPO','RAD','HR'),
	 ('Bachelor''s button','Centaurea cyanus','CENT','CYA','BB');
INSERT INTO invasivesbc.species_ref_raw (common_name,latin_name,genus,species,map_symbol) VALUES
	 ('Policeman''s helmet / himalayan balsam','Impatiens glandulifera','IMPA','GLA','IM'),
	 ('Baby''s breath','Gypsophila paniculata','GYPS','PAN','BY'),
	 ('Common bugloss','Anchusa officinalis','ANCH','OFF','AO'),
	 ('Cypress spurge','Euphorbia cyparissias','EUPH','CYP','CS'),
	 ('Green foxtail / green bristlegrass','Setaria viridis','SETA','VIR','GF'),
	 ('Meadow knapweed','Centaurea debeauxii','CENT','DEB','MK'),
	 ('Scotch broom','Cytisus scoparius','CYTI','SCO','SB'),
	 ('Redroot amaranth / rough pigweed','Amaranthus retroflexus','AMAR','RET','RP'),
	 ('Wild mustard','Sinapis arvensis','SINA','ARV','WM'),
	 ('Wormwood','Artemisia absinthium','ARTE','ABS','WW');
INSERT INTO invasivesbc.species_ref_raw (common_name,latin_name,genus,species,map_symbol) VALUES
	 ('Yellow/common toadflax','Linaria vulgaris','LINA','VUL','YT'),
	 ('Milk thistle','Silybum marianum','SILY','MAR','MI'),
	 ('Tree of heaven','Ailanthus altissima','AILA','ALT','AA'),
	 ('Russian olive','Elaeagnus angustifolia','ELAE','ANG','RO'),
	 ('Eurasian watermilfoil','Myriophyllum spicatum','MYRI','SPI','EW'),
	 ('Garlic mustard','Alliaria petiolata','ALLI','PET','AP'),
	 ('Black locust','Robinia pseudoacacia','ROBI','PSE','RB'),
	 ('Butterfly bush','Buddleja davidii','BUDD','DAV','BD'),
	 ('Cutleaf blackberry','Rubus laciniatus','RUBU','LAC','CL'),
	 ('Dense-flowered cordgrass','Spartina densiflora','SPAR','DEN','DC');
INSERT INTO invasivesbc.species_ref_raw (common_name,latin_name,genus,species,map_symbol) VALUES
	 ('English cordgrass','Spartina anglica','SPAR','ANG','EC'),
	 ('Flowering rush','Butomus umbellatus','BUTO','UMB','FR'),
	 ('French broom','Genista monspessulana','GENI','MON','GM'),
	 ('Herb robert','Geranium robertianum','GERA','ROB','GR'),
	 ('Parrot feather','Myriophyllum aquaticum','MYRI','AQU','PF'),
	 ('Portuguese broom','Cytisus striatus','CYTI','STR','PR'),
	 ('Purple deadnettle','Lamium purpureum','LAMI','PUR','PD'),
	 ('Queen anne''s lace / wild carrot','Daucus carota','DAUC','CAR','QA'),
	 ('Spanish broom','Spartium junceum','SPAR','JUN','SI'),
	 ('Sweet fennel','Foeniculum vulgare','FOEN','VUL','SF');
INSERT INTO invasivesbc.species_ref_raw (common_name,latin_name,genus,species,map_symbol) VALUES
	 ('Wand loosestrife','Lythrum virgatum','LYTH','VIR','WL'),
	 ('Yellow archangel','Lamiastrum galeobdolon','LAMI','GAL','YA'),
	 ('Yellow floating heart','Nymphoides peltata','NYMP','PEL','YF'),
	 ('Bristly locust / rose acacia','Robinia hispida','ROBI','HIS','RA'),
	 ('Longspine sandbur','Cenchrus longispinus','CENC','LON','LO'),
	 ('Wild four o''clock','Mirabilis nyctaginea','MIRA','NYC','WF'),
	 ('Meadow clary','Salvia pratensis','SALV','PRA','MC'),
	 ('Siberian elm','Ulmus pumila','ULMU','PUM','SE'),
	 ('Smooth cat''s ear','Hypochaeris glabra','HYPO','GLA','HG'),
	 ('Brown knapweed','Centaurea jacea','CENT','JAC','BK');
INSERT INTO invasivesbc.species_ref_raw (common_name,latin_name,genus,species,map_symbol) VALUES
	 ('Saltcedar / tamarisk','Tamarix ramosissima','TAMA','RAM','TA'),
	 ('Cheatgrass / downy brome','Bromus tectorum','BROM','TEC','DB'),
	 ('Japanese knotweed','Fallopia japonica','FALL','JAP','JK'),
	 ('Himalayan blackberry','Rubus armeniacus','RUBU','ARM','HI'),
	 ('Giant knotweed','Fallopia sachalinensis','FALL','SAC','GK'),
	 ('Bladder campion','Silene vulgaris','SILE','VUL','BC'),
	 ('Black henbane','Hyoscyamus niger','HYOS','NIG','BH'),
	 ('Prickly comfrey','Symphytum asperum','SYMP','ASP','PC'),
	 ('Common comfrey','Symphytum officinale','SYMP','OFF','CO'),
	 ('Didymo','Didymosphenia geminata','DIDY','GEM','DI');
INSERT INTO invasivesbc.species_ref_raw (common_name,latin_name,genus,species,map_symbol) VALUES
	 ('Dwarf eelgrass','Zostera japonica','ZOST','JAP','DE'),
	 ('English holly','Ilex aquifolium','ILEX','AQU','HO'),
	 ('Japanese wireweed','Sargassum muticum','SARG','MUT','JW'),
	 ('Old man''s beard / traveller''s joy','Clematis vitalba','CLEM','VIT','OM'),
	 ('Bigleaf periwinkle / large periwinkle','Vinca major','VINC','MAJ','BP'),
	 ('Common periwinkle','Vinca minor','VINC','MIN','CP'),
	 ('Daphne / spurge laurel','Daphne laureola','DAPH','LAU','SL'),
	 ('Cherry laurel','Prunus laurocerasus','PRUN','LAU','LC'),
	 ('Fragrant water lily','Nymphaea odorata subsp. odorata','NYMP','ODO','FL'),
	 ('Spanish bluebells','Hyacinthoides hispanica','HYAC','HIS','BS');
INSERT INTO invasivesbc.species_ref_raw (common_name,latin_name,genus,species,map_symbol) VALUES
	 ('Coltsfoot','Tussilago farfara','TUSS','FAR','CF'),
	 ('Greater celandine','Chelidonium majus','CHEL','MAJ','GC'),
	 ('Hedgehog dogtail','Cynosurus echinatus','CYNO','ECH','HD'),
	 ('Goutweed / bishop''s weed','Aegopodium podagraria','AEGO','POD','GW'),
	 ('Hedge false bindweed','Calystegia sepium','CALY','SEP','BI'),
	 ('African rue / harmal','Peganum harmala','PEGA','HAR','AR'),
	 ('Camel thorn','Alhagi maurorum','ALHA','MAU','AM'),
	 ('Dyer''s woad','Isatis tinctoria','ISAT','TIN','DW'),
	 ('Eggleaf spurge','Euphorbia oblongata','EUPH','OBL','ES'),
	 ('False brome','Brachypodium sylvaticum','BRAC','SYL','BF');
INSERT INTO invasivesbc.species_ref_raw (common_name,latin_name,genus,species,map_symbol) VALUES
	 ('Giant reed / giant cane','Arundo donax','ARUN','DON','AD'),
	 ('Goat''s rue / french lilac','Galega officinalis','GALE','OFF','RG'),
	 ('Saltlover / halogeton','Halogeton glomeratus','HALO','GLO','AH'),
	 ('Johnsongrass','Sorghum halepense','SORG','HAL','GJ'),
	 ('Kudzu','Pueraria montana','PUER','MON','KU'),
	 ('Medusahead','Taeniatherum caput-medusae','TAEN','CAP','TM'),
	 ('Red bartsia','Odontites serotina','ODON','SER','BR'),
	 ('Bog bulrush / ricefield bulrush','Schoenoplectus mucronatus','SCHO','MUC','RI'),
	 ('Clary sage','Salvia sclarea','SALV','SCL','CE'),
	 ('Mediterranean sage','Salvia aethiopsis','SALV','AET','MS');
INSERT INTO invasivesbc.species_ref_raw (common_name,latin_name,genus,species,map_symbol) VALUES
	 ('Shiny geranium','Geranium lucidum','GERA','LUC','SG'),
	 ('Silverleaf nightshade','Solanum elaeagnifolium','SOLA','ELA','NS'),
	 ('Slender meadow foxtail','Alopecurus myosuroides','ALOP','MYO','FT'),
	 ('Spring millet grass','Milium vernale','MILI','VER','MV'),
	 ('Spurge flax','Thymelaea passerina','THYM','PAS','TP'),
	 ('Iberian starthistle','Centaurea iberica','CENT','IBE','IS'),
	 ('Purple starthistle','Centaurea calcitrapa','CENT','CAL','PU'),
	 ('Syrian bean-caper','Zygophyllum fabago','ZYGO','FAB','SY'),
	 ('Texas blueweed','Helianthus ciliaris','HELI','CIL','TX'),
	 ('Italian plumeless thistle','Carduus pycnocephalus','CARD','PYC','IT');
INSERT INTO invasivesbc.species_ref_raw (common_name,latin_name,genus,species,map_symbol) VALUES
	 ('Winged thistle / slender-flowered thistle','Carduus tenuiflorus','CARD','TEN','WT'),
	 ('Brazilian waterweed','Egeria densa','EGER','DEN','ED'),
	 ('Giant mannagrass / reed sweetgrass','Glyceria maxima','GLYC','MAX','SW'),
	 ('Hydrilla','Hydrilla verticillata','HYDR','VER','HY'),
	 ('Garden yellow loosestrife','Lysimachia vulgaris','LYSI','VUL','GL'),
	 ('Water hyacinth','Eichhornia crassipes','EICH','CRA','WH'),
	 ('Common reed','Phragmites australis subsp. australis','PHRA','AUS','RC'),
	 ('Wild chervil','Anthriscus sylvestris','ANTH','SYL','WI'),
	 ('North africa grass','Ventenata dubia','VENT','DUB','NA'),
	 ('Squarrose knapweed','Centaurea virgata ssp. squarrosa','CENT','VIR','CV');
INSERT INTO invasivesbc.species_ref_raw (common_name,latin_name,genus,species,map_symbol) VALUES
	 ('Bur chervil','Anthriscus caucalis','ANTH','CAU','CB'),
	 ('Large yellow loosestrife / spotted loosestrife','Lysimachia punctata','LYSI','PUN','LL'),
	 ('Lesser celandine / fig buttercup','Ranunculus ficaria','RANU','FIC','RF'),
	 ('Short-fringed knapweed','Centaurea nigrescens','CENT','NIR','CN'),
	 ('European beachgrass','Ammophila arenaria','AMMO','ARE','EB'),
	 ('American beachgrass','Ammophila breviligulata','AMMO','BRE','AB'),
	 ('Feathered mosquito-fern','Azolla pinnata','AZOL','PIN','FM'),
	 ('Fanwort','Cabomba caroliniana','CABO','CAR','FW'),
	 ('European lake sedge','Carex acutiformis','CARE','ACU','EL'),
	 ('Common frogbit','Hydrocharis morsus-range','HYDR','MOR','FC');
INSERT INTO invasivesbc.species_ref_raw (common_name,latin_name,genus,species,map_symbol) VALUES
	 ('Major oxygen weed','Lagarosiphon','LAGA','ROS','OW'),
	 ('European water clover','Marsilea quadrifolia','MARS','QUA','MQ'),
	 ('Giant chickweed','Myosoton aquaticum','MYOS','AQU','MA'),
	 ('Variable leaf milfoil','Myriophyllum heterophyllum','MYRI','HET','LM'),
	 ('Watercress','Nasturtium officinale','NAST','OFF','NO'),
	 ('European waterlily','Nymphaea alba','NYMP','ALB','WE'),
	 ('Water lettuce','Pistia stratiotes','PIST','STR','LW'),
	 ('Curly leaf pondweed','Potamogeton crispus','POTA','CRI','UP'),
	 ('Amphibious yellow cress','Rorippa amphibian','RORI','AMP','YC'),
	 ('Giant salvinia','Salvinia molesta','SALV','MOL','SV');
INSERT INTO invasivesbc.species_ref_raw (common_name,latin_name,genus,species,map_symbol) VALUES
	 ('Water soldier','Stratiotes aloides','STRA','ALO','AQ'),
	 ('Water chestnut','Trapa natans','TRAP','NAT','TN'),
	 ('Wild parsnip','Pastinaca sativa','PAST','SAT','PW'),
	 ('Flat pea / flat peavine','Lathyrus sylvestris','LATH','SYL','FP'),
	 ('Bighead knapweed','Centaurea macrocephala','CENT','MAC','KB'),
	 ('Yellow hawkweed species','Hieracium spp','HIER','SPP','HS'),
	 ('Maltese star thistle','Centaurea melitensis','CENT','MEL','MX'),
	 ('Bur buttercup','Ceratocephalus testiculatus','CERA','TES','UR'),
	 ('Bohemian knotweed','Fallopia x bohemica','FALL','BOH','BO'),
	 ('Common hawkweed','Hieracium lachenalii','HIER','VUL','CX');
INSERT INTO invasivesbc.species_ref_raw (common_name,latin_name,genus,species,map_symbol) VALUES
	 ('Mullein','Verbascum thapsus','VERB','THA','MU'),
	 ('Portuguese laurel','Prunus lusitanica','PRUN','LUS','LP'),
	 ('Wood sage','Salvia nemorosa','SALV','NEM','WS'),
	 ('Yellow iris','Iris pseudacorus','IRIS','PSE','YI'),
	 ('Paterson''s curse','Echium plantagineum','ECHI','PLA','EP'),
	 ('Lens-pod hoary cress','Lepidium chalepense l.','LEPI','CHA','LH'),
	 ('Globe-pod hoary cress','Lepidium appelianum al-shehbaz','LEPI','APP','GP'),
	 ('Japanese butterbur','Petasites japonicus','PETA','JAP','JP'),
	 ('Myrtle spurge','Euphorbia myrsinites','EUPH','MYR','EM'),
	 ('Velvet leaf','Abutilon theophrasti','ABUT','THE','VL');
INSERT INTO invasivesbc.species_ref_raw (common_name,latin_name,genus,species,map_symbol) VALUES
	 ('Expired - do not use','Expired - do not use','ZZZZ','YYY','ZZ'),
	 ('Heart-podded hoary cress','Lepidium draba','CARD','DRA','HC'),
	 ('White spanish broom','Cytisus multiflorus','CYTI','MUL','SR'),
	 ('Reed canary grass','Phalaris arundinacea','PHAL','ARU','RE');
  
	 create or replace view iapp_species_ref_raw as (

		with all_plant_codes as (
			select
				c.code_id,
				c.code_description,
				c.code_name,
				ch.code_header_name,
				c.code_header_id
			from code c
			join code_header ch on c.code_header_id = ch.code_header_id
			where ch.code_header_name in ('invasive_plant_code', 'invasive_plant_code_withbiocontrol', 'invasive_plant_aquatic_code')
		)
		select
			c.code_id
			,c.code_header_id
			,n.common_name
			,n.latin_name
			,n.genus
			,n.species
			,n.map_symbol
		from
			species_ref_raw n
		join all_plant_codes c on c.code_name = n.map_symbol
	);
	 `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  set search_path=invasivesbc,public;
  drop view if exists invasivesbc.species_ref_raw;
`);
}

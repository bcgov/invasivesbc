import fs from 'fs';
import { AxiosRequestConfig } from 'axios';
import csv from 'csvtojson';
import axios from 'axios';
import qs from 'qs';
import moment from 'moment';
import meow from 'meow';

// HELPER FUNCTIONS (TODO move somewhere more general):

const formatDateToISO = (dateString: string) => {
  const supportedFormats = ['YYYY-MM-DD', 'YYYY/MM/DD', 'DD/MM/YYYY', 'DD-MM-YYYY'];
  if (!dateString) return;
  return moment(dateString, supportedFormats).format('YYYY-MM-DD');
};

// return items matching field value in an array of objects sorted by field
// https://www.w3resource.com/javascript-exercises/javascript-array-exercise-18.php
const binarySearchValues = (items, field, value) => {
  if (!items?.length) return [];
  let firstIndex = 0;
  let lastIndex = items.length - 1;
  let middleIndex = Math.floor((lastIndex + firstIndex) / 2);

  while (items[middleIndex][field] !== value && firstIndex < lastIndex) {
    if (value < items[middleIndex][field]) {
      lastIndex = Math.max(middleIndex - 1, 0);
    } else if (value > items[middleIndex][field]) {
      firstIndex = Math.min(middleIndex + 1, items.length - 1);
    }
    middleIndex = Math.floor((lastIndex + firstIndex) / 2);
  }

  if (items[middleIndex][field] !== value) return [];

  // get multiple matches:
  firstIndex = lastIndex = middleIndex;
  while (firstIndex > 0 && items[firstIndex - 1][field] === value) firstIndex = firstIndex - 1;
  while (lastIndex < items.length - 1 && items[lastIndex + 1][field] === value) lastIndex = lastIndex + 1;

  return items.slice(firstIndex, lastIndex + 1);
};

// helper to get common values of an array of objects
// returns fallback value if empty or no common value
const getCommonValue = (array, fallback = undefined) => (new Set(array).size === 1 ? array[0] : fallback);

const hectaresToM2 = (hectares) => Math.round(Number(hectares) * 10000) | 0;

const mapYN = (value) => {
  switch (value) {
    case 'Y':
      return 'Yes';
    case 'N':
      return 'No';
    default:
      return 'Unknown';
  }
};

const mapSlope = (slope) => {
  if (slope === '') return 'NA';
  slope = Number(slope);
  if (!slope) return 'FL';
  if (slope < 5) return 'NF';
  if (slope < 10) return 'GS';
  if (slope < 15) return 'MS';
  if (slope < 20) return 'SS';
  if (slope < 25) return 'VS';
  if (slope < 30) return 'ES';
  if (slope < 45) return 'ST';
  if (slope >= 45) return 'VT';
  return 'NA';
};

const mapAspect = (aspect) => {
  aspect = Number(aspect);
  if ((aspect > 333.5 && aspect <= 360) || aspect <= 22.5) return 'N';
  if (aspect <= 67.5) return 'NE';
  if (aspect <= 112.5) return 'E';
  if (aspect <= 157.5) return 'SE';
  if (aspect <= 202.5) return 'S';
  if (aspect <= 247.5) return 'SW';
  if (aspect <= 292.5) return 'W';
  if (aspect <= 333.5) return 'NW';
  return 'NA';
};

const mapEfficacyCode = (percent) => {
  percent = Number(percent);
  if (percent < 10) return 10;
  if (percent < 20) return 9;
  if (percent < 30) return 8;
  if (percent < 40) return 7;
  if (percent < 50) return 6;
  if (percent < 60) return 5;
  if (percent < 70) return 4;
  if (percent < 80) return 3;
  if (percent < 90) return 2;
  if (percent <= 100) return 1;
  return;
};

const mapBioAgentStageCode = (t) => {
  let count = 0;
  let ret = 'NA';
  if (t.STAGE_LARVA_IND) {
    count += 1;
    ret = 'LA';
  }
  if (t.STAGE_PUPA_IND) {
    count += 1;
    ret = 'PU';
  }
  if (t.STAGE_EGG_IND) {
    count += 1;
    ret = 'EG';
  }
  if (t.STAGE_OTHER_IND) {
    count += 1;
    ret = 'OT';
  }
  if (count > 1) return 'AL';
  return ret;
};

// LOOKUP TABLES:

const densityMap = {
  '0: Unknown Density': 'X',
  '1: Low (<= 1 plant/m2)': 'L',
  '2: Med (2-5 plants/m2)': 'M',
  '3: High (6-10 plants/m2)': 'H',
  '4: Dense (>10 plants/m2)': 'D'
};

const distributionMap = {
  '0: Unknown distribution': 'NA',
  '1: rare individual / single occurrence': 'RS',
  '2: few sporadically': 'FS',
  '3: single patch or clump': 'CL',
  '4: several sporadically individuals': 'SS',
  '5: a few patches or clumps': 'FP',
  '6: several well-spaced patches / clumps': 'WS',
  '7: continuous / uniform': 'CU',
  '8: continuous with a few gaps': 'CO',
  '9: continuous / dense': 'CD'
};

const observationTypes = {
  'C: Cursory': 'CU',
  'O: Operational': 'OP',
  'P: Precise': 'PR'
  // add more as they show up in CSV
};

const specificUseMap = (use) => {
  switch (use) {
    // legacy code renaming:
    case 'GR':
      return 'GP';
    case 'WP':
      return 'PF';
    case 'RT':
      return 'RS';
    case 'YW':
      return 'YD';
    default:
      return use;
  }
};

const mechMethodCodes = {
  Digging: 'DIG',
  Bury: 'BRY',
  'Controlled Burning': 'BUR',
  'Cultivation or till': 'CUL',
  'Dead-heading': 'DED',
  'Flaming / burn': 'FLA',
  'Flaming / Tiger Torch burn': 'FLA',
  'Hand pulling': 'HAN',
  'Hot water / Steam': 'HWS',
  Mowing: 'MOW',
  Mulching: 'MUL',
  'Suction dredging': 'SD',
  'Sheet Mulching': 'SHM',
  'Salt water / Vinegar': 'SV',
  'Targeted grazing': 'TG',
  Tarping: 'TR',
  Seeding: 'SED',
  Planting: 'PLT',
  Legacy: 'CNV', // Note, may want to treat this differently
  'Mechanical Method not recorded': 'CNV'
};

const chemMethodCodes = {
  ATV: 'ATV',
  'Basal Bark': 'BBA',
  'Boomless Nozzle': 'BNO',
  'Back Pack': 'BPA',
  'Cut and Insert': 'CIN',
  'Cut Stump / Cut and Paint': 'CSP',
  'Cut Stump / Paint': 'CSP',
  'Fixed Boom': 'FBO',
  'Hand Gun': 'HGU',
  'Chemical Method not recorded': 'NOT',
  'Stem Injection': 'SIN',
  Spread: 'SPR',
  Wick: 'WCK'
};

// "but you could just import these from the openapi codes tables!"
// "yes but this is so much easier for a throwaway migrator!"
const invasiveSpeciesCodes = {
  // TERRESTRIAL
  AR: 'African rue / harmal (PEGA HAR Peganum harmala)',
  HB: 'Annual hawksbeard (CREP TEC Crepis tectorum)',
  AS: 'Annual sow thistle (SONC OLE Sonchus oleraceus)',
  BN: 'American black nightshade (SOLA AME Solanum americanum)',
  BY: "Baby's breath (GYPS PAN Gypsophila paniculata)",
  BB: "Bachelor's button (CENT CYA Centaurea cyanus)",
  BA: 'Barnyard grass (ECHI CRU Echinochloa crusgalli)',
  KB: 'Bighead knapweed (CENT MAC Centaurea macrocephala)',
  BP: 'Bigleaf periwinkle / large periwinkle (VINC MAJ Vinca major)',
  BH: 'Black henbane (HYOS NIG Hyoscyamus niger)',
  BL: 'Black knapweed (CENT NIG Centaurea nigra)',
  RB: 'Black locust (ROBI PSE Robinia pseudoacacia)',
  BC: 'Bladder campion (SILE VUL Silene vulgaris)',
  BW: 'Blueweed (ECHI VUL Echium vulgare)',
  BO: 'Bohemian knotweed (FALL BOH Fallopia x bohemicum)',
  RA: 'Bristly locust / rose acacia (ROBI HIS Robinia hispida)',
  BK: 'Brown knapweed (CENT JAC Centaurea jacea)',
  BT: 'Bull thistle (CIRS VUL Cirsium vulgare)',
  CB: 'Bur chervil (ANTH CAU Anthriscus caucalis),20',
  UR: 'Bur buttercup (CERA TES Ceratocephala testiculata)',
  BU: 'Common burdock (ARCT MIN  Arctium minus)',
  GB: 'Great burdock (ARCT LAP Arctium lappa)',
  BD: 'Butterfly bush (BUDD DAV Buddleja davidii)',
  FF: 'Buffalobur (SOLA ROS Solanum rostratum)',
  AM: 'Camel thorn (ALHA MAU Alhagi maurorum)',
  CT: 'Canada thistle (CIRS ARV Cirsium arvense)',
  CA: 'Caraway (CARU CAR Carum carvi)',
  CG: 'Carpet burweed (SOLI SES Soliva sessilis)',
  DB: 'Cheatgrass / downy brome (BROM TEC Bromus tectorum)',
  LC: 'Cherry laurel (PRUN LAU Prunus laurocerasus)',
  CY: 'Chicory (CICH INT Cichorium intybus)',
  CH: 'Chilean tarweed (MADI SAT Madia sativa)',
  CE: 'Clary sage (SALV SCL Salvia sclarea)',
  CF: 'Coltsfoot (TUSS FAR Tussilago farfara)',
  AO: 'Common bugloss (ANCH OFF Anchusa officinalis)',
  CO: 'Common comfrey (SYMP OFF Symphytum officinale)',
  CC: 'Common crupina (CRUP VUL Crupina vulgaris)',
  CX: 'Common hawkweed (PILO VUL Pilosella / Hieracium lanchenalii)',
  CP: 'Common periwinkle (VINC MIN Vinca minor)',
  TC: 'Common tansy (TANA VUL Tanacetum vulgare)',
  CR: 'Creeping buttercup (RANU REP Ranunculus repens)',
  CU: 'Cudweed (GNAP ULI Gnaphalium uliginosum)',
  CD: 'Curled dock (RUME CRI Rumex crispus)',
  CL: 'Cutleaf blackberry (RUBU LAC Rubus laciniatus)',
  CS: 'Cypress spurge (EUPH CYP Euphorbia cyparissias)',
  DT: 'Dalmatian toadflax (LINA DAL Linaria dalmatica)',
  DR: "Dame's rocket (HESP MAT Hesperis matronalis)",
  SL: 'Daphne / spurge laurel (DAPH LAU Daphne laureola)',
  DK: 'Diffuse knapweed (CENT DIF Centaurea diffusa)',
  DO: 'Dodder (CUSC SPP Cuscuta spp.)',
  DE: 'Dwarf eelgrass (ZOST JAP Zostera japonica)',
  DW: "Dyer's woad (ISAT TIN Isatis tinctoria)",
  ES: 'Eggleaf spurge (EUPH OBL Euphorbia oblongata)',
  HO: 'English holly (ILEX AQU Ilex aquifolium)',
  EI: 'English ivy (HEDE HEL Hedera helix)',
  EU: 'European bittersweet / climbing nightshade (SOLA DUL Solanum dulcamara)',
  RC: 'European Common Reed / Common reed (PHRA AUS Phragmites australis subsp. australis)',
  EH: 'European hawkweed (PILO SAB Pilosella / Hieracium sabaudum)',
  EY: 'Eyebright (EUPH NEM Euphrasia nemorosa)',
  FB: 'Field bindweed (CONV ARV Convolvulus arvensis)',
  FS: 'Field scabious (KNAU ARV Knautia arvensis)',
  FP: 'Flat pea / flat peavine (LATH SYL Lathyrus sylvestris)',
  GM: 'French broom (GENI MON Genista monspessulana)',
  AP: 'Garlic mustard (ALLI PET Alliaria petiolata)',
  MA: 'Giant chickweed (MYOS AQU Myosoton aquaticum)',
  GH: 'Giant hogweed (HERA MAN Heracleum mantegazzianum)',
  GK: 'Giant knotweed (FALL SAC Fallopia sachalinensis)',
  SW: 'Giant mannagrass / reed sweetgrass (GLYC MAX Glyceria maxima)',
  AD: 'Giant reed / giant cane (ARUN DON Arundo donax)',
  GP: 'Globepod hoary cress (LEPI APP Lepidium appelianum )',
  RG: "Goat's rue / french lilac (GALE OFF Galega officinalis)",
  GO: 'Gorse (ULEX EUR Ulex europaeus)',
  GW: "Goutweed / bishop's weed (AEGO POD Aegopodium podagraria)",
  GC: 'Greater celandine (CHEL MAJ Chelidonium majus)',
  GN: 'Greater knapweed (CENT SCA Centaurea scabiosa)',
  GF: 'Green foxtail / green bristlegrass (SETA VIR Setaria viridis)',
  GS: 'Groundsel (SENE VUL Senecio vulgaris)',
  HR: "Hairy cat'sear (HYPO RAD Hypochaeris radicata)",
  HC: 'Heartpodded hoary cress / Hoary cress (CARD DRA Cardaria draba)',
  BI: 'Hedge false bindweed (CALY SEP Calystegia sepium)',
  HD: 'Hedgehog dogtail (CYNO ECH Cynosurus echinatus)',
  GR: 'Herb robert (GERA ROB Geranium robertianum)',
  HI: 'Himalayan blackberry (RUBU ARM Rubus armeniacus)',
  PO: 'Himalayan knotweed (POLY POL Polygonum polystachyum)',
  HA: 'Hoary alyssum (BERT INC Berteroa incana)',
  HT: "Hound'stongue (CYNO OFF Cynoglossum officinale)",
  IS: 'Iberian starthistle (CENT IBE Centaurea iberica)',
  IT: 'Italian plumeless thistle (CARD PYC Carduus pycnocephalus)',
  JP: 'Japanese butterbur (PETA JAP Petasites japonicus)',
  JK: 'Japanese knotweed (FALL JAP Fallopia japonica)',
  JW: 'Japanese wireweed (SARG MUT Sargassum muticum)',
  GJ: 'Johnsongrass (SORG HAL Sorghum halepense)',
  JG: 'Jointed goatgrass (AEGI CYL Aegilops cylindrica)',
  KH: 'Kingdevil hawkweed (HIER FLO Hieracium floribundum)',
  KO: 'Kochia (KOCH SCO Kochia scoparia)',
  KU: 'Kudzu (PUER MON Pueraria montana)',
  LT: "Lady'sthumb (POLY PER Polygonum persicaria)",
  LS: 'Leafy spurge (EUPH ESU Euphorbia esula)',
  LH: 'Lenspod hoary cress  (LEPI CHA Lepidium chalepense)',
  RF: 'Lesser celandine / fig buttercup (RANU FIC Ranunculus ficaria)',
  LO: 'Longspine sandbur (CENC LON Cenchrus longispinus)',
  MX: 'Maltese star thistle (CENT MEL Centaurea melitensis)',
  MT: 'Marsh plume thistle / Marsh thistle (CIRS PAL Cirsium palustre)',
  MB: 'Meadow buttercup (RANU ACR Ranunculus acris)',
  MC: 'Meadow clary (SALV PRA Salvia pratensis)',
  MG: 'Meadow goatsbeard (TRAG PRA Tragopogon pratensis)',
  MH: 'Meadow hawkweed (HIER CAE Hieracium caespitosum)',
  MK: 'Meadow knapweed (CENT DEB Centaurea debeauxii)',
  MS: 'Mediterranean sage (SALV AET Salvia aethiopsis)',
  TM: 'Medusahead (TAEN CAP Taeniatherum caputmedusae)',
  MI: 'Milk thistle (SILY MAR Silybum marianum)',
  MO: 'Mountain bluet (CENT MON Centaurea montana)',
  ME: 'Mouse ear hawkweed (HIER PIL Hieracium pilosella)',
  MU: 'Mullein (VERB THA Verbascum thapsis)',
  EM: 'Myrtle spurge (EUPH MYR Euphorbia myrsinites)',
  NC: 'Nightflowering catchfly (SILE NOC Silene noctiflora)',
  NT: 'Nodding thistle (CARD NUT Carduus nutans)',
  NA: 'North africa grass (VENT DUB Ventenata dubia)',
  OM: "Old man's beard / traveller's joy (CLEM VIT Clematis vitalba)",
  OH: 'Orange hawkweed (HIER AUR Hieracium aurantiacum)',
  OD: 'Oxeye daisy (LEUC VUL Leucanthemum vulgare)',
  EP: "Paterson's Curse (ECHI PLA Echium plantagineum)",
  PP: 'Perennial pepperweed (LEPI LAT Lepidium latifolium)',
  PS: 'Perennial sow thistle (SONC ARV Sonchus arvensis)',
  PT: 'Plumeless thistle (CARD ACA Carduus acanthoides)',
  PH: 'Poison hemlock (CONI MAC Conium maculatum)',
  PA: 'Polar hawkweed (PILO ATR Pilosella / Hieracium atratum)',
  IM: "Policeman's helmet / himalayan balsam (IMPA GLA Impatiens glandulifera)",
  PR: 'Portuguese broom (CYTI STR Cytisus striatus)',
  LP: 'Portugese laurel (PRUN LUS Prunus lusitanica)',
  PC: 'Prickly comfrey (SYMP ASP Symphytum asperum)',
  PV: 'Puncturevine (TRIB TER Tribulus terrestris)',
  PD: 'Purple deadnettle (LAMI PUR Lamium purpureum)',
  PN: 'Purple nutsedge (CYPE ROT Cyperus rotundus)',
  PU: 'Purple starthistle (CENT CAL Centaurea calcitrapa)',
  QA: "Queen anne's lace / wild carrot (DAUC CAR Daucus carota)",
  QH: 'Queendevil hawkweed (HIER PRE Hieracium praealtum)',
  BR: 'Red bartsia (ODON SER Odontites serotina)',
  RP: 'Redroot amaranth / rough pigweed (AMAR RET Amaranthus retroflexus)',
  RE: 'Reed Canary Grass (PHAL ARU Phalaris arundinacea)',
  RS: 'Rush skeletonweed (CHON JUN Chondrilla juncea)',
  RK: 'Russian knapweed (ACRO REP Acroptilon repens)',
  RO: 'Russian olive (ELAE ANG Elaeagnus angustifolia)',
  RT: 'Russian thistle (SALS KAL Salsola kali)',
  TA: 'Saltcedar / tamarisk (TAMA RAM Tamarix ramosissima)',
  AH: 'Saltlover / halogeton (HALO GLO Halogeton glomeratus)',
  SH: 'Scentless chamomile (MATR PER Matricaria perforata)',
  SB: 'Scotch broom (CYTI SCO Cytisus scoparius)',
  ST: 'Scotch thistle (ONOP ACA Onopordum acanthium)',
  SS: 'Sheep sorrel (RUME ACE Rumex acetosella)',
  SP: "Shepherd'spurse (CAPS BUR Capsella bursapastoris)",
  SG: 'Shiny geranium (GERA LUC Geranium lucidum)',
  CN: 'Shortfringed knapweed (CENT NIR Centaurea nigrescens)',
  SE: 'Siberian elm (ULMU PUM Ulmus pumila)',
  NS: 'Silverleaf nightshade (SOLA ELA Solanum elaeagnifolium)',
  FT: 'Slender meadow foxtail (ALOP MYO Alopecurus myosuroides)',
  BF: 'Slender false brome / false brome (BRAC SYL Brachypodium sylvaticum)',
  HG: "Smooth cat's ear (HYPO GLA Hypochaeris glabra)",
  SM: 'Smooth hawkweed (PILO LAE Pilosella / Hieracium laevigatum)',
  BS: 'Spanish bluebells (HYAC HIS Hyacinthoides hispanica)',
  SI: 'Spanish broom (SPAR JUN Spartium junceum)',
  SX: 'Spotted hawkweed (PILO MAC Pilosella / Hieracium maculatum)',
  SK: 'Spotted knapweed (CENT BIE Centaurea biebersteinii)',
  MV: 'Spring millet grass (MILI VER Milium vernale)',
  TP: 'Spurge flax (THYM PAS Thymelaea passerina)',
  CV: 'Squarrose knapweed (CENT VIR Centaurea virgata ssp. squarrosa)',
  SJ: "St. John's wort/Saint John's wort/ Goatweed (HYPE PER Hypericum perforatum)",
  SC: 'Sulphur cinquefoil (POTE REC Potentilla recta)',
  SF: 'Sweet fennel (FOEN VUL Foeniculum vulgare)',
  SY: 'Syrian beancaper (ZYGO FAB Zygophyllum fabago)',
  TH: 'Tall hawkweed (HIER OID Hieracium piloselloides)',
  TR: 'Tansy ragwort (SENE JAC Senecio jacobaea)',
  TB: 'Tartary buckwheat (FAGO TAT Fagopyrum tataricum)',
  TS: 'Teasel (DIPS FUL Dipsacus fullonum)',
  TX: 'Texas blueweed (HELI CIL Helianthus ciliaris)',
  AA: 'Tree of heaven (AILA ALT Ailanthus altissima)',
  VL: 'Velvet leaf (ABUT THE Abutilon theophrasti)',
  WA: 'Wall hawkweed (PILO MUR Pilosella / Hieracium murorum)',
  WG: "Western goat'sbeard (TRAG DUB Tragopogon dubius)",
  WP: 'Whiplash hawkweed (HIER FLA Hieracium flagellare)',
  WC: 'White cockle (LYCH ALB Lychnis alba)',
  SR: 'White spanish broom (CYTI MUL Cytisus multiflorus)',
  WB: 'Wild buckwheat (POLY CON Polygonum convolvulus)',
  WI: 'Wild chervil (ANTH SYL Anthriscus sylvestris)',
  WF: "Wild four o'clock (MIRA NYC Mirabilis nyctaginea)",
  WM: 'Wild mustard (SINA ARV Sinapis arvensis)',
  WO: 'Wild oats (AVEN FAT Avena fatua)',
  PW: 'Wild parsnip (PAST SAT Pastinaca sativa)',
  WT: 'Winged thistle / slenderflowered thistle (CARD TEN Carduus tenuiflorus)',
  WS: 'Wood sage (SALV NEM Salvia nemorsa)',
  WW: 'Wormwood (ARTE ABS Artemisia absinthium)',
  YA: 'Yellow archangel (LAMI GAL Lamiastrum galeobdolon)',
  YD: 'Yellowdevil hawkweed (HIER GLO Hieracium glomeratum)',
  YH: 'Yellow hawkweed (HIER PRA Hieracium pratense)',
  HS: 'Yellow hawkweed species (HIER PILO SPP Hieracium / Pilosella spp.)',
  YN: 'Yellow nutsedge (CYPE ESC Cyperus esculentus)',
  YS: 'Yellow starthistle (CENT SOL Centaurea solstitialis)',
  YT: 'Yellow/common toadflax (LINA VUL Linaria vulgaris)',

  // AQUATIC:
  AB: 'American beachgrass (AMMO BRE Ammophila breviligulata)',
  YC: 'Amphibious yellow cress (RORI AMP Rorippa amphibian)',
  RI: 'Bog bulrush / ricefield bulrush (SCHO MUC Schoenoplectus mucronatus)',
  ED: 'Brazilian waterweed (EGER DEN Egeria densa)',
  CM: 'Cabomba (CABO CAR Cabomba caroliniana)',
  FC: 'Common frogbit (HYDR MOR Hydrocharis morsusrange)',
  UP: 'Curly leaf pondweed (POTA CRI Potamogeton crispus)',
  DC: 'Denseflowered cordgrass (SPAR DEN Spartina densiflora)',
  EC: 'English cordgrass (SPAR ANG Spartina anglica)',
  EW: 'Eurasian watermilfoil (MYRI SPI Myriophyllum spicatum)',
  EB: 'European beachgrass (AMMO ARE Ammophila arenaria)',
  MQ: 'European water clover (MARS QUA Marsilea quadrifolia)',
  WE: 'European waterlily (NYMP ALB Nymphaea alba)',
  FW: 'Fanwort (CABO CAR Cabomba caroliniana)',
  FM: 'Feathered mosquitofern (AZOL PIN Azolla pinnata)',
  FR: 'Flowering rush (BUTO UMB Butomus umbellatus)',
  FL: 'Fragrant water lily (NYMP ODO Nymphaea odorata subsp. odorata)',
  GL: 'Garden yellow loosestrife (LYSI VUL Lysimachia vulgaris)',
  SV: 'Giant salvinia (SALV MOL Salvinia molesta)',
  HY: 'Hydrilla (HYDR VER Hydrilla verticillata)',
  LL: 'Large yellow / spotted loosestrife (LYSI PUN Lysimachia punctata)',
  OW: 'Major oxygen weed (LAGA ROS Lagarosiphon)',
  PF: 'Parrot feather (MYRI AQU Myriophyllum aquaticum)',
  PL: 'Purple loosestrife (LYTH SAL Lythrum salicaria)',
  SN: 'Saltmeadow cordgrass (SPAR PAT Spartina patens)',
  SA: 'Smooth cordgrass (SPAR ALT Spartina alterniflora)',
  LM: 'Variable leaf milfoil (MYRI HET Myriophyllum heterophyllum)',
  WL: 'Wand loosestrife (LYTH VIR Lythrum virgatum)',
  TN: 'Water chestnut (TRAP NAT Trapa natans)',
  NO: 'Watercress (NAST OFF Nasturtium officinale)',
  WH: 'Water hyacinth (EICH CRA Eichhornia crassipes)',
  LW: 'Water lettuce (PIST STR Pistia stratiotes)',
  AQ: 'Water soldier (STRA ALO Stratiotes aloides)',
  YI: 'Yellow flag iris (IRIS PSE Iris pseudachorus)',
  YF: 'Yellow floating heart (NYMP PEL Nymphoides peltata)'
};

// IMPORT LOGIC:

const cli = meow(
  /*
    Usage
      $ IAPP_Migrate [[OPTION] [FILENAME] [OPTION] [FILENAME]...] ENDPOINT

    Options
      --site fileName, -si fileName
      --survey fileName, -su fileName
      --mechanicalTreatment fileName, -mt fileName
      --mechanicalMonitoring fileName, -mm fileName
      --chemicalTreatment fileName, -ct fileName
      --chemicalMonitoring fileName, -cm fileName
      --dispersal fileName, -d fileName
      --bioControlOutput fileName, -b fileName

    Examples
      Load just sites:
      $ IAPP_Migrate --site sites.csv http://point_of_interest_endpoint/
      Load more:
      $ IAPP_Migrate --si sites.csv -su surveys.csv --mt mechtreatments.csv --mm mechmonitoring.csv --ct chemtreatments.csv --cm chemmonitoring.csv http://point_of_interest_endpoint

    Recommend ts-node for Windows users.  Command is then:
    $ ts-node IAPP_Migrator.ts --site sites.csv http://point_of_interest_endpoint/

    REQUIREMENTS:
      CSV files must be sorted according to:
      --site: SiteID DESC
      --survey: SiteID ASC
      --mechanicalTreatment: SiteID ASC
      --mechanicalMonitoring: treatment_id ASC
      --chemicalTreatment: SiteID ASC
      --chemicalMonitoring: treatment_id ASC
      --biologicalTreatment: site_id ASC
      --biologicalMonitoring: treatment_id ASC
      --dispersal: SiteID ASC
      --bioControlOutput: SiteID ASC

    OUTPUT:
      Data will be sorted according to:
      --site: SiteID DESC
      --survey: SurveyID DESC
      --mechanicalTreatment: TreatmentID DESC
      --mechanicalMonitoring: monitoring_id DESC
      --chemicalTreatment: TreatmentID DESC
      --chemicalMonitoring: monitoring_id DESC
      --biologicalTreatment: biological_id DESC
      --biologicalMonitoring: monitoring_id DESC
      --dispersal: biological_dispersal_id DESC
      --bioControlOutput: SiteID DESC
  */
  {
    flags: {
      site: {
        type: 'string',
        alias: 'si',
        isRequired: true
      },
      survey: {
        type: 'string',
        alias: 'su',
        isRequired: false
      },
      mechanicalTreatment: {
        type: 'string',
        alias: 'mt',
        isRequired: false
      },
      mechanicalMonitoring: {
        type: 'string',
        alias: 'mm',
        isRequired: false
      },
      chemicalTreatment: {
        type: 'string',
        alias: 'ct',
        isRequired: false
      },
      chemicalMonitoring: {
        type: 'string',
        alias: 'cm',
        isRequired: false
      },
      biologicalTreatment: {
        type: 'string',
        alias: 'bt',
        isRequired: false
      },
      biologicalMonitoring: {
        type: 'string',
        alias: 'bm',
        isRequired: false
      },
      dispersal: {
        type: 'string',
        alias: 'd',
        isRequired: false
      },
      bioControlOutput: {
        type: 'string',
        alias: 'b',
        isRequired: false
      }
    }
  }
);
/*
{
	input: ['unicorns'],
	flags: {rainbow: true},
	...
}
*/

const getToken = () => {
  const tokenPostData = qs.stringify({
    username: 'postman',
    password: 'postman_password',
    scope: 'openid',
    client_id: 'invasives-bc',
    grant_type: 'password'
  });

  return axios({
    method: 'post',
    url: 'https://dev.oidc.gov.bc.ca/auth/realms/onestopauth-business/protocol/openid-connect/token',
    data: tokenPostData,
    headers: {
      'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
    }
  });
};

const loadACSV = async (fileName: string) => {
  return new Promise<any[]>((resolve, reject) => {
    const results = [];
    fs.createReadStream(fileName)
      .pipe(csv({ trim: true }))
      .on('data', (data) => {
        results.push(JSON.parse(data.toString('utf8')));
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error); // or return null, or throw an error, or w/e makes sense here
      });
  });
};

interface IAPPDataInterface {
  siteData?: any[];
  surveyData?: any[];
  mechanicalTreatmentData?: any[];
  mechanicalMonitoringData?: any[];
  chemicalTreatmentData?: any[];
  chemicalMonitoringData?: any[];
  biologicalTreatmentData?: any[];
  biologicalMonitoringData?: any[];
  dispersalData?: any[];
  bioControlOutputData?: any[];
}

const loadAllData = async () => {
  const results: IAPPDataInterface = {};

  if (!cli.flags.site) {
    return;
  }
  results.siteData = await loadACSV(cli.flags.site);

  if (cli.flags.survey) {
    results.surveyData = await loadACSV(cli.flags.survey);
  }

  if (cli.flags.mechanicalTreatment) {
    results.mechanicalTreatmentData = await loadACSV(cli.flags.mechanicalTreatment);
  }

  if (cli.flags.mechanicalMonitoring) {
    results.mechanicalMonitoringData = await loadACSV(cli.flags.mechanicalMonitoring);
  }

  if (cli.flags.chemicalTreatment) {
    results.chemicalTreatmentData = await loadACSV(cli.flags.chemicalTreatment);
  }

  if (cli.flags.chemicalMonitoring) {
    results.chemicalMonitoringData = await loadACSV(cli.flags.chemicalMonitoring);
  }

  if (cli.flags.biologicalTreatment) {
    results.biologicalTreatmentData = await loadACSV(cli.flags.biologicalTreatment);
  }

  if (cli.flags.biologicalMonitoring) {
    results.biologicalMonitoringData = await loadACSV(cli.flags.biologicalMonitoring);
  }

  if (cli.flags.dispersal) {
    results.dispersalData = await loadACSV(cli.flags.dispersal);
  }

  if (cli.flags.bioControlOutput) {
    results.bioControlOutputData = await loadACSV(cli.flags.bioControlOutput);
  }

  return results;
};

//const urlstring = 'http://localhost:7080/api/point-of-interest';
const urlstring = 'https://api-dev-invasivesbci.apps.silver.devops.gov.bc.ca/api/point-of-interest';

const main = async () => {
  const IAPPData = await loadAllData();

  let siteCount = 0;
  const batchSize = 1000;
  let surveyMissedMatchCount = 0;
  const speciesMatches = {
    // OVERRIDES:
    HIER: {
      'Hawkweed species': null, // general species unsupported
      'Yellow devil hawkwee': 'YD',
      'Queen devil hawkweed': 'QH',
      'King devil hawkweed': 'KH'
    },
    CENT: {
      'Knapweed species': null, // general species unsupported
      'Short-fringed knapwe': 'CN'
    },
    ARCT: {
      'Burdock species': 'BU'
    },
    TRAG: {
      "Western goat's-beard": 'WG',
      'Meadow goats-beard': 'MG'
    },
    CYNO: {
      "Hound's-tongue": 'HT'
    },
    SILE: {
      'Night-flowering catc': 'NC'
    },
    HYPO: {
      "Hairy cat's-ear": 'HR'
    },
    POLY: {
      "Lady's-thumb": 'LT'
    },
    VINC: {
      'Bigleaf / Large peri': 'BP'
    },
    SPAR: {
      'Salt-meadow cord gra': 'SN',
      'Dense-flowered cordg': 'DC'
    },
    SONC: {
      'Sowthistle species': null // general species unsupported
    },
    SOLA: {
      Nightshade: null // general species unsupported
    },
    DIDY: {
      Didymo: null // removed, no longer considered invasive
    }
  };
  const speciesMatchFailures = {};

  // assumes site CSV sorted by SiteID DESC
  while (siteCount < IAPPData.siteData.length) {
    let batch = 0;
    const pois: Array<object> = [];

    while (batch < batchSize) {
      const siteRecord = IAPPData.siteData[siteCount];
      if (!IAPPData.siteData[siteCount]) break;
      const siteRecordID = siteRecord['SiteID'];

      // assumes surveys CSV sorted by SiteID ASC
      const surveys = binarySearchValues(IAPPData.surveyData, 'SiteID', siteRecordID);
      // restore desired sorting order by SurveyID DESC (latest first)
      surveys.sort((a, b) => Number(b.SurveyID) - Number(a.SurveyID));

      // assumes mechtreatements CSV sorted by SiteID ASC
      let mechanical_treatments = binarySearchValues(IAPPData.mechanicalTreatmentData, 'SiteID', siteRecordID);
      mechanical_treatments = mechanical_treatments.map((treatment) => {
        // assumes monitoring CSV sorted by treatment_id ASC
        treatment.monitoring = binarySearchValues(
          IAPPData.mechanicalMonitoringData,
          'treatment_id',
          treatment.TreatmentID
        );
        // restore desired sorting order by monitoring_id DESC (latest first)
        treatment.monitoring.sort((a, b) => Number(b.monitoring_id) - Number(a.monitoring_id));
        return treatment;
      });
      // restore desired sorting order by TreatmentID DESC (latest first)
      mechanical_treatments.sort((a, b) => Number(b.TreatmentID) - Number(a.TreatmentID));

      // assumes chemtreatements CSV sorted by SiteID ASC
      let chemical_treatments = binarySearchValues(IAPPData.chemicalTreatmentData, 'SiteID', siteRecordID);
      chemical_treatments = chemical_treatments.map((treatment) => {
        // assumes monitoring CSV sorted by TreatmentID ASC
        treatment.monitoring = binarySearchValues(
          IAPPData.chemicalMonitoringData,
          'treatment_id',
          treatment.TreatmentID
        );
        // restore desired sorting order by monitoring_id DESC (latest first)
        treatment.monitoring.sort((a, b) => Number(b.monitoring_id) - Number(a.monitoring_id));
        return treatment;
      });
      // restore desired sorting order by TreatmentID DESC (latest first)
      chemical_treatments.sort((a, b) => Number(b.TreatmentID) - Number(a.TreatmentID));

      // assumes biotreatments CSV sorted by site_id ASC
      let biological_treatments = binarySearchValues(IAPPData.biologicalTreatmentData, 'site_id', siteRecordID);
      biological_treatments = biological_treatments.map((treatment) => {
        // assumes monitoring CSV sorted by treatment_id ASC
        treatment.monitoring = binarySearchValues(
          IAPPData.biologicalMonitoringData,
          'treatment_id',
          treatment.treatment_id
        );
        // restore desired sorting order by monitoring_id DESC (latest first)
        treatment.monitoring.sort((a, b) => Number(b.monitoring_id) - Number(a.monitoring_id));
        return treatment;
      });
      // restore desired sorting order by biological_id DESC (latest first)
      biological_treatments.sort((a, b) => Number(b.biological_id) - Number(a.biological_id));

      // assumes dispersals CSV sorted by site_id ASC
      const biological_dispersals = binarySearchValues(IAPPData.dispersalData, 'site_id', siteRecordID);
      // restore desired sorting order by biological_dispersal_id ASC
      biological_dispersals.sort((a, b) => Number(a.biological_dispersal_id) - Number(b.biological_dispersal_id));

      siteCount++;

      // Go/No-Go Rules:
      // only import POIs which have Survey data:
      if (!surveys?.length) continue;

      const surveyAgencyCodes = surveys.map((survey) => survey.SurveyAgency).filter((agency) => agency);

      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0'); //January is 0!
      const yyyy = now.getFullYear();
      const today = yyyy + '-' + mm + '-' + dd;

      let speciesOfThisSite = [];

      const requestBody: any = {
        point_of_interest_type: 'IAPP Site',
        point_of_interest_subtype: 'First Load',
        media: [],
        geometry: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [+siteRecord.OFF_Longitude, +siteRecord.OFF_Latitude]
            },
            properties: {}
          }
        ],
        form_data: {
          point_of_interest_data: {
            invasive_species_agency_code: getCommonValue(surveyAgencyCodes, undefined),
            jurisdiction_code: Number(siteRecord.Jur1pct) === 100 ? siteRecord.Jur1 : undefined,
            // point_of_interest_status: 'done',
            general_comment: siteRecord.Comments,
            access_description: siteRecord.AccessDescription,
            media_indicator: false,
            date_created: formatDateToISO(siteRecord.CreateDate),
            created_date_on_device: today,
            updated_date_on_device: today,
            project_code: [
              {
                description: siteRecord.PaperFile
              }
            ]
          },

          point_of_interest_type_data: {
            site_id: siteRecordID,
            original_bec_id: siteRecord.BEC_ID,
            map_sheet: siteRecord.MapSheet,
            soil_texture_code: siteRecord.SoilTexture || 'NA',
            specific_use_code: specificUseMap(siteRecord.SpecificUse) || 'NA', // note: these dont map to our code table correctly - something is wrong
            slope_code: mapSlope(siteRecord.Slope),
            slope: siteRecord.Slope,
            aspect_code: mapAspect(siteRecord.Aspect),
            aspect: siteRecord.Aspect,
            site_elevation: siteRecord.Elevation
          },

          surveys: surveys.map((survey) => {
            // MAP IAPP SPECIES TO NEW CODES
            const matchedSpecies = {};
            let bestMatch;

            if (speciesMatches[survey.Species]?.[survey.CommonName] !== undefined)
              bestMatch = speciesMatches[survey.Species][survey.CommonName];
            else if (!speciesMatchFailures[survey.Species]?.[survey.CommonName] && survey.CommonName) {
              Object.keys(invasiveSpeciesCodes).forEach((code) => {
                const fullname = invasiveSpeciesCodes[code].split(' (')?.[0].split('/')?.[0].trim();
                if (
                  survey.CommonName &&
                  survey.CommonName.includes(fullname) &&
                  fullname.includes(survey.CommonName) &&
                  invasiveSpeciesCodes[code].includes(survey.Species)
                )
                  matchedSpecies[code] = 'perfect';
                else if (
                  survey.CommonName &&
                  invasiveSpeciesCodes[code].includes(survey.Species) &&
                  (survey.CommonName.includes(fullname) || fullname.includes(survey.CommonName))
                )
                  matchedSpecies[code] = 'excellent';
                else if (
                  survey.CommonName &&
                  (survey.CommonName.includes(invasiveSpeciesCodes[code].split(' (')[0]) ||
                    invasiveSpeciesCodes[code].split(' (')[0].includes(survey.CommonName))
                )
                  matchedSpecies[code] = 'great';
                else if (
                  invasiveSpeciesCodes[code].includes(survey.Species) &&
                  survey.CommonName &&
                  invasiveSpeciesCodes[code].includes(survey.CommonName)
                )
                  matchedSpecies[code] = 'good';
                else if (invasiveSpeciesCodes[code].includes(survey.Species)) matchedSpecies[code] = 'fair';
                else if (survey.CommonName && invasiveSpeciesCodes[code].includes(survey.CommonName))
                  matchedSpecies[code] = 'poor';
              });

              switch (Object.keys(matchedSpecies).length) {
                case 0:
                  break;
                case 1:
                  bestMatch = Object.keys(matchedSpecies)[0];
                  break;
                default: {
                  const perfectMatches = Object.keys(matchedSpecies).filter(
                    (match) => matchedSpecies[match] === 'perfect'
                  );
                  if (perfectMatches.length === 1) {
                    bestMatch = perfectMatches[0];
                    break;
                  }

                  const excellentMatches = Object.keys(matchedSpecies).filter(
                    (match) => matchedSpecies[match] === 'excellent'
                  );
                  if (excellentMatches.length === 1) {
                    bestMatch = excellentMatches[0];
                    break;
                  }

                  const greatMatches = Object.keys(matchedSpecies).filter((match) => matchedSpecies[match] === 'great');
                  if (greatMatches.length === 1) {
                    bestMatch = greatMatches[0];
                    break;
                  }

                  const goodMatches = Object.keys(matchedSpecies).filter((match) => matchedSpecies[match] === 'good');
                  if (goodMatches.length === 1) {
                    bestMatch = goodMatches[0];
                    break;
                  }

                  const fairMatches = Object.keys(matchedSpecies).filter((match) => matchedSpecies[match] === 'fair');
                  if (fairMatches.length === 1) {
                    bestMatch = fairMatches[0];
                    break;
                  }

                  const poorMatches = Object.keys(matchedSpecies).filter((match) => matchedSpecies[match] === 'poor');
                  if (poorMatches.length === 1) {
                    bestMatch = poorMatches[0];
                    break;
                  }
                }
              }
            }
            if (bestMatch === undefined) {
              surveyMissedMatchCount += 1;
              if (!speciesMatchFailures[survey.Species]) speciesMatchFailures[survey.Species] = {};
              if (!speciesMatchFailures[survey.Species]?.[survey.CommonName]) {
                speciesMatchFailures[survey.Species][survey.CommonName] = 1;
                console.warn(
                  'No match: ',
                  speciesMatchFailures,
                  speciesMatches,
                  matchedSpecies,
                  surveyMissedMatchCount,
                  survey.Species,
                  survey.CommonName
                );
              } else speciesMatchFailures[survey.Species][survey.CommonName] += 1;
            } else {
              if (bestMatch !== null) {
                speciesOfThisSite.push(bestMatch);
                speciesOfThisSite = Array.from(new Set(speciesOfThisSite));
              }
              if (!speciesMatches[survey.Species]) speciesMatches[survey.Species] = {};
              speciesMatches[survey.Species][survey.CommonName] = bestMatch;
            }

            return {
              survey_id: survey.SurveyID,
              survey_date: formatDateToISO(survey.SurveyDate),
              reported_area: hectaresToM2(survey.EstArea), // hectares to m2
              map_code: survey.MapCode,
              invasive_species_agency_code: survey.SurveyAgency,
              // invasive_plant_code: 'NA', // TODO map common/species/genus to plant code
              invasive_plant_code: bestMatch === null ? undefined : bestMatch,
              common_name: survey.CommonName, // redundant? ^
              species: survey.Species, // redundant ^
              genus: survey.Genus, // redundant? ^
              invasive_plant_density_code: densityMap[survey.Density],
              density: survey.Density, // redundant ^
              invasive_plant_distribution_code: distributionMap[survey.Distribution],
              distribution: survey.Distribution, // redundant ^
              // proposed_treatment_code
              observation_type_code: observationTypes[survey.SurveyType],
              observation_type: survey.SurveyType, // redundant ^
              general_comment: survey.Comment,
              project_code: [
                {
                  description: survey.PaperFileID
                }
              ],
              weeds_found: survey.WeedsFound,
              employer_code: survey.EmployerCode ? survey.EmployerCode : undefined,
              jurisdictions: [
                {
                  jurisdiction_code: survey.Jur1,
                  percent_covered: survey.Jur1pct
                },
                {
                  jurisdiction_code: survey.Jur2,
                  percent_covered: survey.Jur2pct
                },
                {
                  jurisdiction_code: survey.Jur3,
                  percent_covered: survey.Jur3pct
                }
              ].filter((jur) => jur.jurisdiction_code && jur.percent_covered && Number(jur.percent_covered) > 0)
            };
          }),

          mechanical_treatments: mechanical_treatments.map((t) => ({
            // General treatment properties:
            treatment_id: t.TreatmentID,
            treatment_date: formatDateToISO(t.TreatmentDate),
            map_code: t.MapCode,
            reported_area: hectaresToM2(t.AreaTreated),
            // invasive_plant_code: 'NA', // TODO map common_name to plant code
            common_name: t.CommonName,
            invasive_species_agency_code: t.TreatmentAgency,
            employer: t.Employer,
            project_code: [
              {
                description: t.PaperFileID
              }
            ],
            general_comment: t.Comment,

            // Mech-Specific properties:
            mechanical_id: t.MechanicalID,
            mechanical_method_code: mechMethodCodes[t.MechanicalMethod],
            mechanical_method: t.MechanicalMethod,

            monitoring: t.monitoring.map((m) => ({
              monitoring_id: m.monitoring_id,
              monitoring_date: formatDateToISO(m.monitoring_date),
              efficacy_percent: m.efficacy_percent, // percent vs code?
              efficacy_code: mapEfficacyCode(m.efficacy_percent),
              invasive_species_agency_code: m.agency_code,
              project_code: [
                {
                  description: m.paper_file_id
                }
              ],
              general_comment: m.comment
            }))
          })),

          chemical_treatments: chemical_treatments.map((t) => ({
            // General treatment properties:
            treatment_id: t.TreatmentID,
            treatment_date: formatDateToISO(t.TreatmentDate),
            map_code: t.MapCode,
            reported_area: hectaresToM2(t.AreaTreated),
            // invasive_plant_code: 'NA', // TODO map common_name to plant code
            common_name: t.MapCommon,
            invasive_species_agency_code: t.TreatmentAgency,
            employer: t.Employer,
            project_code: [
              {
                description: t.PAPER_FILE_ID
              }
            ],
            general_comment: t.Comment,

            // Chem-Specific properties:
            chemical_method_code: chemMethodCodes[t.ChemicalMethodFull],
            chemical_method: t.ChemicalMethodFull,
            treatment_time: t.TreatmentTime,
            service_licence_number: t.Service_Licence_Number,
            pmp_confirmation_number: t.Pmp_Confirmation_Number,
            pmra_reg_number: t.Pmra_Reg_Number,
            pup_number: t.Pup_Number,
            liquid_herbicide_code: t.Herbicide_Code,
            herbicide_description: t.Description,
            dilution: t.Dilution_Rate,
            mix_delivery_rate: t.Delivery_Rate,
            tank_mix_id: t.Tank_Mix_Id,
            application_rate: t.Application_Rate,
            herbicide_amount: t.Amount_Used,
            temperature: t.Temperature,
            humidity: t.Humidity, // note: not mapped to increments of 10
            wind_speed: t.Wind_Velocity,
            // wind_direction_code
            wind_direction: t.Wind_Direction,
            wind_direction_code: mapAspect[t.Wind_Direction],
            monitoring: t.monitoring.map((m) => ({
              monitoring_id: m.monitoring_id,
              monitoring_date: formatDateToISO(m.inspection_date),
              efficacy_percent: m.EFFICACY_RATING_CODE,
              efficacy_code: mapEfficacyCode(m.EFFICACY_RATING_CODE),
              invasive_species_agency_code: m.invasive_plant_agency_code,
              project_code: [
                {
                  description: m.PAPER_FILE_ID
                }
              ],
              general_comment: m.comments
            }))
          })),

          biological_treatments: biological_treatments.map((t) => ({
            // General treatment properties:
            treatment_id: t.treatment_id,
            treatment_date: formatDateToISO(t.TREATMENT_DATE),
            map_code: t.MapCode,
            // no reported_area provided
            // invasive_plant_code: 'NA', // TODO map common_name to plant code
            common_name: t.CommonName,
            invasive_species_agency_code: t.Agency,
            project_code: [
              {
                description: t.PaperFileID
              }
            ],
            general_comment: t.COMMENTS,

            // Bio-Specific properties:
            classified_area_code: t.AREA_CLASSIFICATION_CODE,
            collection_date: formatDateToISO(t.COLLECTION_DATE),
            biological_agent_code: t.BIOLOGICAL_AGENT_CODE,
            agent_source: t.BIOAGENT_SOURCE,
            release_quantity: t.RELEASE_QUANTITY,
            stage_larva_ind: t.STAGE_LARVA_IND,
            stage_egg_ind: t.STAGE_EGG_IND,
            stage_pupa_ind: t.STAGE_PUPA_IND,
            stage_other_ind: t.STAGE_OTHER_IND,
            biological_agent_stage_code: mapBioAgentStageCode(t),
            // bioagent_maturity_status_code

            utm_zone: t.UTM_ZONE,
            utm_easting: t.UTM_EASTING,
            utm_northing: t.UTM_NORTHING,

            monitoring: t.monitoring.map((m) => ({
              monitoring_id: m.monitoring_id,
              monitoring_date: formatDateToISO(m.inspection_date),
              efficacy_code: undefined, // m.EFFICACY_RATING_CODE Note: all 0
              invasive_species_agency_code: undefined, // none provided
              project_code: [
                {
                  description: m.PAPER_FILE_ID
                }
              ],
              general_comment: m.Comment,

              // Bio-Specific Monitoring Properties
              plant_count: m.PLANT_COUNT,
              agent_count: m.AGENT_COUNT,
              count_duration: m.COUNT_DURATION,
              agent_destroyed_ind: mapYN(m.AGENT_DESTROYED_IND),
              legacy_presence_ind: mapYN(m.LEGACY_PRESENCE_IND),
              foliar_feeding_damage_ind: mapYN(m.FOLIAR_FEEDING_DAMAGE_IND),
              root_feeding_damage_ind: mapYN(m.ROOT_FEEDING_DAMAGE_IND),
              seed_feeding_damage_ind: mapYN(m.SEED_FEEDING_DAMAGE_IND),
              oviposition_marks_ind: mapYN(m.OVIPOSITION_MARKS_IND),
              eggs_present_ind: mapYN(m.EGGS_PRESENT_IND),
              larvae_present_ind: mapYN(m.LARVAE_PRESENT_IND),
              pupae_present_ind: mapYN(m.PUPAE_PRESENT_IND),
              adults_present_ind: mapYN(m.ADULTS_PRESENT_IND),
              tunnels_present_ind: mapYN(m.TUNNELS_PRESENT_IND),

              utm_zone: m.UTM_ZONE,
              utm_easting: m.UTM_EASTING,
              utm_northing: m.UTM_NORTHING
            }))
          })),

          biological_dispersals: biological_dispersals.map((d) => ({
            monitoring_id: d.biological_dispersal_id,
            monitoring_date: formatDateToISO(d.inspection_date),
            // no efficacy_code applicable
            map_code: d.map_symbol,
            common_name: d.common_name,
            invasive_species_agency_code: d.invasive_plant_agency_code,
            project_code: [
              {
                description: d.paper_file_id
              }
            ],
            general_comment: d.comments,

            // Dispersal-Specific Properties
            biological_dispersal_id: d.biological_dispersal_id,
            invasive_plant_code: d.invasive_plant_id,
            biological_agent_code: d.biological_agent_code,
            // invasive_plant_code: 'NA', // TODO map common_name to plant code
            plant_count: d.plant_count,
            agent_count: d.agent_count,
            count_duration: d.count_duration,
            foliar_feeding_damage_ind: mapYN(d.foliar_feeding_damage_ind),
            root_feeding_damage_ind: mapYN(d.root_feeding_damage_ind),
            seed_feeding_damage_ind: mapYN(d.seed_feeding_damage_ind),
            oviposition_marks_ind: mapYN(d.oviposition_marks_ind),
            eggs_present_ind: mapYN(d.eggs_present_ind),
            larvae_present_ind: mapYN(d.larvae_present_ind),
            pupae_present_ind: mapYN(d.pupae_present_ind),
            adults_present_ind: mapYN(d.adults_present_ind),
            tunnels_present_ind: mapYN(d.tunnels_present_ind),

            utm_zone: d.utm_zone,
            utm_easting: d.utm_easting,
            utm_northing: d.utm_northing
          }))
        }
      };
      requestBody.species_positive = speciesOfThisSite.sort();
      requestBody.species_negative = [];

      pois.push(requestBody);
      batch++;
    }

    const tokenResp = await getToken();
    const token = tokenResp.data.access_token;
    const postconfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    try {
      // process.stdout.write(`${siteRecordID},`);
      if (pois?.length) await axios.post(urlstring, pois, postconfig);
    } catch (error) {
      console.error(error);
    }
  }
};

main();

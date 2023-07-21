import React, { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@mui/material";
import { useSelector } from "util/use_selector";
import { selectMap } from "state/reducers/map";
import { useHistory } from "react-router";

import './LegendsPopup.css';

import invbclogo from "/assets/InvasivesBC_Icon.svg";
import { MAP_TOGGLE_LEGENDS } from "state/actions";

export const LegendsPopup = (props) => {

  const dispatch = useDispatch();
  const history = useHistory();
  const mapState = useSelector(selectMap);

  const escFunction = useCallback((event) => {
    if (event.key === "Escape" && document.getElementById('legendspopup')) {
      goBack();
    }
  }, []);

  const goBack = () => {
    history.goBack();
    dispatch({type: MAP_TOGGLE_LEGENDS });
  }

  useEffect(() => {
    document.addEventListener("keyup", escFunction, false);
    return () => {
      document.removeEventListener("keyup", escFunction, false);
    };
  }, []);

  return (
    <>
      {mapState?.legendsPopup ? (
        <div
          id="legendspopup"
          style={{
            position: 'fixed',
            padding: 20,
            borderRadius: 20,
            top: 0,
            left: 0,
            backgroundColor: 'white',
            width: '100%',
            height: '100%',
            overflow: 'auto',
            zIndex: 1000000
          }}>
          <Button onClick={goBack}>Go Back</Button>
          <div className="py-3">
            <div className="container" style={{ textAlign: 'center' }}>
            <img
                src={invbclogo}
                style={{
                  marginRight: '5px',
                  objectFit: 'contain',
                  backgroundColor: 'white',
                  padding: 4,
                  borderRadius: 4
                }}
                height="100"
                width="100"
                alt="B.C. Government Logo"
              />
              <h1>InvasivesBC Map Legend</h1>
            </div>
          </div>
          <div className="container py-4">
            <div className="row">
              <div className="col-md-12">
                <h2>1. InvasivesBC Activity Map Colours</h2>
                <p>There are four categories of activities in InvasivesBC: Observations, Treatments, Biocontrol, and
                  Treatment Monitoring. Each category has a unique colour associated with their respective polygons.</p>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Observation records are Green:</th>
                      <th>Biocontrol records are Purple:</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><img src='/assets/activitycolors/green.jpg' alt='Green records'/></td>
                      <td><img src='/assets/activitycolors/purple.jpg' alt='Purple records'/></td>
                    </tr>
                  </tbody>
                </table>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Treatments records are Yellow:</th>
                      <th>Monitoring records are Blue:</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                    <td><img src='/assets/activitycolors/yellow.jpg' alt='Yellow records'/></td>
                    <td><img src='/assets/activitycolors/blue.jpg' alt='Blue records'/></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="container py-4">
            <div className="row">
              <div className="col-md-12">
                <h2>2. Two letter invasive plant species map codes</h2>
                <p>The following is a list of all possible map label species codes indicating the species are associated with
                  the record. Each record may have one or more invasive plant codes.</p>
                <table className="table table-striped table-blue-header">
                  <thead>
                    <tr>
                      <th style={{textAlign: 'left'}}>Map Label</th>
                      <th style={{textAlign: 'left'}}>Common name</th>
                      <th style={{textAlign: 'left'}}>Scientific name</th>
                      <th style={{textAlign: 'left'}}>Genus</th>
                      <th style={{textAlign: 'left'}}>Species</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>AB</td>
                      <td>American beachgrass</td>
                      <td>Ammophila breviligulata</td>
                      <td>AMMO</td>
                      <td>BRE</td>
                    </tr>
                    <tr>
                      <td>BN</td>
                      <td>American black nightshade</td>
                      <td>Solanum americanum</td>
                      <td>SOLA</td>
                      <td>AME</td>
                    </tr>
                    <tr>
                      <td>YC</td>
                      <td>Amphibious yellow cress</td>
                      <td>Rorippa amphibian</td>
                      <td>RORI</td>
                      <td>AMP</td>
                    </tr>
                    <tr>
                      <td>HB</td>
                      <td>Annual hawksbeard</td>
                      <td>Crepis tectorum</td>
                      <td>CREP</td>
                      <td>TEC</td>
                    </tr>
                    <tr>
                      <td>AS</td>
                      <td>Annual sow thistle</td>
                      <td>Sonchus oleraceus</td>
                      <td>SONC</td>
                      <td>OLE</td>
                    </tr>
                    <tr>
                      <td>BY</td>
                      <td>Baby's breath</td>
                      <td>Gypsophila paniculata</td>
                      <td>GYPS</td>
                      <td>PAN</td>
                    </tr>
                    <tr>
                      <td>BB</td>
                      <td>Bachelor's-button / Cornflower</td>
                      <td>Centaurea cyanus</td>
                      <td>CENT</td>
                      <td>CYA</td>
                    </tr>
                    <tr>
                      <td>BA</td>
                      <td>Barnyard grass</td>
                      <td>Echinochloa crusgalli</td>
                      <td>ECHI</td>
                      <td>CRU</td>
                    </tr>
                    <tr>
                      <td>KB</td>
                      <td>Bighead / Giant knapweed</td>
                      <td>Centaurea macrocephala</td>
                      <td>CENT</td>
                      <td>MAC</td>
                    </tr>
                    <tr>
                      <td>BP</td>
                      <td>Bigleaf / large periwinkle</td>
                      <td>Vinca major</td>
                      <td>VINC</td>
                      <td>MAJ</td>
                    </tr>
                    <tr>
                      <td>BH</td>
                      <td>Black henbane</td>
                      <td>Hyoscyamus niger</td>
                      <td>HYOS</td>
                      <td>NIG</td>
                    </tr>
                    <tr>
                      <td>BL</td>
                      <td>Black knapweed</td>
                      <td>Centaurea nigra</td>
                      <td>CENT</td>
                      <td>NIG</td>
                    </tr>
                    <tr>
                      <td>RB</td>
                      <td>Black locust</td>
                      <td>Robinia pseudoacacia</td>
                      <td>ROBI</td>
                      <td>PSE</td>
                    </tr>
                    <tr>
                      <td>BC</td>
                      <td>Bladder campion</td>
                      <td>Silene vulgaris</td>
                      <td>SILE</td>
                      <td>VUL</td>
                    </tr>
                    <tr>
                      <td>BW</td>
                      <td>Blueweed</td>
                      <td>Echium vulgare</td>
                      <td>ECHI</td>
                      <td>VUL</td>
                    </tr>
                    <tr>
                      <td>RI</td>
                      <td>Bog bulrush / ricefield bulrush</td>
                      <td>Schoenoplectus mucronatus</td>
                      <td>SCHO</td>
                      <td>MUC</td>
                    </tr>
                    <tr>
                      <td>BO</td>
                      <td>Bohemian knotweed</td>
                      <td>Reynoutria / Fallopia x bohemica</td>
                      <td>FALL</td>
                      <td>BOH</td>
                    </tr>
                    <tr>
                      <td>ED</td>
                      <td>Brazilian elodea</td>
                      <td>Egeria densa</td>
                      <td>EGER</td>
                      <td>DEN</td>
                    </tr>
                    <tr>
                      <td>RA</td>
                      <td>Bristly locust / rose acacia</td>
                      <td>Robinia hispida</td>
                      <td>ROBI</td>
                      <td>HIS</td>
                    </tr>
                    <tr>
                      <td>PB</td>
                      <td>Broad-leaved peavine</td>
                      <td>Lathyrus latifolius</td>
                      <td>LATH</td>
                      <td>LAT</td>
                    </tr>
                    <tr>
                      <td>BK</td>
                      <td>Brown knapweed</td>
                      <td>Centaurea jacea</td>
                      <td>CENT</td>
                      <td>JAC</td>
                    </tr>
                    <tr>
                      <td>FF</td>
                      <td>Buffalo-bur</td>
                      <td>Solanum rostratum</td>
                      <td>SOLA</td>
                      <td>ROS</td>
                    </tr>
                    <tr>
                      <td>BG</td>
                      <td>Bulbous bluegrass</td>
                      <td>Poa bulbosa</td>
                      <td>POA</td>
                      <td>BUL</td>
                    </tr>
                    <tr>
                      <td>BT</td>
                      <td>Bull thistle</td>
                      <td>Cirsium vulgare</td>
                      <td>CIRS</td>
                      <td>VUL</td>
                    </tr>
                    <tr>
                      <td>UR</td>
                      <td>Bur / Hornseed buttercup</td>
                      <td>Ceratocephala testiculata</td>
                      <td>CERA</td>
                      <td>TES</td>
                    </tr>
                    <tr>
                      <td>CB</td>
                      <td>Bur chervil</td>
                      <td>Anthriscus caucalis</td>
                      <td>ANTH</td>
                      <td>CAU</td>
                    </tr>
                    <tr>
                      <td>BD</td>
                      <td>Butterfly-bush</td>
                      <td>Buddleja davidii</td>
                      <td>BUDD</td>
                      <td>DAV</td>
                    </tr>
                    <tr>
                      <td>AM</td>
                      <td>Camel thorn</td>
                      <td>Alhagi maurorum</td>
                      <td>ALHA</td>
                      <td>MAU</td>
                    </tr>
                    <tr>
                      <td>CT</td>
                      <td>Canada thistle</td>
                      <td>Cirsium arvense</td>
                      <td>CIRS</td>
                      <td>ARV</td>
                    </tr>
                    <tr>
                      <td>CA</td>
                      <td>Caraway</td>
                      <td>Carum carvi</td>
                      <td>CARU</td>
                      <td>CAR</td>
                    </tr>
                    <tr>
                      <td>CG</td>
                      <td>Carpet burweed</td>
                      <td>Soliva sessilis</td>
                      <td>SOLI</td>
                      <td>SES</td>
                    </tr>
                    <tr>
                      <td>DB</td>
                      <td>Cheatgrass / downy brome</td>
                      <td>Bromus tectorum</td>
                      <td>BROM</td>
                      <td>TEC</td>
                    </tr>
                    <tr>
                      <td>LC</td>
                      <td>Cherry-laurel</td>
                      <td>Prunus laurocerasus</td>
                      <td>PRUN</td>
                      <td>LAU</td>
                    </tr>
                    <tr>
                      <td>CY</td>
                      <td>Chicory</td>
                      <td>Cichorium intybus</td>
                      <td>CICH</td>
                      <td>INT</td>
                    </tr>
                    <tr>
                      <td>CH</td>
                      <td>Chilean tarweed</td>
                      <td>Madia sativa</td>
                      <td>MADI</td>
                      <td>SAT</td>
                    </tr>
                    <tr>
                      <td>CE</td>
                      <td>Clary sage</td>
                      <td>Salvia sclarea</td>
                      <td>SALV</td>
                      <td>SCL</td>
                    </tr>
                    <tr>
                      <td>CF</td>
                      <td>Coltsfoot</td>
                      <td>Tussilago farfara</td>
                      <td>TUSS</td>
                      <td>FAR</td>
                    </tr>
                    <tr>
                      <td>AO</td>
                      <td>Common bugloss</td>
                      <td>Anchusa officinalis</td>
                      <td>ANCH</td>
                      <td>OFF</td>
                    </tr>
                    <tr>
                      <td>BU</td>
                      <td>Common burdock</td>
                      <td>Arctium minus</td>
                      <td>ARCT</td>
                      <td>MIN</td>
                    </tr>
                    <tr>
                      <td>CO</td>
                      <td>Common comfrey</td>
                      <td>Symphytum officinale</td>
                      <td>SYMP</td>
                      <td>OFF</td>
                    </tr>
                    <tr>
                      <td>CC</td>
                      <td>Common crupina</td>
                      <td>Crupina vulgaris</td>
                      <td>CRUP</td>
                      <td>VUL</td>
                    </tr>
                    <tr>
                      <td>DN</td>
                      <td>Common dead-nettle</td>
                      <td>Lamium amplexicaule</td>
                      <td>LAMI</td>
                      <td>AMP</td>
                    </tr>
                    <tr>
                      <td>PE</td>
                      <td>Common evening-primrose</td>
                      <td>Oenothera biennis</td>
                      <td>OENO</td>
                      <td>BIE</td>
                    </tr>
                    <tr>
                      <td>FC</td>
                      <td>Common frogbit</td>
                      <td>Hydrocharis morsus-range</td>
                      <td>HYDR</td>
                      <td>MOR</td>
                    </tr>
                    <tr>
                      <td>GS</td>
                      <td>Common groundsel</td>
                      <td>Senecio vulgaris</td>
                      <td>SENE</td>
                      <td>VUL</td>
                    </tr>
                    <tr>
                      <td>CX</td>
                      <td>Common hawkweed</td>
                      <td>Hieracium lachenalii</td>
                      <td>HIER</td>
                      <td>LAC</td>
                    </tr>
                    <tr>
                      <td>ET</td>
                      <td>Common hawthorn</td>
                      <td>Crataegus monogyna</td>
                      <td>CRAT</td>
                      <td>MON</td>
                    </tr>
                    <tr>
                      <td>CP</td>
                      <td>Common periwinkle</td>
                      <td>Vinca minor</td>
                      <td>VINC</td>
                      <td>MIN</td>
                    </tr>
                    <tr>
                      <td>TC</td>
                      <td>Common tansy</td>
                      <td>Tanacetum vulgare</td>
                      <td>TANA</td>
                      <td>VUL</td>
                    </tr>
                    <tr>
                      <td>NO</td>
                      <td>Common watercress</td>
                      <td>Nasturtium officinale</td>
                      <td>NAST</td>
                      <td>OFF</td>
                    </tr>
                    <tr>
                      <td>RR</td>
                      <td>Corn-spurry</td>
                      <td>Spergula arvensis</td>
                      <td>SPER</td>
                      <td>ARV</td>
                    </tr>
                    <tr>
                      <td>CR</td>
                      <td>Creeping buttercup</td>
                      <td>Ranunculus repens</td>
                      <td>RANU</td>
                      <td>REP</td>
                    </tr>
                    <tr>
                      <td>CD</td>
                      <td>Curled dock</td>
                      <td>Rumex crispus</td>
                      <td>RUME</td>
                      <td>CRI</td>
                    </tr>
                    <tr>
                      <td>UP</td>
                      <td>Curly leaf pondweed</td>
                      <td>Potamogeton crispus</td>
                      <td>POTA</td>
                      <td>CRI</td>
                    </tr>
                    <tr>
                      <td>CL</td>
                      <td>Cutleaf evergreen blackberry</td>
                      <td>Rubus laciniatus</td>
                      <td>RUBU</td>
                      <td>LAC</td>
                    </tr>
                    <tr>
                      <td>CS</td>
                      <td>Cypress spurge</td>
                      <td>Euphorbia cyparissias</td>
                      <td>EUPH</td>
                      <td>CYP</td>
                    </tr>
                    <tr>
                      <td>DT</td>
                      <td>Dalmatian toadflax</td>
                      <td>Linaria genistifolia spp. dalmatica</td>
                      <td>LINA</td>
                      <td>DAL</td>
                    </tr>
                    <tr>
                      <td>DR</td>
                      <td>Dames rocket</td>
                      <td>Hesperis matronalis</td>
                      <td>HESP</td>
                      <td>MAT</td>
                    </tr>
                    <tr>
                      <td>SL</td>
                      <td>Daphne / spurge-laurel</td>
                      <td>Daphne laureola</td>
                      <td>DAPH</td>
                      <td>LAU</td>
                    </tr>
                    <tr>
                      <td>FU</td>
                      <td>Death-cap fungus</td>
                      <td>Amanita phalloides</td>
                      <td>AMAN</td>
                      <td>PHA</td>
                    </tr>
                    <tr>
                      <td>DC</td>
                      <td>Dense-flowered cordgrass</td>
                      <td>Spartina densiflora</td>
                      <td>SPAR</td>
                      <td>DEN</td>
                    </tr>
                    <tr>
                      <td>DK</td>
                      <td>Diffuse knapweed</td>
                      <td>Centaurea diffusa</td>
                      <td>CENT</td>
                      <td>DIF</td>
                    </tr>
                    <tr>
                      <td>DO</td>
                      <td>Dodder</td>
                      <td>Cuscuta spp.</td>
                      <td>CUSC</td>
                      <td>SPP</td>
                    </tr>
                    <tr>
                      <td>DE</td>
                      <td>Dwarf / Japanese eel-grass</td>
                      <td>Zostera japonica</td>
                      <td>ZOST</td>
                      <td>JAP</td>
                    </tr>
                    <tr>
                      <td>DW</td>
                      <td>Dyer's woad</td>
                      <td>Isatis tinctoria</td>
                      <td>ISAT</td>
                      <td>TIN</td>
                    </tr>
                    <tr>
                      <td>ES</td>
                      <td>Eggleaf spurge</td>
                      <td>Euphorbia oblongata</td>
                      <td>EUPH</td>
                      <td>OBL</td>
                    </tr>
                    <tr>
                      <td>EC</td>
                      <td>English cordgrass</td>
                      <td>Spartina anglica</td>
                      <td>SPAR</td>
                      <td>ANG</td>
                    </tr>
                    <tr>
                      <td>HO</td>
                      <td>English holly</td>
                      <td>Ilex aquifolium</td>
                      <td>ILEX</td>
                      <td>AQU</td>
                    </tr>
                    <tr>
                      <td>EI</td>
                      <td>English ivy</td>
                      <td>Hedera helix</td>
                      <td>HEDE</td>
                      <td>HEL</td>
                    </tr>
                    <tr>
                      <td>EW</td>
                      <td>Eurasian watermilfoil</td>
                      <td>Myriophyllum spicatum</td>
                      <td>MYRI</td>
                      <td>SPI</td>
                    </tr>
                    <tr>
                      <td>EB</td>
                      <td>European beachgrass</td>
                      <td>Ammophila arenaria</td>
                      <td>AMMO</td>
                      <td>ARE</td>
                    </tr>
                    <tr>
                      <td>EU</td>
                      <td>European bittersweet / climbing nightshade</td>
                      <td>Solanum dulcamara</td>
                      <td>SOLA</td>
                      <td>DUL</td>
                    </tr>
                    <tr>
                      <td>RC</td>
                      <td>European common reed</td>
                      <td>Phragmites australis subsp. australis</td>
                      <td>PHRA</td>
                      <td>AUS</td>
                    </tr>
                    <tr>
                      <td>EH</td>
                      <td>European hawkweed</td>
                      <td>Hieracium sabaudum</td>
                      <td>HIER</td>
                      <td>SAB</td>
                    </tr>
                    <tr>
                      <td>MQ</td>
                      <td>European water clover</td>
                      <td>Marsilea quadrifolia</td>
                      <td>MARS</td>
                      <td>QUA</td>
                    </tr>
                    <tr>
                      <td>WE</td>
                      <td>European waterlily</td>
                      <td>Nymphaea alba</td>
                      <td>NYMP</td>
                      <td>ALB</td>
                    </tr>
                    <tr>
                      <td>EY</td>
                      <td>Eyebright</td>
                      <td>Euphrasia nemorosa</td>
                      <td>EUPH</td>
                      <td>NEM</td>
                    </tr>
                    <tr>
                      <td>FW</td>
                      <td>Fanwort</td>
                      <td>Cabomba caroliniana</td>
                      <td>CABO</td>
                      <td>CAR</td>
                    </tr>
                    <tr>
                      <td>FM</td>
                      <td>Feathered mosquito-fern</td>
                      <td>Azolla pinnata</td>
                      <td>AZOL</td>
                      <td>PIN</td>
                    </tr>
                    <tr>
                      <td>FY</td>
                      <td>Fernleaf yarrow</td>
                      <td>Achillea filipendulina</td>
                      <td>ACHI</td>
                      <td>FIL</td>
                    </tr>
                    <tr>
                      <td>FB</td>
                      <td>Field bindweed</td>
                      <td>Convolvulus arvensis</td>
                      <td>CONV</td>
                      <td>ARV</td>
                    </tr>
                    <tr>
                      <td>FS</td>
                      <td>Field scabious</td>
                      <td>Knautia arvensis</td>
                      <td>KNAU</td>
                      <td>ARV</td>
                    </tr>
                    <tr>
                      <td>FP</td>
                      <td>Flat pea / flat peavine</td>
                      <td>Lathyrus sylvestris</td>
                      <td>LATH</td>
                      <td>SYL</td>
                    </tr>
                    <tr>
                      <td>FR</td>
                      <td>Flowering rush</td>
                      <td>Butomus umbellatus</td>
                      <td>BUTO</td>
                      <td>UMB</td>
                    </tr>
                    <tr>
                      <td>FG</td>
                      <td>Foxglove</td>
                      <td>Digitalis purpurea</td>
                      <td>DIGI</td>
                      <td>PUR</td>
                    </tr>
                    <tr>
                      <td>FL</td>
                      <td>Fragrant waterlily</td>
                      <td>Nymphaea odorata subsp. odorata</td>
                      <td>NYMP</td>
                      <td>ODO</td>
                    </tr>
                    <tr>
                      <td>GM</td>
                      <td>French broom</td>
                      <td>Genista monspessulana</td>
                      <td>GENI</td>
                      <td>MON</td>
                    </tr>
                    <tr>
                      <td>TS</td>
                      <td>Fueller's Teasel</td>
                      <td>Dipsacus fullonum</td>
                      <td>DIPS</td>
                      <td>FUL</td>
                    </tr>
                    <tr>
                      <td>GL</td>
                      <td>Garden yellow loosestrife</td>
                      <td>Lysimachia vulgaris</td>
                      <td>LYSI</td>
                      <td>VUL</td>
                    </tr>
                    <tr>
                      <td>AP</td>
                      <td>Garlic mustard</td>
                      <td>Alliaria petiolata</td>
                      <td>ALLI</td>
                      <td>PET</td>
                    </tr>
                    <tr>
                      <td>MA</td>
                      <td>Giant chickweed</td>
                      <td>Myosoton aquaticum</td>
                      <td>MYOS</td>
                      <td>AQU</td>
                    </tr>
                    <tr>
                      <td>GH</td>
                      <td>Giant hogweed</td>
                      <td>Heracleum mantegazzianum</td>
                      <td>HERA</td>
                      <td>MAN</td>
                    </tr>
                    <tr>
                      <td>GK</td>
                      <td>Giant knotweed</td>
                      <td>Reynoutria / Fallopia sachalinensis</td>
                      <td>FALL</td>
                      <td>SAC</td>
                    </tr>
                    <tr>
                      <td>SW</td>
                      <td>Giant mannagrass</td>
                      <td>Glyceria maxima</td>
                      <td>GLYC</td>
                      <td>MAX</td>
                    </tr>
                    <tr>
                      <td>SW</td>
                      <td>Giant mannagrass / reed sweetgrass</td>
                      <td>Glyceria maxima</td>
                      <td>GLYC</td>
                      <td>MAX</td>
                    </tr>
                    <tr>
                      <td>AD</td>
                      <td>Giant reed / giant cane</td>
                      <td>Arundo donax</td>
                      <td>ARUN</td>
                      <td>DON</td>
                    </tr>
                    <tr>
                      <td>SV</td>
                      <td>Giant salvinia</td>
                      <td>Salvinia molesta</td>
                      <td>SALV</td>
                      <td>MOL</td>
                    </tr>
                    <tr>
                      <td>GP</td>
                      <td>Globe-pod hoarycress</td>
                      <td>Lepidium appelianum</td>
                      <td>LEPI</td>
                      <td>APP</td>
                    </tr>
                    <tr>
                      <td>RG</td>
                      <td>Goat's rue / french lilac</td>
                      <td>Galega officinalis</td>
                      <td>GALE</td>
                      <td>OFF</td>
                    </tr>
                    <tr>
                      <td>GO</td>
                      <td>Gorse</td>
                      <td>Ulex europaeus</td>
                      <td>ULEX</td>
                      <td>EUR</td>
                    </tr>
                    <tr>
                      <td>GW</td>
                      <td>Goutweed / bishop's weed</td>
                      <td>Aegopodium podagraria</td>
                      <td>AEGO</td>
                      <td>POD</td>
                    </tr>
                    <tr>
                      <td>GB</td>
                      <td>Great burdock</td>
                      <td>Arctium lappa</td>
                      <td>ARCT</td>
                      <td>LAP</td>
                    </tr>
                    <tr>
                      <td>LB</td>
                      <td>Great leopard's-bane</td>
                      <td>Doronicum pardalianches</td>
                      <td>DORO</td>
                      <td>PAR</td>
                    </tr>
                    <tr>
                      <td>GC</td>
                      <td>Greater celandine</td>
                      <td>Chelidonium majus</td>
                      <td>CHEL</td>
                      <td>MAJ</td>
                    </tr>
                    <tr>
                      <td>GN</td>
                      <td>Greater knapweed</td>
                      <td>Centaurea scabiosa</td>
                      <td>CENT</td>
                      <td>SCA</td>
                    </tr>
                    <tr>
                      <td>GF</td>
                      <td>Green foxtail / green bristlegrass</td>
                      <td>Setaria viridis</td>
                      <td>SETA</td>
                      <td>VIR</td>
                    </tr>
                    <tr>
                      <td>HR</td>
                      <td>Hairy cat's-ear</td>
                      <td>Hypochaeris radicata</td>
                      <td>HYPO</td>
                      <td>RAD</td>
                    </tr>
                    <tr>
                      <td>AH</td>
                      <td>Halogeton / saltlover</td>
                      <td>Halogeton glomeratus</td>
                      <td>HALO</td>
                      <td>GLO</td>
                    </tr>
                    <tr>
                      <td>HC</td>
                      <td>Heart-podded hoarycress</td>
                      <td>Lepidium / Cardaria draba</td>
                      <td>CARD</td>
                      <td>DRA</td>
                    </tr>
                    <tr>
                      <td>BI</td>
                      <td>Hedge bindweed</td>
                      <td>Calystegia sepium</td>
                      <td>CALY</td>
                      <td>SEP</td>
                    </tr>
                    <tr>
                      <td>HD</td>
                      <td>Hedgehog dogtail</td>
                      <td>Cynosurus echinatus</td>
                      <td>CYNO</td>
                      <td>ECH</td>
                    </tr>
                    <tr>
                      <td>GR</td>
                      <td>Herb-Robert</td>
                      <td>Geranium robertianum</td>
                      <td>GERA</td>
                      <td>ROB</td>
                    </tr>
                    <tr>
                      <td>HI</td>
                      <td>Himalayan blackberry</td>
                      <td>Rubus armeniacus</td>
                      <td>RUBU</td>
                      <td>ARM</td>
                    </tr>
                    <tr>
                      <td>PO</td>
                      <td>Himalayan knotweed</td>
                      <td>Persicaria wallichii / Polygonum polystachyum</td>
                      <td>POLY</td>
                      <td>POL</td>
                    </tr>
                    <tr>
                      <td>HA</td>
                      <td>Hoary alyssum</td>
                      <td>Berteroa incana</td>
                      <td>BERT</td>
                      <td>INC</td>
                    </tr>
                    <tr>
                      <td>HT</td>
                      <td>Hound's-tongue</td>
                      <td>Cynoglossum officinale</td>
                      <td>CYNO</td>
                      <td>OFF</td>
                    </tr>
                    <tr>
                      <td>HY</td>
                      <td>Hydrilla</td>
                      <td>Hydrilla verticillata</td>
                      <td>HYDR</td>
                      <td>VER</td>
                    </tr>
                    <tr>
                      <td>IS</td>
                      <td>Iberian starthistle</td>
                      <td>Centaurea iberica</td>
                      <td>CENT</td>
                      <td>IBE</td>
                    </tr>
                    <tr>
                      <td>IA</td>
                      <td>Italian arum</td>
                      <td>Arum italicum</td>
                      <td>ARUM</td>
                      <td>ITA</td>
                    </tr>
                    <tr>
                      <td>IT</td>
                      <td>Italian plumeless thistle</td>
                      <td>Carduus pycnocephalus</td>
                      <td>CARD</td>
                      <td>PYC</td>
                    </tr>
                    <tr>
                      <td>JP</td>
                      <td>Japanese butterbur</td>
                      <td>Petasites japonicus</td>
                      <td>PETA</td>
                      <td>JAP</td>
                    </tr>
                    <tr>
                      <td>JK</td>
                      <td>Japanese knotweed</td>
                      <td>Reynoutria / Fallopia japonica</td>
                      <td>FALL</td>
                      <td>JAP</td>
                    </tr>
                    <tr>
                      <td>JE</td>
                      <td>Jewelweed / Spotted touch-me-not</td>
                      <td>Impatiens capensis</td>
                      <td>IMPA</td>
                      <td>CAP</td>
                    </tr>
                    <tr>
                      <td>JI</td>
                      <td>Jimsonweed</td>
                      <td>Datura stramonium</td>
                      <td>DATU</td>
                      <td>STR</td>
                    </tr>
                    <tr>
                      <td>GJ</td>
                      <td>Johnsongrass</td>
                      <td>Sorghum halepense</td>
                      <td>SORG</td>
                      <td>HAL</td>
                    </tr>
                    <tr>
                      <td>JG</td>
                      <td>Jointed goatgrass</td>
                      <td>Aegilops cylindrica</td>
                      <td>AEGI</td>
                      <td>CYL</td>
                    </tr>
                    <tr>
                      <td>KH</td>
                      <td>Kingdevil hawkweed</td>
                      <td>Pilosella floribunda / Hieracium floribundum</td>
                      <td>HIER</td>
                      <td>FLO</td>
                    </tr>
                    <tr>
                      <td>KO</td>
                      <td>Kochia / Summer Cypress</td>
                      <td>Bassia / Kochia scoparia</td>
                      <td>KOCH</td>
                      <td>SCO</td>
                    </tr>
                    <tr>
                      <td>KU</td>
                      <td>Kudzu</td>
                      <td>Pueraria montana</td>
                      <td>PUER</td>
                      <td>MON</td>
                    </tr>
                    <tr>
                      <td>LT</td>
                      <td>Lady's-thumb</td>
                      <td>Persicaria maculosa / Polygonum persicaria</td>
                      <td>POLY</td>
                      <td>PER</td>
                    </tr>
                    <tr>
                      <td>LL</td>
                      <td>Large yellow / spotted loosestrife</td>
                      <td>Lysimachia punctata</td>
                      <td>LYSI</td>
                      <td>PUN</td>
                    </tr>
                    <tr>
                      <td>LS</td>
                      <td>Leafy spurge</td>
                      <td>Euphorbia esula</td>
                      <td>EUPH</td>
                      <td>ESU</td>
                    </tr>
                    <tr>
                      <td>LH</td>
                      <td>Lens-pod / Chalapa hoarycress</td>
                      <td>Lepidium chalepense</td>
                      <td>LEPI</td>
                      <td>CHA</td>
                    </tr>
                    <tr>
                      <td>RF</td>
                      <td>Lesser celandine / fig buttercup</td>
                      <td>Ficaria verna / Ranunculus ficaria</td>
                      <td>RANU</td>
                      <td>FIC</td>
                    </tr>
                    <tr>
                      <td>LO</td>
                      <td>Longspine sandbur</td>
                      <td>Cenchrus longispinus</td>
                      <td>CENC</td>
                      <td>LON</td>
                    </tr>
                    <tr>
                      <td>OW</td>
                      <td>Major oxygen weed</td>
                      <td>Lagarosiphon</td>
                      <td>LAGA</td>
                      <td>LAG</td>
                    </tr>
                    <tr>
                      <td>MX</td>
                      <td>Maltese star-thistle</td>
                      <td>Centaurea melitensis</td>
                      <td>CENT</td>
                      <td>MEL</td>
                    </tr>
                    <tr>
                      <td>CU</td>
                      <td>Marsh cudweed</td>
                      <td>Gnaphalium uliginosum</td>
                      <td>GNAP</td>
                      <td>ULI</td>
                    </tr>
                    <tr>
                      <td>MT</td>
                      <td>Marsh plume thistle / Marsh thistle</td>
                      <td>Cirsium palustre</td>
                      <td>CIRS</td>
                      <td>PAL</td>
                    </tr>
                    <tr>
                      <td>MB</td>
                      <td>Meadow buttercup</td>
                      <td>Ranunculus acris</td>
                      <td>RANU</td>
                      <td>ACR</td>
                    </tr>
                    <tr>
                      <td>MC</td>
                      <td>Meadow clary</td>
                      <td>Salvia pratensis</td>
                      <td>SALV</td>
                      <td>PRA</td>
                    </tr>
                    <tr>
                      <td>MH</td>
                      <td>Meadow hawkweed</td>
                      <td>Pilosella caespitosa / Hieracium caespitosum</td>
                      <td>HIER</td>
                      <td>CAE</td>
                    </tr>
                    <tr>
                      <td>MK</td>
                      <td>Meadow knapweed</td>
                      <td>Centaurea x moncktonii / debeauxii</td>
                      <td>DEBE</td>
                      <td>DEB</td>
                    </tr>
                    <tr>
                      <td>MG</td>
                      <td>Meadow salsify / goats-beard</td>
                      <td>Tragopogon pratensis</td>
                      <td>TRAG</td>
                      <td>PRA</td>
                    </tr>
                    <tr>
                      <td>MS</td>
                      <td>Mediterranean sage</td>
                      <td>Salvia aethiopsis</td>
                      <td>SALV</td>
                      <td>AET</td>
                    </tr>
                    <tr>
                      <td>TM</td>
                      <td>Medusahead</td>
                      <td>Taeniatherum caput-medusae</td>
                      <td>TAEN</td>
                      <td>CAP</td>
                    </tr>
                    <tr>
                      <td>MI</td>
                      <td>Milk thistle</td>
                      <td>Silybum marianum</td>
                      <td>SILY</td>
                      <td>MAR</td>
                    </tr>
                    <tr>
                      <td>MO</td>
                      <td>Mountain bluet</td>
                      <td>Centaurea montana</td>
                      <td>CENT</td>
                      <td>MON</td>
                    </tr>
                    <tr>
                      <td>ME</td>
                      <td>Mouse ear hawkweed</td>
                      <td>Pilosella officinarum / Hieracium pilosella</td>
                      <td>HIER</td>
                      <td>PIL</td>
                    </tr>
                    <tr>
                      <td>MU</td>
                      <td>Mullein</td>
                      <td>Verbascum thapsus</td>
                      <td>VERB</td>
                      <td>THA</td>
                    </tr>
                    <tr>
                      <td>EM</td>
                      <td>Myrtle spurge</td>
                      <td>Euphorbia myrsinites</td>
                      <td>EUPH</td>
                      <td>MYR</td>
                    </tr>
                    <tr>
                      <td>NC</td>
                      <td>Night-flowering catchfly</td>
                      <td>Silene noctiflora</td>
                      <td>SILE</td>
                      <td>NOC</td>
                    </tr>
                    <tr>
                      <td>NT</td>
                      <td>Nodding / musk thistle</td>
                      <td>Carduus nutans</td>
                      <td>CARD</td>
                      <td>NUT</td>
                    </tr>
                    <tr>
                      <td>NA</td>
                      <td>North africa grass</td>
                      <td>Ventenata dubia</td>
                      <td>VENT</td>
                      <td>DUB</td>
                    </tr>
                    <tr>
                      <td>OM</td>
                      <td>Old man's beard / traveler's joy</td>
                      <td>Clematis vitalba</td>
                      <td>CLEM</td>
                      <td>VIT</td>
                    </tr>
                    <tr>
                      <td>OH</td>
                      <td>Orange hawkweed</td>
                      <td>Pilosella aurantiaca / Hieracium aurantiacum</td>
                      <td>HIER</td>
                      <td>AUR</td>
                    </tr>
                    <tr>
                      <td>OD</td>
                      <td>Oxeye daisy</td>
                      <td>Leucanthemum vulgare</td>
                      <td>LEUC</td>
                      <td>VUL</td>
                    </tr>
                    <tr>
                      <td>PF</td>
                      <td>Parrot's feather / Brazilian watermilfoil</td>
                      <td>Myriophyllum aquaticum</td>
                      <td>MYRI</td>
                      <td>AQU</td>
                    </tr>
                    <tr>
                      <td>EP</td>
                      <td>Paterson's Curse</td>
                      <td>Echium plantagineum</td>
                      <td>ECHI</td>
                      <td>PLA</td>
                    </tr>
                    <tr>
                      <td>PP</td>
                      <td>Perennial pepperweed</td>
                      <td>Lepidium latifolium</td>
                      <td>LEPI</td>
                      <td>LAT</td>
                    </tr>
                    <tr>
                      <td>PS</td>
                      <td>Perennial sow-thistle</td>
                      <td>Sonchus arvensis</td>
                      <td>SONC</td>
                      <td>ARV</td>
                    </tr>
                    <tr>
                      <td>PT</td>
                      <td>Plumeless thistle</td>
                      <td>Carduus acanthoides</td>
                      <td>CARD</td>
                      <td>ACA</td>
                    </tr>
                    <tr>
                      <td>PH</td>
                      <td>Poison hemlock</td>
                      <td>Conium maculatum</td>
                      <td>CONI</td>
                      <td>MAC</td>
                    </tr>
                    <tr>
                      <td>PA</td>
                      <td>Polar hawkweed</td>
                      <td>Hieracium atratum</td>
                      <td>HIER</td>
                      <td>ATR</td>
                    </tr>
                    <tr>
                      <td>IM</td>
                      <td>Policeman's helmet / himalayan balsam</td>
                      <td>Impatiens glandulifera</td>
                      <td>IMPA</td>
                      <td>GLA</td>
                    </tr>
                    <tr>
                      <td>LP</td>
                      <td>Portugese laurel</td>
                      <td>Prunus lusitanica</td>
                      <td>PRUN</td>
                      <td>LUS</td>
                    </tr>
                    <tr>
                      <td>PR</td>
                      <td>Portuguese broom</td>
                      <td>Cytisus striatus</td>
                      <td>CYTI</td>
                      <td>STR</td>
                    </tr>
                    <tr>
                      <td>PC</td>
                      <td>Prickly / rough comfrey</td>
                      <td>Symphytum asperum</td>
                      <td>SYMP</td>
                      <td>ASP</td>
                    </tr>
                    <tr>
                      <td>TO</td>
                      <td>Princess tree / Royal Paulownia</td>
                      <td>Paulownia tomentosa</td>
                      <td>PAUL</td>
                      <td>TOM</td>
                    </tr>
                    <tr>
                      <td>PV</td>
                      <td>Puncture vine</td>
                      <td>Tribulus terrestris</td>
                      <td>TRIB</td>
                      <td>TER</td>
                    </tr>
                    <tr>
                      <td>PU</td>
                      <td>Purple / red starthistle</td>
                      <td>Centaurea calcitrapa</td>
                      <td>CENT</td>
                      <td>CAL</td>
                    </tr>
                    <tr>
                      <td>PD</td>
                      <td>Purple dead-nettle</td>
                      <td>Lamium purpureum</td>
                      <td>LAMI</td>
                      <td>PUR</td>
                    </tr>
                    <tr>
                      <td>PL</td>
                      <td>Purple loosestrife</td>
                      <td>Lythrum salicaria</td>
                      <td>LYTH</td>
                      <td>SAL</td>
                    </tr>
                    <tr>
                      <td>PN</td>
                      <td>Purple nutsedge</td>
                      <td>Cyperus rotundus</td>
                      <td>CYPE</td>
                      <td>ROT</td>
                    </tr>
                    <tr>
                      <td>QA</td>
                      <td>Queen Anne's lace / wild carrot</td>
                      <td>Daucus carota</td>
                      <td>DAUC</td>
                      <td>CAR</td>
                    </tr>
                    <tr>
                      <td>QH</td>
                      <td>Queendevil hawkweed</td>
                      <td>Pilosella praealta / Hieracium praealtum</td>
                      <td>HIER</td>
                      <td>PRA</td>
                    </tr>
                    <tr>
                      <td>BR</td>
                      <td>Red bartsia</td>
                      <td>Odontites serotina</td>
                      <td>ODON</td>
                      <td>SER</td>
                    </tr>
                    <tr>
                      <td>RP</td>
                      <td>Redroot amaranth / rough pigweed</td>
                      <td>Amaranthus retroflexus</td>
                      <td>AMAR</td>
                      <td>RET</td>
                    </tr>
                    <tr>
                      <td>RE</td>
                      <td>Reed canary grass</td>
                      <td>Phalaris arundinacea</td>
                      <td>PHAL</td>
                      <td>ARU</td>
                    </tr>
                    <tr>
                      <td>RE</td>
                      <td>Reed canarygrass</td>
                      <td>Phalaris arundinacea</td>
                      <td>PHAL</td>
                      <td>ARU</td>
                    </tr>
                    <tr>
                      <td>RS</td>
                      <td>Rush skeletonweed</td>
                      <td>Chondrilla juncea</td>
                      <td>CHON</td>
                      <td>JUN</td>
                    </tr>
                    <tr>
                      <td>RK</td>
                      <td>Russian knapweed</td>
                      <td>Rhaponticum / Acroptilon repens</td>
                      <td>ACRO</td>
                      <td>REP</td>
                    </tr>
                    <tr>
                      <td>RO</td>
                      <td>Russian olive</td>
                      <td>Elaeagnus angustifolia</td>
                      <td>ELAE</td>
                      <td>ANG</td>
                    </tr>
                    <tr>
                      <td>RT</td>
                      <td>Russian thistle</td>
                      <td>Salsola tragus / kali</td>
                      <td>KALI</td>
                      <td>KAL</td>
                    </tr>
                    <tr>
                      <td>TA</td>
                      <td>Saltcedar / tamarisk</td>
                      <td>Tamarix ramosissima</td>
                      <td>TAMA</td>
                      <td>RAM</td>
                    </tr>
                    <tr>
                      <td>SN</td>
                      <td>Salt-meadow cordgrass</td>
                      <td>Spartina patens</td>
                      <td>SPAR</td>
                      <td>PAT</td>
                    </tr>
                    <tr>
                      <td>SH</td>
                      <td>Scentless chamomile</td>
                      <td>Tripleurospermum inodorum / Matricaria perforata</td>
                      <td>MATR</td>
                      <td>PER</td>
                    </tr>
                    <tr>
                      <td>SB</td>
                      <td>Scotch broom</td>
                      <td>Cytisus scoparius</td>
                      <td>CYTI</td>
                      <td>SCO</td>
                    </tr>
                    <tr>
                      <td>ST</td>
                      <td>Scotch thistle</td>
                      <td>Onopordum acanthium</td>
                      <td>ONOP</td>
                      <td>ACA</td>
                    </tr>
                    <tr>
                      <td>SS</td>
                      <td>Sheep sorrel</td>
                      <td>Rumex acetosella</td>
                      <td>RUME</td>
                      <td>ACE</td>
                    </tr>
                    <tr>
                      <td>SP</td>
                      <td>Shepherd's purse</td>
                      <td>Capsella bursa-pastoris</td>
                      <td>CAPS</td>
                      <td>BUR</td>
                    </tr>
                    <tr>
                      <td>SG</td>
                      <td>Shiny geranium</td>
                      <td>Geranium lucidum</td>
                      <td>GERA</td>
                      <td>LUC</td>
                    </tr>
                    <tr>
                      <td>CN</td>
                      <td>Short-fringed knapweed</td>
                      <td>Centaurea nigrescens</td>
                      <td>CENT</td>
                      <td>NIG</td>
                    </tr>
                    <tr>
                      <td>SE</td>
                      <td>Siberian elm</td>
                      <td>Ulmus pumila</td>
                      <td>ULMU</td>
                      <td>PUM</td>
                    </tr>
                    <tr>
                      <td>NS</td>
                      <td>Silverleaf nightshade</td>
                      <td>Solanum elaeagnifolium</td>
                      <td>SOLA</td>
                      <td>ELA</td>
                    </tr>
                    <tr>
                      <td>BF</td>
                      <td>Slender false brome / false brome</td>
                      <td>Brachypodium sylvaticum</td>
                      <td>BRAC</td>
                      <td>SYL</td>
                    </tr>
                    <tr>
                      <td>FT</td>
                      <td>Slender meadow foxtail</td>
                      <td>Alopecurus myosuroides</td>
                      <td>ALOP</td>
                      <td>MYO</td>
                    </tr>
                    <tr>
                      <td>WT</td>
                      <td>Slenderflower thistle / winged thistle</td>
                      <td>Carduus tenuiflorus</td>
                      <td>CARD</td>
                      <td>TEN</td>
                    </tr>
                    <tr>
                      <td>MN</td>
                      <td>Smallflower / small touch-me-not</td>
                      <td>Impatiens parviflora</td>
                      <td>IMPA</td>
                      <td>PAR</td>
                    </tr>
                    <tr>
                      <td>HG</td>
                      <td>Smooth cat's-ear</td>
                      <td>Hypochaeris glabra</td>
                      <td>HYPO</td>
                      <td>GLA</td>
                    </tr>
                    <tr>
                      <td>SA</td>
                      <td>Smooth cordgrass</td>
                      <td>Spartina alterniflora</td>
                      <td>SPAR</td>
                      <td>ALT</td>
                    </tr>
                    <tr>
                      <td>SM</td>
                      <td>Smooth hawkweed</td>
                      <td>Hieracium laevigatum</td>
                      <td>HIER</td>
                      <td>LAE</td>
                    </tr>
                    <tr>
                      <td>BS</td>
                      <td>Spanish bluebells</td>
                      <td>Hyacinthoides hispanica</td>
                      <td>HYAC</td>
                      <td>HIS</td>
                    </tr>
                    <tr>
                      <td>SI</td>
                      <td>Spanish broom</td>
                      <td>Spartium junceum</td>
                      <td>SPAR</td>
                      <td>JUN</td>
                    </tr>
                    <tr>
                      <td>SX</td>
                      <td>Spotted / mottled hawkweed</td>
                      <td>Hieracium maculatum</td>
                      <td>HIER</td>
                      <td>MAC</td>
                    </tr>
                    <tr>
                      <td>SK</td>
                      <td>Spotted knapweed</td>
                      <td>Centaurea stoebe / biebersteinii</td>
                      <td>BIEB</td>
                      <td>BIE</td>
                    </tr>
                    <tr>
                      <td>MV</td>
                      <td>Spring millet grass</td>
                      <td>Milium vernale</td>
                      <td>MILI</td>
                      <td>VER</td>
                    </tr>
                    <tr>
                      <td>TP</td>
                      <td>Spurge flax</td>
                      <td>Thymelaea passerina</td>
                      <td>THYM</td>
                      <td>PAS</td>
                    </tr>
                    <tr>
                      <td>CV</td>
                      <td>Squarrose knapweed</td>
                      <td>Centaurea virgata ssp. squarrosa</td>
                      <td>CENT</td>
                      <td>SQU</td>
                    </tr>
                    <tr>
                      <td>SJ</td>
                      <td>St. John's-wort</td>
                      <td>Hypericum perforatum</td>
                      <td>HYPE</td>
                      <td>PER</td>
                    </tr>
                    <tr>
                      <td>SC</td>
                      <td>Sulphur cinquefoil</td>
                      <td>Potentilla recta</td>
                      <td>POTE</td>
                      <td>REC</td>
                    </tr>
                    <tr>
                      <td>SF</td>
                      <td>Sweet fennel</td>
                      <td>Foeniculum vulgare</td>
                      <td>FOEN</td>
                      <td>VUL</td>
                    </tr>
                    <tr>
                      <td>SY</td>
                      <td>Syrian bean-caper</td>
                      <td>Zygophyllum fabago</td>
                      <td>ZYGO</td>
                      <td>FAB</td>
                    </tr>
                    <tr>
                      <td>TH</td>
                      <td>Tall hawkweed</td>
                      <td>Pilosella / Hieracium piloselloides</td>
                      <td>HIER</td>
                      <td>PIL</td>
                    </tr>
                    <tr>
                      <td>TR</td>
                      <td>Tansy ragwort</td>
                      <td>Jacobaea vulgaris / Senecio jacobaea</td>
                      <td>SENE</td>
                      <td>JAC</td>
                    </tr>
                    <tr>
                      <td>TB</td>
                      <td>Tartary buckwheat</td>
                      <td>Fagopyrum tataricum</td>
                      <td>FAGO</td>
                      <td>TAT</td>
                    </tr>
                    <tr>
                      <td>TX</td>
                      <td>Texas blueweed</td>
                      <td>Helianthus ciliaris</td>
                      <td>HELI</td>
                      <td>CIL</td>
                    </tr>
                    <tr>
                      <td>AA</td>
                      <td>Tree of heaven</td>
                      <td>Ailanthus altissima</td>
                      <td>AILA</td>
                      <td>ALT</td>
                    </tr>
                    <tr>
                      <td>LM</td>
                      <td>Variable leaf milfoil</td>
                      <td>Myriophyllum heterophyllum</td>
                      <td>MYRI</td>
                      <td>HET</td>
                    </tr>
                    <tr>
                      <td>VL</td>
                      <td>Velvet-leaf</td>
                      <td>Abutilon theophrasti</td>
                      <td>ABUT</td>
                      <td>THE</td>
                    </tr>
                    <tr>
                      <td>WA</td>
                      <td>Wall hawkweed</td>
                      <td>Hieracium murorum</td>
                      <td>HIER</td>
                      <td>MUR</td>
                    </tr>
                    <tr>
                      <td>WL</td>
                      <td>Wand loosestrife</td>
                      <td>Lythrum virgatum</td>
                      <td>LYTH</td>
                      <td>VIR</td>
                    </tr>
                    <tr>
                      <td>TN</td>
                      <td>Water chestnut</td>
                      <td>Trapa natans</td>
                      <td>TRAP</td>
                      <td>NAT</td>
                    </tr>
                    <tr>
                      <td>WH</td>
                      <td>Water hyacinth</td>
                      <td>Eichhornia crassipes</td>
                      <td>EICH</td>
                      <td>CRA</td>
                    </tr>
                    <tr>
                      <td>LW</td>
                      <td>Water lettuce</td>
                      <td>Pistia stratiotes</td>
                      <td>PIST</td>
                      <td>STR</td>
                    </tr>
                    <tr>
                      <td>AQ</td>
                      <td>Water soldier</td>
                      <td>Stratiotes aloides</td>
                      <td>STRA</td>
                      <td>ALO</td>
                    </tr>
                    <tr>
                      <td>WG</td>
                      <td>Western salsify / goat's-beard</td>
                      <td>Tragopogon dubius</td>
                      <td>TRAG</td>
                      <td>DUB</td>
                    </tr>
                    <tr>
                      <td>WP</td>
                      <td>Whiplash hawkweed</td>
                      <td>Pilosella flagellaris / Hieracium flagellare</td>
                      <td>HIER</td>
                      <td>FLA</td>
                    </tr>
                    <tr>
                      <td>WC</td>
                      <td>White cockle</td>
                      <td>Silene latifolia / Lychnis alba</td>
                      <td>LYCH</td>
                      <td>ALB</td>
                    </tr>
                    <tr>
                      <td>SR</td>
                      <td>White flowered broom</td>
                      <td>Cytisus multiflorus</td>
                      <td>CYTI</td>
                      <td>MUL</td>
                    </tr>
                    <tr>
                      <td>PW</td>
                      <td>Wild / common parsnip</td>
                      <td>Pastinaca sativa</td>
                      <td>PAST</td>
                      <td>SAT</td>
                    </tr>
                    <tr>
                      <td>WM</td>
                      <td>Wild / corn mustard</td>
                      <td>Sinapis arvensis</td>
                      <td>SINA</td>
                      <td>ARV</td>
                    </tr>
                    <tr>
                      <td>WB</td>
                      <td>Wild buckwheat</td>
                      <td>Fallopia convolvulus / Polygonum convolvulus</td>
                      <td>POLY</td>
                      <td>CON</td>
                    </tr>
                    <tr>
                      <td>WI</td>
                      <td>Wild chervil</td>
                      <td>Anthriscus sylvestris</td>
                      <td>ANTH</td>
                      <td>SYL</td>
                    </tr>
                    <tr>
                      <td>WF</td>
                      <td>Wild four o'clock</td>
                      <td>Mirabilis nyctaginea</td>
                      <td>MIRA</td>
                      <td>NYC</td>
                    </tr>
                    <tr>
                      <td>WO</td>
                      <td>Wild oat</td>
                      <td>Avena fatua</td>
                      <td>AVEN</td>
                      <td>FAT</td>
                    </tr>
                    <tr>
                      <td>JW</td>
                      <td>Wireweed</td>
                      <td>Sargassum muticum</td>
                      <td>SARG</td>
                      <td>MUT</td>
                    </tr>
                    <tr>
                      <td>WS</td>
                      <td>Wood sage</td>
                      <td>Salvia nemorosa</td>
                      <td>SALV</td>
                      <td>NEM</td>
                    </tr>
                    <tr>
                      <td>WW</td>
                      <td>Wormwood</td>
                      <td>Artemisia absinthium</td>
                      <td>ARTE</td>
                      <td>ABS</td>
                    </tr>
                    <tr>
                      <td>YA</td>
                      <td>Yellow archangel</td>
                      <td>Lamiastrum galeobdolon</td>
                      <td>LAMI</td>
                      <td>GAL</td>
                    </tr>
                    <tr>
                      <td>YF</td>
                      <td>Yellow floating heart</td>
                      <td>Nymphoides peltata</td>
                      <td>NYMP</td>
                      <td>PEL</td>
                    </tr>
                    <tr>
                      <td>HS</td>
                      <td>Yellow hawkweed species</td>
                      <td>Hieracium / Pilosella spp.</td>
                      <td>PILO</td>
                      <td>SPP</td>
                    </tr>
                    <tr>
                      <td>YI</td>
                      <td>Yellow iris</td>
                      <td>Iris pseudacorus</td>
                      <td>IRIS</td>
                      <td>PSE</td>
                    </tr>
                    <tr>
                      <td>YN</td>
                      <td>Yellow nutsedge / nut-grass</td>
                      <td>Cyperus esculentus</td>
                      <td>CYPE</td>
                      <td>ESC</td>
                    </tr>
                    <tr>
                      <td>YS</td>
                      <td>Yellow starthistle</td>
                      <td>Centaurea solstitialis</td>
                      <td>CENT</td>
                      <td>SOL</td>
                    </tr>
                    <tr>
                      <td>YT</td>
                      <td>Yellow/common toadflax</td>
                      <td>Linaria vulgaris</td>
                      <td>LINA</td>
                      <td>VUL</td>
                    </tr>
                    <tr>
                      <td>YD</td>
                      <td>Yellowdevil hawkweed</td>
                      <td>Pilosella glomerata / Hieracium glomeratum</td>
                      <td>HIER</td>
                      <td>GLO</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="container py-4">
            <div className="row">
              <div className="col-md-12">
                <h2>3. Source for layers in the layer picker</h2>
                <p>There is a selection of layers which can be toggled on and off while using the map in the Recorded
                  Activities and Current Activity tabs in InvasivesBC. The table below lists the name of each layer in the
                  Layer Picker feature of the application with the source object name from the BC Data warehouse -
                  accessible through the <a href="https://catalogue.data.gov.bc.ca/">British Columbia Data Catalogue</a>.</p>
                <table className="table table-blue-header">
                  <thead>
                    <tr>
                      <th>Layer Picker Label </th>
                      <th>Object Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Regional DistrictsM</td>
                      <td>WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_REGIONAL_DISTRICTS_SP</td>
                    </tr>
                    <tr>
                      <td>BC ParksM</td>
                      <td>WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW</td>
                    </tr>
                    <tr>
                      <td>Municipality BoundariesM</td>
                      <td>WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_MUNICIPALITIES_SP</td>
                    </tr>
                    <tr>
                      <td>BC Major WatershedsM</td>
                      <td>WHSE_BASEMAPPING.BC_MAJOR_WATERSHEDS</td>
                    </tr>
                    <tr>
                      <td>Freshwater Atlas RiversM</td>
                      <td>WHSE_BASEMAPPING.FWA_RIVERS_POLY</td>
                    </tr>
                    <tr>
                      <td>Freshwater LakesM</td>
                      <td>WHSE_LAND_AND_NATURAL_RESOURCE.EAUBC_LAKES_SP</td>
                    </tr>
                    <tr>
                      <td>Freshwater Atlas Stream NetworkM</td>
                      <td>WHSE_BASEMAPPING.FWA_STREAM_NETWORKS_SP</td>
                    </tr>
                    <tr>
                      <td>Water Licenses Drinking WaterM</td>
                      <td>WHSE_WATER_MANAGEMENT.WLS_BC_POD_DRINKNG_SOURCES_SP</td>
                    </tr>
                    <tr>
                      <td>Water Rights LicensesM</td>
                      <td>WHSE_WATER_MANAGEMENT.WLS_WATER_RIGHTS_LICENCES_SV</td>
                    </tr>
                    <tr>
                      <td>Water WellsM</td>
                      <td>WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW</td>
                    </tr>
                    <tr>
                      <td>Digital Road Atlas (DRA) – Master Partially-Attributed Roads</td>
                      <td>WHSE_BASEMAPPING.DRA_DGTL_ROAD_ATLAS_MPAR_SP</td>
                    </tr>
                    <tr>
                      <td>MOTI RFIM</td>
                      <td>WHSE_IMAGERY_AND_BASE_MAPS.MOT_ROAD_FEATURES_INVNTRY_SP</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
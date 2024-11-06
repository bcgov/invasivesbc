import { useHistory } from 'react-router';
import Accordion from 'UI/Accordion/Accordion';
import InvasivePlantTable from './InvasivePlantTable';
import LayerSourcesTable from './LayerSourcesTable';
import invbclogo from '/assets/InvasivesBC_Icon.svg';
import './LegendsPopup.css';

const LegendsPopup = () => {
  const history = useHistory();
  return (
    <div id="map-legends">
      <div className="content">
        <div className="control">
          <button onClick={() => history.goBack()}>Go Back</button>
        </div>
        <div className="intro">
          <img src={invbclogo} />
          <h1>InvasivesBC Map Legend</h1>
        </div>
        <Accordion title="InvasivesBC Activity Map Colors">
          <section className="activity-colors">
            <h2>InvasivesBC Activity Map Colors</h2>
            <p className="subheader">
              There are four categories of activities in InvasivesBC: <b>Observations</b>, <b>Treatments</b>,{' '}
              <b>Biocontrol</b>, and <b>Treatment Monitoring</b>. Each category has a unique colour associated with
              their respective polygons.
            </p>
            <div className="color-options">
              <div>
                <h3>Observation records are Green</h3>
                <img src="/assets/activitycolors/green.jpg" alt="Green records" />
              </div>
              <div>
                <h3>Biocontrol records are Purple</h3>
                <img src="/assets/activitycolors/purple.jpg" alt="Purple records" />
              </div>
              <div>
                <h3>Treatments records are Yellow</h3>
                <img src="/assets/activitycolors/yellow.jpg" alt="Yellow records" />
              </div>
              <div>
                <h3>Monitoring records are Blue</h3>
                <img src="/assets/activitycolors/blue.jpg" alt="Blue records" />
              </div>
            </div>
          </section>
        </Accordion>
        <Accordion title="Two Letter Invasive Plant Species Map Codes">
          <section className="plant-codes-section">
            <h2>Two Letter Invasive Plant Species Map Codes</h2>
            <p className="subheader">
              The following is a list of all possible map label species codes, indicating the species associated with
              each record. Each record may include one or more invasive plant codes.
            </p>
            <InvasivePlantTable />
          </section>
        </Accordion>
        <Accordion title="Source for Layers in the Layer Picker">
          <section className="layer-picker-sources">
            <h2>Source for Layers in the Layer Picker</h2>
            <p className="subheader">
              There is a selection of layers which can be toggled on and off while using the map in the Recorded
              Activities and Current Activity tabs in InvasivesBC. The table below lists the name of each layer in the
              Layer Picker feature of the application with the source object name from the BC Data warehouse -
              accessible through the <a href="https://catalogue.data.gov.bc.ca/">British Columbia Data Catalogue</a>.
            </p>
            <LayerSourcesTable />
          </section>
        </Accordion>
      </div>
    </div>
  );
};

export default LegendsPopup;

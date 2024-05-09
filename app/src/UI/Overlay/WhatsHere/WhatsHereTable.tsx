import React from 'react';
import { useDispatch } from 'react-redux';
import center from '@turf/center';

import { useSelector } from 'utils/use_selector';
import { calc_utm } from 'utils/utm';
import { Button, Grid, Tab, TableContainer, Tabs } from '@mui/material';
import { RenderTableActivity, RenderTablePOI, RenderTablePosition } from 'utils/WhatsHereTableHelpers';
import { MAP_SET_WHATS_HERE_SECTION, MAP_TOGGLE_WHATS_HERE, TOGGLE_PANEL } from 'state/actions';

import './WhatsHereTable.css';

import AdjustIcon from '@mui/icons-material/Adjust';
import FolderIcon from '@mui/icons-material/Folder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useHistory } from 'react-router';
import { OverlayHeader } from '../OverlayHeader';

export const createDataUTM = (name: string, value: any) => {
  return { name, value };
};

export const WhatsHereTable = (props) => {
  const whatsHere = useSelector((state: any) => state.Map?.whatsHere);
  const history = useHistory();

  const position = whatsHere?.feature?.geometry ? center(whatsHere?.feature?.geometry)?.geometry.coordinates : [0, 0];
  const utmResult = calc_utm(position[0], position[1]);
  const utmRows = [
    createDataUTM('Zone', utmResult[0]),
    createDataUTM('Easting', utmResult[1]),
    createDataUTM('Northing', utmResult[2])
  ];
  const dispatch = useDispatch();

  const popupOnClose = () => {
    history.goBack();
    dispatch({ type: MAP_TOGGLE_WHATS_HERE });
    dispatch({ type: TOGGLE_PANEL });
  };

  const handleChange = (_event: React.ChangeEvent<{}>, newSection: string) => {
    dispatch({
      type: MAP_SET_WHATS_HERE_SECTION,
      payload: {
        section: newSection
      }
    });
  };

  const goToRecord = () => {
    const id = whatsHere.section === 'invasivesbc' ? whatsHere?.clickedActivity : whatsHere?.clickedIAPP;
    // if (authenticated && roles.length > 0) {
    // }
    // authentication is needed eventually
    if (whatsHere?.section === 'invasivesbc') {
      history.push(`/Records/Activity:${id}/form`);
    } else if (whatsHere?.highlightedType === 'IAPP') {
      history.push(`/Records/IAPP/${id}/summary`);
    }
  };

  const getActivityDescriptionForOpenButton = () => {
    return `Open InvasivesBC record: ${whatsHere?.clickedActivityDescription}`;
  };
  const getIAPPDescriptionForOpenButton = () => {
    return `Open IAPP record: ${whatsHere?.clickedIAPPDescription}`;
  };

  return (
    <div className="whatshere-container">
      <OverlayHeader closeCallback={popupOnClose}></OverlayHeader>
      {whatsHere?.section ? (
        <div className="whatshere-table-container">
          <div className="whatshere_back_button">
            <Button onClick={() => history.goBack()} variant="contained">
              {'< Back'}
            </Button>
          </div>
          <div id="whatsherepopup" className="whatshere-table">
            <Grid className="whatshere-header" container justifyContent="center" sx={{ mb: 2, pb: 1 }}>
              <div className="whatshere-title">
                {' '}
                What's Here: <br /> {`UTM: Z-${utmRows[0]?.value} E-${utmRows[1]?.value} N-${utmRows[2]?.value}`}
              </div>
              <Tabs value={whatsHere?.section} onChange={handleChange} centered>
                <Tab value="invasivesbc" label="InvasivesBC Records" icon={<FolderIcon />} />
                {/* value="databc" label="Data BC" icon={<StorageIcon />} */}
                <Tab value="iapp" label="IAPP Records" icon={<AdjustIcon />} />
              </Tabs>
            </Grid>
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                {whatsHere?.section === 'invasivesbc' && whatsHere?.clickedActivity ? (
                  <Button variant="contained" onClick={goToRecord}>
                    {getActivityDescriptionForOpenButton()}
                  </Button>
                ) : (
                  <></>
                )}
                {whatsHere?.section === 'iapp' && whatsHere?.clickedIAPP ? (
                  <Button variant="contained" onClick={goToRecord}>
                    {getIAPPDescriptionForOpenButton()}
                  </Button>
                ) : (
                  <></>
                )}
              </Grid>
            </Grid>

            <TableContainer className="whatshere-position">
              <RenderTableActivity />
              {/*section == 'databc' && <RenderTableDataBC rows={databc} />*/}
              <RenderTablePOI />
            </TableContainer>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

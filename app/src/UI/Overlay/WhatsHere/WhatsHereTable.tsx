import React from 'react';
import { useDispatch } from 'react-redux';
import center from '@turf/center';
import { Button, Divider, Grid, Tab, TableContainer, Tabs } from '@mui/material';
import { MAP_SET_WHATS_HERE_SECTION } from 'state/actions';
import AdjustIcon from '@mui/icons-material/Adjust';
import FolderIcon from '@mui/icons-material/Folder';
import { useHistory } from 'react-router';

import { OverlayHeader } from '../OverlayHeader';
import { RenderTableActivity } from './Subcomponents/RenderTableActivity';
import RenderTablePOI from './Subcomponents/RenderTablePOI';
import { useSelector } from 'utils/use_selector';
import { calc_utm } from 'utils/utm';
import './WhatsHereTable.css';

export const createDataUTM = (name: string, value: any) => {
  return { name, value };
};

export const WhatsHereTable = () => {
  const dispatch = useDispatch();

  const whatsHere = useSelector((state) => state.Map?.whatsHere);
  const history = useHistory();

  const position = whatsHere?.feature?.geometry ? center(whatsHere?.feature?.geometry)?.geometry.coordinates : [0, 0];
  const utmResult = calc_utm(position[0], position[1]);
  const utmRows = [
    createDataUTM('Zone', utmResult[0]),
    createDataUTM('Easting', utmResult[1]),
    createDataUTM('Northing', utmResult[2])
  ];

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
    if (whatsHere?.section === 'invasivesbc') {
      history.push(`/Records/Activity:${id}/form`);
    } else if (whatsHere?.highlightedType === 'IAPP') {
      history.push(`/Records/IAPP/${id}/summary`);
    }
  };

  const getActivityDescriptionForOpenButton = () => `Open InvasivesBC record: ${whatsHere?.clickedActivityDescription}`;
  const getIAPPDescriptionForOpenButton = () => `Open IAPP record: ${whatsHere?.clickedIAPPDescription}`;

  return (
    <div className="whatshere-container">
      <OverlayHeader />
      {whatsHere?.section && (
        <div className="whatshere-table-container">
          <div className="whatshere_back_button">
            <Button onClick={() => history.goBack()} variant="contained">
              {'< Back'}
            </Button>
          </div>
          <div id="whatsherepopup" className="whatshere-table">
            <Grid className="whatshere-header" container justifyContent="center" sx={{ mb: 2 }}>
              <div className="whatshere-title">
                What's Here: <br /> {`UTM: Z-${utmRows[0]?.value} E-${utmRows[1]?.value} N-${utmRows[2]?.value}`}
              </div>
              <Tabs value={whatsHere?.section} onChange={handleChange} centered>
                <Tab value="invasivesbc" label="InvasivesBC Records" icon={<FolderIcon />} />
                <Tab value="iapp" label="IAPP Records" icon={<AdjustIcon />} />
              </Tabs>
            </Grid>
            <Grid container spacing={2} justifyContent="center">
              <Grid item sx={{ mb: 1 }}>
                {whatsHere?.section === 'invasivesbc' && whatsHere?.clickedActivity && (
                  <Button variant="contained" onClick={goToRecord}>
                    {getActivityDescriptionForOpenButton()}
                  </Button>
                )}
                {whatsHere?.section === 'iapp' && whatsHere?.clickedIAPP && (
                  <Button variant="contained" onClick={goToRecord}>
                    {getIAPPDescriptionForOpenButton()}
                  </Button>
                )}
              </Grid>
            </Grid>

            <TableContainer className="whatshere-position">
              {whatsHere?.section === 'invasivesbc' && <RenderTableActivity />}
              {whatsHere?.section === 'iapp' && <RenderTablePOI />}
            </TableContainer>
          </div>
        </div>
      )}
    </div>
  );
};

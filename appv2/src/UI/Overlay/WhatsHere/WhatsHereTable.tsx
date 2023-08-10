import React from "react";
import { useDispatch } from "react-redux";
import center from "@turf/center";

import { useSelector } from "util/use_selector";
import { selectMap } from "state/reducers/map";
import { calc_utm } from "util/utm";
import { Button, Grid, Tab, TableContainer, Tabs } from "@mui/material";
import { RenderTableActivity, RenderTablePOI, RenderTablePosition } from "util/WhatsHereTableHelpers";
import { MAP_SET_WHATS_HERE_SECTION, MAP_TOGGLE_WHATS_HERE, TOGGLE_PANEL } from "state/actions";

import "./WhatsHereTable.css";

import AdjustIcon from '@mui/icons-material/Adjust';
import FolderIcon from '@mui/icons-material/Folder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useHistory } from "react-router";
import { OverlayHeader } from "../OverlayHeader";

export const createDataUTM = (name: string, value: any) => {
  return { name, value };
};

export const WhatsHereTable = (props) => {
  // const { darkTheme } = useSelector(selectUserSettings);
  const mapState = useSelector(selectMap);
  const history = useHistory();

  const position = mapState?.whatsHere?.feature?.geometry ? center(mapState?.whatsHere?.feature?.geometry)?.geometry.coordinates : [0, 0];
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
    const id = mapState?.whatsHere?.highlightedURLID;
    // if (authenticated && roles.length > 0) {
      // }
    // authentication is needed eventually
    if (mapState?.whatsHere?.highlightedType === "Activity") {
      history.push(`/Records/Activity:${id}/form`);
      dispatch({ type: MAP_TOGGLE_WHATS_HERE, payload: {toggle: false} });
    } else if (mapState?.whatsHere?.highlightedType === "IAPP") {
      history.push(`/Records/IAPP:${id}/form`);
      dispatch({ type: MAP_TOGGLE_WHATS_HERE, payload: {toggle: false} });
    }
  }

  return (
    <div className="whatshere-container">
      <OverlayHeader closeCallback={popupOnClose}></OverlayHeader>
      {mapState?.whatsHere?.section ? (
        <div className="whatshere-table-container">
          <div
            id="whatsherepopup"
            className="whatshere-table">
            <Grid container justifyContent="center" sx={{mb: 2, pb: 1}}>
              <Tabs value={mapState?.whatsHere?.section} onChange={handleChange} centered>
                <Tab value="position" label="" icon={<LocationOnIcon />} />
                <Tab value="invasivesbc" label="" icon={<FolderIcon />} />
                {/* value="databc" label="Data BC" icon={<StorageIcon />} */}
                <Tab value="iapp" label="" icon={<AdjustIcon />} />
              </Tabs>
            </Grid>
            <Grid container spacing={2} justifyContent="center">
              {mapState?.whatsHere?.highlightedACTIVITY || mapState?.whatsHere?.highlightedIAPP ? 
              <Grid item>
                <Button variant="contained" onClick={goToRecord}>
                  {`Open ${mapState?.whatsHere?.highlightedType} record: ${
                    mapState?.whatsHere?.highlightedType === "IAPP" ? 
                      mapState?.whatsHere?.highlightedIAPP
                      :
                      mapState?.whatsHere?.highlightedACTIVITY}
                  `}
                </Button>
              </Grid>
              :
              <></>}
            </Grid>
            <TableContainer className="whatshere-position">
              <RenderTablePosition rows={utmRows} />
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
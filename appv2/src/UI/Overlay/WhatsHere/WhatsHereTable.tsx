import React from "react";
import { useDispatch } from "react-redux";
import center from "@turf/center";

import { useSelector } from "util/use_selector";
import { selectMap } from "state/reducers/map";
import { selectUserSettings } from "state/reducers/userSettings";
import { calc_utm } from "util/utm";
import { BottomNavigation, BottomNavigationAction, Button, Grid, TableContainer } from "@mui/material";
import { RenderTableActivity, RenderTablePOI, RenderTablePosition } from "util/WhatsHereTableHelpers";
import { MAP_SET_WHATS_HERE_SECTION, MAP_TOGGLE_WHATS_HERE, TOGGLE_PANEL } from "state/actions";

import "./WhatsHereTable.css";

import AdjustIcon from '@mui/icons-material/Adjust';
import FolderIcon from '@mui/icons-material/Folder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useHistory } from "react-router";

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

  return (
    <>
      {mapState?.whatsHere?.section ? (
        <div
          id="whatsherepopup"
          className="whatshere-table">
          <Grid container justifyContent="center">
            <Grid item>
              <Button onClick={popupOnClose}>Close</Button>
            </Grid>
          </Grid>
          <TableContainer className="whatshere-position">
            <RenderTablePosition rows={utmRows} />
            <RenderTableActivity />
            {/*section == 'databc' && <RenderTableDataBC rows={databc} />*/}
            <RenderTablePOI />
          </TableContainer>
          <Grid container justifyContent="center">
            <BottomNavigation
              value={mapState?.whatsHere?.section}
              onChange={handleChange}>
              <BottomNavigationAction value="position" label="Position" icon={<LocationOnIcon />} />
              <BottomNavigationAction value="invasivesbc" label="InvasivesBC" icon={<FolderIcon />} />
              {/*<BottomNavigationAction value="databc" label="Data BC" icon={<StorageIcon />} />*/}
              <BottomNavigationAction value="iapp" label="IAPP" icon={<AdjustIcon />} />
            </BottomNavigation>
          </Grid>

        </div>
      ) : (
        <></>
      )}
    </>
  );
};
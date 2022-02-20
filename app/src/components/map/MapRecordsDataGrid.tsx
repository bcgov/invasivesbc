import React, { useRef, useEffect, useState, useContext } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { DomEvent } from 'leaflet';
import { Theme, Button } from '@mui/material';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { MapRecordsContext } from 'contexts/MapRecordsContext';
import makeStyles from '@mui/styles/makeStyles';
import { MapRequestContext } from 'contexts/MapRequestsContext';

const useStyles = makeStyles((theme: Theme) => ({
  mainDiv: {
    transition: 'transform 200ms ease',
    padding: 0,
    height: '40vh',
    [theme.breakpoints.down('md')]: {
      height: '500px',
      maxWidth: '100vw'
    },
    maxWidth: '700px',
    width: '100%'
  },
  dataGrid: {
    margin: 0,
    width: '100%',
    backgroundColor: theme.palette.background.default,
    height: '100%'
  },
  expandGridToggleBTN: {
    margin: '0 auto',
    left: '50%',
    transform: 'translateX(-50%)',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  }
}));

const MapRecordsDataGrid = (props) => {
  const mapRequestContext = useContext(MapRequestContext);
  const { currentRecords } = mapRequestContext;
  const classes = useStyles();
  const mainDivRef = useRef(null);
  const [dataGridExpanded, setDataGridExpanded] = useState(false);

  const toggleExpand = () => {
    setDataGridExpanded((prev) => {
      return !prev;
    });
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
      field: 'type',
      headerName: 'Activity Type',
      width: 150
    },
    {
      field: 'species_negative',
      headerName: 'Species Negative',
      width: 150
    },
    {
      field: 'species_positive',
      headerName: 'Species Positive',
      width: 150
    }
  ];

  useEffect(() => {
    if (mainDivRef?.current) {
      DomEvent.disableClickPropagation(mainDivRef?.current);
      DomEvent.disableScrollPropagation(mainDivRef?.current);
    }
  }, []);

  return (
    <div
      style={{
        transform: dataGridExpanded ? 'translateY(-36px) translateX(-50%)' : 'translateY(90%) translateX(-50%)'
      }}
      className={classes.mainDiv + ' leaflet-center leaflet-bottom leaflet-control'}
      ref={mainDivRef}>
      <Button
        onClick={toggleExpand}
        className={'leaflet-control ' + classes.expandGridToggleBTN}
        color={'secondary'}
        style={{ margin: '0 auto', marginBottom: 0 }}
        variant="contained"
        endIcon={
          <ArrowDropUpIcon
            style={{
              transition: 'transform 200ms ease',
              transform: dataGridExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          />
        }>
        Records Data
      </Button>

      <DataGrid
        className={classes.dataGrid + ' leaflet-control'}
        rows={currentRecords}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        checkboxSelection
        disableSelectionOnClick
      />
    </div>
  );
};

export default MapRecordsDataGrid;

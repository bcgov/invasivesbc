import React, { useRef, useEffect, useState, useContext } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { DomEvent } from 'leaflet';
import { makeStyles, Theme, Button } from '@material-ui/core';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { MapRecordsContext } from 'contexts/MapRecordsContext';

const useStyles = makeStyles((theme: Theme) => ({
  mainDiv: {
    transition: 'transform 200ms ease',
    padding: 0,
    height: '40vh',
    width: '500px'
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
    borderBottomRightRadius: 0,
    backgroundColor: theme.palette.background.default
  }
}));

const MapRecordsDataGrid = (props) => {
  const mapRecordsContext = useContext(MapRecordsContext);
  const classes = useStyles();
  const mainDivRef = useRef(null);
  const [dataGridExpanded, setDataGridExpanded] = useState(false);

  const { records, setRecords, selectedRecords, setSelectedRecords } = mapRecordsContext;

  useEffect(() => {
    console.log('records: ', records);
    console.log('selectedRecords: ', selectedRecords);
  }, [records, setRecords, selectedRecords, setSelectedRecords]);

  const toggleExpand = () => {
    setDataGridExpanded((prev) => {
      return !prev;
    });
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
      field: 'activity_type',
      headerName: 'Activity Type',
      width: 150
    }
  ];

  const rows = [
    { id: 1, activity_type: 'Observation' },
    { id: 2, activity_type: 'Treatment' },
    { id: 3, activity_type: 'Observation' },
    { id: 4, activity_type: 'Treatment' },
    { id: 5, activity_type: 'Observation' },
    { id: 6, activity_type: 'Treatment' },
    { id: 7, activity_type: 'Observation' },
    { id: 8, activity_type: 'Treatment' }
  ];

  useEffect(() => {
    if (mainDivRef?.current) {
      DomEvent.disableClickPropagation(mainDivRef?.current);
      DomEvent.disableScrollPropagation(mainDivRef?.current);
    }
  });

  return (
    <div
      style={{
        transform: dataGridExpanded ? 'translateY(0px) translateX(-50%)' : 'translateY(320px) translateX(-50%)'
      }}
      className={classes.mainDiv + ' leaflet-center leaflet-bottom leaflet-control'}
      ref={mainDivRef}>
      <Button
        onClick={toggleExpand}
        className={'leaflet-control ' + classes.expandGridToggleBTN}
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

      {/* <Button
        onClick={() => {
          setRecords((prev) => {
            return [...prev, { id: Math.random(), activity_type: 'Observation' }];
          });
        }}>
        Add record
      </Button> */}

      <DataGrid
        className={classes.dataGrid + ' leaflet-control'}
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
        disableSelectionOnClick
      />
    </div>
  );
};

export default MapRecordsDataGrid;

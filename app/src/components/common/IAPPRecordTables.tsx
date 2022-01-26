import React, { useContext, useEffect, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from 'constants/database';
import { useDataAccess } from 'hooks/useDataAccess';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { DataGrid, GridCellParams, GridColDef, MuiEvent } from '@mui/x-data-grid';
import { getJurisdictions } from 'components/map/Tools/ToolTypes/Data/InfoAreaDescription';
import { useHistory } from 'react-router';

const columns: GridColDef[] = [
  {
    field: 'id',
    headerName: 'IAPP ID',
    hide: true
  },
  {
    field: 'site_id',
    headerName: 'IAPP ID'
  },
  {
    field: 'date_created',
    headerName: 'Date Created',
    width: 150
  },
  {
    field: 'jurisdiction_code',
    headerName: 'Jurisdiction Code',
    width: 250
  },
  {
    field: 'site_elevation',
    headerName: 'Site Elevation',
    width: 120
  },
  {
    field: 'slope_code',
    headerName: 'Slope Code',
    width: 120
  },
  {
    field: 'aspect_code',
    headerName: 'Aspect Code',
    width: 120
  },
  {
    field: 'soil_texture_code',
    headerName: 'Soil Texture Code',
    width: 150
  },
  {
    field: 'latitude',
    headerName: 'Latitude',
    width: 110
  },
  {
    field: 'longitude',
    headerName: 'Longitude',
    width: 110
  }
];

export const PointsOfInterestTable = () => {
  const [pois, setPOIs] = useState([]);
  const [rows, setRows] = useState([]);
  const history = useHistory();
  const dataAccess = useDataAccess();
  const databaseContext = useContext(DatabaseContext);

  useEffect(() => {
    console.log('fetched iapp stuff', pois);
  }, [pois]);

  const fetchData = async () => {
    const searchCriteria = { limit: 100, isIAPP: true, page: 0 };
    console.log('fetching with ', searchCriteria);
    const IAPPRecords: any = await dataAccess.getPointsOfInterest(searchCriteria, databaseContext);
    console.log('fetched', IAPPRecords);
    setPOIs(IAPPRecords.rows);
  };

  const convertToTableRows = () => {
    const tempArr = [];
    for (const poi of pois) {
      // shortcut for point of interest payload
      const payload = poi?.point_of_interest_payload;
      // shortcut for data in payload
      const form_data = payload?.form_data;
      // shortcut for type_data and data in form_data obj
      const type_data = form_data?.point_of_interest_type_data;
      const data = form_data?.point_of_interest_data;
      const newArr = [];
      const jurisdictionArr = [];
      getJurisdictions(newArr, poi);
      newArr.forEach((item) => {
        jurisdictionArr.push(item.code + ' (' + item.percent_covered + '%)');
      });

      var row = {
        id: poi?.point_of_interest_id,
        site_id: type_data?.site_id,
        date_created: data?.date_created,
        jurisdiction_code: jurisdictionArr,
        site_elevation: type_data?.site_elevation,
        slope_code: type_data?.slope_code,
        aspect_code: type_data?.aspect_code,
        soil_texture_code: type_data?.soil_texture_code,
        latitude: poi.geom.geometry.coordinates[1],
        longitude: poi.geom.geometry.coordinates[0]
      };
      tempArr.push(row);
    }
    setRows(tempArr);
  };

  useEffect(() => {
    if (pois?.length < 1) {
      fetchData();
    } else {
      convertToTableRows();
    }
  }, [pois]);

  return (
    <>
      <div style={{ height: 520, width: '100%' }}>
        {
          <DataGrid
            columns={columns}
            rows={rows}
            pageSize={10}
            rowsPerPageOptions={[10]}
            onCellClick={(params: GridCellParams, event: MuiEvent<React.MouseEvent>) => {
              history.push(`/home/iapp/${params.id}`);
            }}
          />
        }
      </div>
    </>
  );
};

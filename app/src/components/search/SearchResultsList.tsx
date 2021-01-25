import { Box, Button, makeStyles, Theme, Typography } from '@material-ui/core';
import SearchActivitiesList from 'components/activities-list/SearchActivitiesList';
import { ISearchActivity } from 'features/home/search/SearchPage';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

interface ISearchResultsList {
  classes?: any;
  totalItems: number;
  results?: ISearchActivity[];
}

const useStyles = makeStyles((theme: Theme) => ({
  resultsBar: {
    justifyContent: 'space-between',
    display: 'flex',
    alignItems: 'center'
  },
  bulkButton: {
    marginLeft: 10
  }
}));

const SearchResultsList: React.FC<ISearchResultsList> = (props) => {
  const [editIds, setEditIds] = useState<any[]>([]);
  const history = useHistory();
  const classes = useStyles();
  const invasivesApi = useInvasivesApi();

  const navigateToBulkEditPage = (ids: any) => {
    history.push({
      pathname: `/home/search/bulkedit`,
      search: '?activities=' + ids.join(','),
      state: { activityIdsToEdit: ids }
    });
  };

  return (
    <Box>
      <Box className={classes.resultsBar}>
        <Typography variant="h5">{`${props.totalItems} Matching Results Found`}</Typography>
        <Box className={classes.resultsBar}>
          <Typography variant="h5">{editIds.length ? editIds.length + ' Selected' : ''}</Typography>
          <Button
            className={classes.bulkButton}
            disabled={editIds.length === 0}
            variant="contained"
            color="primary"
            onClick={() =>
              navigateToBulkEditPage(editIds)
            }>
            Edit
          </Button>
          <Button
            className={classes.bulkButton}
            disabled={editIds.length === 0}
            variant="contained"
            color="primary"
            onClick={() => {
              setEditIds([]);
              invasivesApi.deleteActivities(editIds);
              history.go(0);
            }}>
            Delete
          </Button>
        </Box>
      </Box>
      <SearchActivitiesList activities={props.results} editIds={editIds} setEditIds={setEditIds} />
    </Box>
  );
};

export default SearchResultsList;

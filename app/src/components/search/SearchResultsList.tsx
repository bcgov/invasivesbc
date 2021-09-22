import { Box, Button, makeStyles, Theme, Typography } from '@material-ui/core';
import SearchActivitiesList from 'components/activities-list/SearchActivitiesList';
import { ISearchActivity } from 'features/home/search/SearchPage';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { notifyError } from 'utils/NotificationUtils';
import { DatabaseContext } from 'contexts/DatabaseContext';

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
  const [edits, setEdits] = useState<any[]>([]);
  const history = useHistory();
  const classes = useStyles();
  const invasivesApi = useInvasivesApi();
  const databaseContext = useContext(DatabaseContext);

  const navigateToEditPage = (editsList: any) => {
    if (new Set(editsList.map((edit) => edit.subtype)).size > 1) {
      notifyError(databaseContext, 'Sorry, all activites must be the same Subtype in order to Bulk Edit.');
      return;
    }
    const ids = editsList.map((edit) => edit.id);
    if (ids.length > 1) {
      history.push({
        pathname: `/home/search/bulkedit`,
        search: '?activities=' + ids.join(','),
        state: { activityIdsToEdit: ids }
      });
    } else {
      history.push(`/home/search/activity/${ids[0]}`);
    }
  };

  return (
    <Box>
      <Box className={classes.resultsBar}>
        <Typography variant="h5">{`${props.totalItems} Matching Results Found`}</Typography>
        <Box className={classes.resultsBar}>
          <Typography variant="h5">{edits.length ? edits.length + ' Selected' : ''}</Typography>
          <Button
            className={classes.bulkButton}
            disabled={edits.length === 0}
            variant="contained"
            color="primary"
            onClick={() => {
              navigateToEditPage(edits);
            }}>
            Edit
          </Button>
          <Button
            className={classes.bulkButton}
            disabled={edits.length === 0}
            variant="contained"
            color="primary"
            onClick={() => {
              invasivesApi.deleteActivities(edits.map((edit) => edit.id));
              setEdits([]);
              history.go(0);
            }}>
            Delete
          </Button>
        </Box>
      </Box>
      <SearchActivitiesList activities={props.results} edits={edits} setEdits={setEdits} />
    </Box>
  );
};

export default SearchResultsList;

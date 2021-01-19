import { Box, Button, Typography } from '@material-ui/core';
import SearchActivitiesList from 'components/activities-list/SearchActivitiesList';
import { ISearchActivity } from 'features/home/search/SearchPage';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

interface ISearchResultsList {
  classes?: any;
  totalItems: number;
  results?: ISearchActivity[];
}

const SearchResultsList: React.FC<ISearchResultsList> = (props) => {
  const [editIds, setEditIds] = useState<any[]>([]);
  const history = useHistory();

  const bulkEditActivities = (editIds: any) => {
    history.push({
      pathname: `/home/search/bulkedit`,
      search: '?activities=' + editIds.join(','),
      state: { activityIdsToEdit: editIds },
    });
  };

  return (
    <Box>
      <Box style={{
        justifyContent: 'space-between',
        display: 'flex',
        alignItems: 'flex-end'
      }}>
        <Typography variant="h5">
          {(!props.totalItems && 'No Results Found') || `${props.totalItems} Matching Results Found`}
        </Typography>
        <Button
          disabled={editIds.length === 0}
          variant="contained"
          color="primary"
          onClick={() => bulkEditActivities(editIds)}
          >
          Edit Selected
        </Button>
      </Box>
      <SearchActivitiesList
        activities={props.results}
        editIds={editIds}
        setEditIds={setEditIds}
      />
    </Box>
  );
};

export default SearchResultsList;

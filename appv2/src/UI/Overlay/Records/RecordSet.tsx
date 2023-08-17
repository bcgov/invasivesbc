import React from 'react';
import { useSelector } from 'react-redux';
import { selectUserSettings } from 'state/reducers/userSettings';
import './RecordSet.css';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import { useHistory } from 'react-router';
import Accordion from '@mui/material/Accordion';
import { AccordionSummary } from '@mui/material';
import { RecordTable } from './RecordTable';
import { activityColumnsToDisplay, iappColumnsToDisplay } from './RecordTableHelpers';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { set } from 'lodash';

export const RecordSet = (props) => {
  const userSettingsState = useSelector(selectUserSettings);
  const history = useHistory();

  const [filterTypeChooserOpen, setFilterTypeChooserOpen] = React.useState(false);

  const filterColumns =
    userSettingsState?.recordSets?.[props.setId].recordSetType === 'Activity'
      ? activityColumnsToDisplay
      : iappColumnsToDisplay;
  const filterOptions = filterColumns.map((option) => {
    return { label: option.name, value: option.key };
  });

  const onClickBackButton = () => {
    history.push('/Records');
  };

  const Filter = (props) => {
    return (
      <div className="recordSet_filter">
        <div className="recordSet_filter_operator">{props.operator}</div>
        <div className="recordSet_filter_type">
          <select
            key={'filterType' + props.name}
            value={props.type}
            onChange={(e) => {
              alert('need dispatch here');
            }}>
            {filterOptions.map((option) => {
              return (
                <option key={option.value + option.label} value={option.value}>
                  {option.label}
                </option>
              );
            })}
          </select>
        </div>
        <div className="recordSet_filter_value">
          {props.type === 'searchBoundary' ? (
            <select
              key={'filterValue' + props.name}
              value={props.name}
              onChange={(e) => {
                alert('need dispatch here');
              }}>
              <option value="searchBoundary">example search boundary</option>
            </select>
          ) : (
            <> </>
          )}
          ;{props.type === 'data' ? <input type="text" value={props.value} /> : <></>}
        </div>
      </div>
    );
  };

  switch (userSettingsState?.recordSets?.[props.setId]) {
    case undefined:
      return <></>;
    default:
      return (
        <div className="recordSet_container">
          <div className="stickyHeader">
            <div
              className="recordSet_header"
              style={{ backgroundColor: userSettingsState?.recordSets?.[props.setId]?.color }}>
              <div className="recordSet_back_button">
                <Button onClick={onClickBackButton} variant="contained">
                  {'< Back'}
                </Button>{' '}
              </div>
              <div className="recordSet_header_name">{userSettingsState?.recordSets?.[props.setId]?.recordSetName}</div>
              <div className="recordSet_new_filter_button">
                {filterTypeChooserOpen ? (
                  <select
                    onChange={(e) => {
                      setFilterTypeChooserOpen(false);
                    }}>
                    <option value="searchBoundary">Choose a filter type</option>
                    <option value="data">Data/Field</option>
                    <option value="searchBoundary">Search Boundary</option>
                    <option value="cancel">Cancel</option>
                  </select>
                ) : (
                  <Button
                    onClick={() => {
                      setFilterTypeChooserOpen(true);
                    }}
                    variant="contained">
                    + Add Filter
                  </Button>
                )}
              </div>
              <div className="recordSet_menu_button">
                <Button variant="contained">
                  <MenuIcon />
                  Menu
                </Button>
              </div>
            </div>
            <Accordion>
              <AccordionSummary className="recordSet_filter_accordion_collapsed">Filters: 5</AccordionSummary>
              <div className="recordSet_filters_container">
                <div className="recordSet_filters">
                  {
                    /*we'll map over a list of these later*/
                    userSettingsState?.recordSets?.[props.setId]?.searchBoundary?.name ? (
                      <Filter
                        operator="DOES Match"
                        type="searchBoundary"
                        name={userSettingsState?.recordSets?.[props.setId]?.searchBoundary?.name}
                      />
                    ) : (
                      <></>
                    )
                  }
                  {userSettingsState?.recordSets?.[props.setId]?.gridFilters ? (
                    Object.keys(userSettingsState?.recordSets?.[props.setId]?.gridFilters).map((key, i) => {
                      return <Filter key={'filterIndex' + i} operator="DOES Match" type="data" name={key} />;
                    })
                  ) : (
                    <></>
                  )}
                  {userSettingsState?.recordSets?.[props.setId]?.advancedFilters ? (
                    userSettingsState?.recordSets?.[props.setId]?.advancedFilters?.map((filter: any, i) => {
                      return (
                        <Filter key={'filterIndex' + i} operator="DOES Match" type="data2" name={filter?.filterKey} />
                      );
                    })
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </Accordion>
          </div>
          <RecordTable setId={props.setId} />
        </div>
      );
  }
};

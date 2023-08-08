import React from 'react';
import { useSelector } from 'react-redux';
import { selectUserSettings } from 'state/reducers/userSettings';
import './RecordSet.css';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import { useHistory } from 'react-router';
import Accordion from '@mui/material/Accordion';
import { AccordionSummary } from '@mui/material';

export const RecordSet = (props) => {
  const userSettingsState = useSelector(selectUserSettings);
  const history = useHistory();

  const onClickBackButton = () => {
    history.push('/Records');
  };

  const Filter = (props) => {
    return (
      <div className="recordSet_filter">
        <div className="recordSet_filter_operator">{props.operator}</div>
        <div className="recordSet_filter_type">{props.type}</div>
        <div className="recordSet_filter_name">{props.name}</div>
      </div>
    );
  };

  switch (userSettingsState?.recordSets?.[props.setId]) {
    case undefined:
      return <></>;
    default:
      return (
        <div className="recordSet_container">
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
              <Button variant="contained">+ Add Filter</Button>{' '}
            </div>
            <div className="recordSet_menu_button">
              <Button variant="contained">
                <MenuIcon />
                Menu
              </Button>
            </div>
          </div>
          <Accordion>
          <AccordionSummary>Filters: 5</AccordionSummary>
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
                  return <Filter key={'filterIndex' + i} operator="DOES Match" type="data2" name={filter?.filterKey} />;
                })
              ) : (
                <></>
              )}
            </div>
          </div>
          </Accordion>
        </div>
      );
  }
};

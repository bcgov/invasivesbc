import { Button, Popover, Switch } from '@mui/material';
import { MouseEvent, TouchEvent, useState } from 'react';
import { ViewColumn } from '@mui/icons-material';
import './RecordTableColumnSelect.css';
import { RecordSetType } from 'interfaces/UserRecordSet';
import { useDispatch, useSelector } from 'utils/use_selector';
import UserSettings from 'state/actions/userSettings/UserSettings';

type PropTypes = {
  recordSetType: RecordSetType;
};
const RecordTableColumnSelect = ({ recordSetType }: PropTypes) => {
  const handleClick = (event: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);

  const dispatch = useDispatch();
  const columns = useSelector((state) => state.UserSettings.tableColumns[recordSetType]);

  const [filter, setFilter] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const shownColumns = !filter ? columns : columns.filter((col) => new RegExp(filter, 'i').test(col.name));

  const id = 'table-column-select';
  return (
    <div className="custom-popover">
      <Button aria-describedby={id} size={'small'} onClick={handleClick}>
        <ViewColumn /> Columns
      </Button>

      <Popover
        open={!!anchorEl}
        id={id}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        onClose={() => setAnchorEl(null)}
      >
        <div className="popover-content">
          <div className="popover-search">
            <input
              type="text"
              placeholder="Find Column"
              value={filter}
              onChange={(evt) => setFilter(evt.target.value)}
            ></input>
          </div>
          <ul className="popover-list">
            {shownColumns.map(({ hide, key, name }) => (
              <li className="column-option" key={key}>
                <Switch
                  color={'primary'}
                  size={'medium'}
                  checked={!hide}
                  onChange={() => dispatch(UserSettings.RecordSet.toggleRecordColumn(recordSetType, key))}
                />
                {name}
              </li>
            ))}
          </ul>
          <div className="popover-show-hide">
            <Button onClick={() => dispatch(UserSettings.RecordSet.toggleAllRecordColumns(recordSetType, true))}>
              Hide All
            </Button>
            <Button onClick={() => dispatch(UserSettings.RecordSet.toggleAllRecordColumns(recordSetType, false))}>
              Show All
            </Button>
          </div>
        </div>
      </Popover>
    </div>
  );
};

export default RecordTableColumnSelect;

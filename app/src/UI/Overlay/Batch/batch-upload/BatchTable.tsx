import React, { useEffect, useState } from 'react';
import { CopyToClipboardButton } from './ClipboardHelper';
import { Button } from '@mui/material';
import { UnfoldLess, UnfoldMore } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import { selectUserSettings } from 'state/reducers/userSettings';
import { useSelector } from 'utils/use_selector';

export const AbbreviatedDisplayWithCopy = (props: { displayVal: string; content?: string; length?: number }) => {
  const [truncate, setTruncate] = useState(true);

  const [renderedValue, setRenderedValue] = useState('');

  useEffect(() => {
    if (truncate) {
      setRenderedValue(props.displayVal.substring(0, props.length ? props.length : 12));
    } else {
      setRenderedValue(props.displayVal);
    }
  }, [truncate, props.displayVal]);

  return (
    <>
      <Button onClick={() => setTruncate(!truncate)}>
        <>{(truncate && <UnfoldMore />) || <UnfoldLess />}</>
      </Button>
      <CopyToClipboardButton content={props.content ? props.content : props.displayVal} />
      {renderedValue}
      {truncate ? '…' : ''}
    </>
  );
};

const BatchTableCell = ({ field, row }) => {
  const [hasMessages, setHasMessages] = useState(false);
  const [displaySeverity, setDisplaySeverity] = useState('normal');
  const [displayedValue, setDisplayedValue] = useState('');

  const LEVELS = ['informational', 'error', 'warning', 'unknown'];

  useEffect(() => {
    const v = row.data[field].parsedValue;
    if (v === null || v === undefined) {
      setDisplayedValue('');
      return;
    }
    const dt = row.data[field].templateColumn.dataType;

    switch (dt) {
      case 'boolean':
        setDisplayedValue(v ? 'True' : 'False');
        break;
      case 'codeReference':
        if (row.data[field]['friendlyValue'] !== undefined && row.data[field]['friendlyValue'] !== null) {
          setDisplayedValue(row.data[field]['friendlyValue']);
        } else {
          setDisplayedValue(row.data[field].inputValue);
        }
        break;
      case 'WKT':
        setDisplayedValue(`Geometry, ${v.area?.toLocaleString()}m²`);
        break;
      default:
        setDisplayedValue(v);
    }
  }, [row]);

  useEffect(() => {
    let highestSeveritySeen: number | null = null;
    if (!row.data[field]?.validationMessages) {
      return;
    }

    setHasMessages(row.data[field].validationMessages.length > 0);

    for (const message of row.data[field].validationMessages) {
      let level = LEVELS.indexOf(message.severity);
      if (level === -1) {
        level = LEVELS.length - 1;
      }
      if (highestSeveritySeen !== null) {
        highestSeveritySeen = Math.max(highestSeveritySeen, level);
      } else {
        highestSeveritySeen = level;
      }
    }

    if (highestSeveritySeen !== null) {
      setDisplaySeverity(LEVELS[highestSeveritySeen]);
    }
  }, [row.data[field].validationMessages]);

  const DataTypeDisplay = (templateColumn) => {
    let prefix = '';
    let suffix = '';
    const dt = `${templateColumn?.dataType}`;

    if (templateColumn?.dataType === 'numeric') {
      if (templateColumn.validations.minValue !== null) {
        prefix = `${templateColumn.validations.minValue} <=`;
      }
      if (templateColumn.validations.maxValue !== null) {
        suffix = `<= ${templateColumn.validations.maxValue}`;
      }
    }
    if (templateColumn?.dataType === 'text') {
      if (templateColumn.validations.minLength != null && templateColumn.validations.maxLength == null) {
        suffix = `min ${templateColumn.validations.minLength} chars`;
      }
      if (templateColumn.validations.minLength == null && templateColumn.validations.maxLength != null) {
        suffix = `max ${templateColumn.validations.maxLength} chars`;
      }
      if (templateColumn.validations.minLength != null && templateColumn.validations.maxLength != null) {
        suffix = `${templateColumn.validations.minLength} - ${templateColumn.validations.maxLength} chars`;
      }
    }
    return `${prefix} ${dt} ${suffix}`;
  };

  return (
    <td className={displaySeverity}>
      <span
        className={`value ${
          displayedValue === null || (typeof displayedValue === 'string' && displayedValue?.trim().length === 0)
            ? 'empty'
            : ''
        }`}
      >
        {row.data[field].templateColumn?.dataType === 'WKT' ? (
          <AbbreviatedDisplayWithCopy
            length={25}
            displayVal={displayedValue}
            content={JSON.stringify(row.data[field].parsedValue?.geojson) || ''}
          />
        ) : (
          displayedValue
        )}
      </span>
      <ul className={'messages'}>
        {hasMessages &&
          row.data[field]?.validationMessages.map((m) => (
            <li key={m.messageTitle}>
              <strong>{m.messageTitle}</strong>
              {m.messageDetail && <>{JSON.stringify(m.messageDetail, null, 2)}</>}
            </li>
          ))}
        <div className={'metadata'}>
          <span className={'spreadsheetColumn'}>{row.data[field].spreadsheetCellAddress}</span>
          <span className={'dataType'}>{DataTypeDisplay(row.data[field].templateColumn)}</span>
        </div>
      </ul>
    </td>
  );
};

const BatchTable = ({ jsonRepresentation, created_activities }) => {
  const { darkTheme } = useSelector(selectUserSettings);
  const history = useHistory();
  return (
    <>
      <table className={`batchAlternateLayout ${darkTheme ? 'batchDarkLayout' : ''}`}>
        <thead>
          <tr>
            <th>Field</th>
            {jsonRepresentation?.rows?.map((row) => (
              <th key={row.rowIndex}>
                Row&nbsp;{row.rowIndex}
                {created_activities[row.rowIndex - 1] && (
                  <>
                    <div>
                      <Button
                        key={created_activities[row.rowIndex - 1]?.id}
                        onClick={() => {
                          const url = '/Records/Activity:' + created_activities[row.rowIndex - 1].id + '/form';
                          history.push(url);
                        }}
                      >
                        {created_activities[row.rowIndex - 1]?.short_id}
                      </Button>
                    </div>
                    <div>{jsonRepresentation?.rows[row.rowIndex - 1]?.mappedObject.payload.form_data.form_status}</div>
                  </>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {jsonRepresentation?.headers?.map((h) => {
            return (
              <tr key={h}>
                <td className={'fieldName'}>{h}</td>
                <>{jsonRepresentation?.rows?.map((row) => <BatchTableCell key={row.rowIndex} field={h} row={row} />)}</>
              </tr>
            );
          })}
          <tr>
            <td>Mapped Object</td>
            {jsonRepresentation?.rows?.map((row) => (
              <td key={row.rowIndex}>
                <pre>
                  <AbbreviatedDisplayWithCopy displayVal={JSON.stringify(row.mappedObject, null, 2)} />
                </pre>
              </td>
            ))}
          </tr>
          <tr>
            <td>Object Mapper Warnings</td>
            {jsonRepresentation?.rows?.map((row) => (
              <td key={row.rowIndex}>
                <ul>
                  {row.mappedObjectMessages.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default BatchTable;

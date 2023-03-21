import React, { useEffect, useState } from 'react';
import '../../styles/batch.scss';

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
        try {
          setDisplayedValue(v.description);
        } catch (e) {
          setDisplayedValue(row.data[field].inputValue);
        }
        break;
      default:
        setDisplayedValue(v);
    }
  }, [row]);

  useEffect(() => {
    let highestSeveritySeen = null;
    if (!row.data[field]?.validationMessages) {
      return;
    }

    setHasMessages(row.data[field].validationMessages.length > 0);

    for (const message of row.data[field].validationMessages) {
      let level = LEVELS.indexOf(message.severity);
      if (level === -1) {
        level = LEVELS.length - 1;
      }
      highestSeveritySeen = Math.max(highestSeveritySeen, level);
    }

    setDisplaySeverity(LEVELS[highestSeveritySeen]);
  }, [row.data[field].validationMessages]);

  return (
    <td className={displaySeverity}>
      {displayedValue}
      <ul className={'messages'}>
        {hasMessages &&
          row.data[field]?.validationMessages.map((m) => (
            <li key={m.messageTitle}>
              <strong>{m.messageTitle}</strong>
              {m.messageDetail}
            </li>
          ))}
      </ul>
    </td>
  );
};

const BatchTable = ({ jsonRepresentation }) => {
  return (
    <>
      <table className={'batchAlternateLayout'}>
        <thead>
          <tr>
            <th>Field</th>
            {jsonRepresentation?.rows?.map((row) => (
              <th key={row.rowIndex}>Row&nbsp;{row.rowIndex}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {jsonRepresentation?.headers?.map((h) => {
            return (
              <tr key={h}>
                <td className={'fieldName'}>{h}</td>
                {jsonRepresentation?.rows?.map((row) => (
                  <BatchTableCell key={row.rowIndex} field={h} row={row} />
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export default BatchTable;

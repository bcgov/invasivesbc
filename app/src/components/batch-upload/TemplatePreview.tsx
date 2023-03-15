import {Paper} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {useInvasivesApi} from '../../hooks/useInvasivesApi';
import Spinner from '../spinner/Spinner';

import 'styles/batch.scss';
import {CodeTableReference} from './CodeTableReference';

const TemplatePreview = ({id}) => {
  const api = useInvasivesApi();
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState(null);

  useEffect(async () => {
    setLoading(true);

    const data = await api.downloadTemplate(id, 'json');
    setTemplate(data);
    setLoading(false);
  }, [id]);

  if (loading || template == null || !template.columns) {
    return <Spinner/>;
  }

  function renderAcceptableValues(col) {
    switch (col.dataType) {
      case 'text':
        return (<>Quote all text fields and escape literal quotation marks by doubling them.</>);
      case 'numeric':
        return (<>Use unquoted values with a decimal point separator . for non-integer values. Negatives
          prefixed with - accepted. Do not use commas or spaces to group digits.</>);
      case 'codeReference':
      case 'codeReferenceMulti':
        return codeValues(col);
      case 'tristate':
        return (<>
          Case insensitive
          <p>True values: <code>T, TRUE, Y, or YES</code></p>
          <p>False values: <code>F, FALSE, N, or NO</code></p>
          <p>Unkown values: <code>U, or UNKNOWN</code></p>
        </>);
      case 'boolean':
        return (<>
          Case insensitive
          <p>True values: <code>T, TRUE, Y, or YES</code></p>
          <p>False values: <code>F, FALSE, N, or NO</code></p>
        </>);
      case 'date':
        return (<>ISO 8601 Date Format: <code>YYYY-MM-DD</code></>);
      case 'datetime':
        return (<>ISO 8601 Format without timezone or seconds:<code>YYYY-MM-DDThh:mm</code></>);
      default:
        return null;
    }
  }

  function codeValues(col) {
    if (col.codes !== null && col.codes.length > 0) {
      return (
        <CodeTableReference column={col}/>
      );
    }
    return (<strong>CODE VALUES MISSING</strong>);
  }

  return (
    <table className={'template-preview'}>
      <thead>
      <tr>
        <th>Column</th>
        <th>Date Type</th>
        <th>Required?</th>
        <th>Acceptable Values</th>
      </tr>
      </thead>
      <tbody>
      {template.columns.map((c) => (
        <tr key={`template-${c.name}`}>
          <td>{c.name}</td>
          <td>
            {c.dataType}
          </td>
          <td>{c.required ? 'Yes' : ''}</td>
          <td>{renderAcceptableValues(c)}</td>
        </tr>
      ))}
      </tbody>
    </table>
  );
};

export default TemplatePreview;

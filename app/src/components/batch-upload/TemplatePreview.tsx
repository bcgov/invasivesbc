import {Paper} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {useInvasivesApi} from '../../hooks/useInvasivesApi';
import Spinner from "../spinner/Spinner";

import 'styles/batch.scss';

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
    return <Spinner/>
  }

  return (
    <table className={'template-preview'}>
      <thead>
      <tr>
        <th>Column</th>
        <th>Date Type</th>
        <th>Required?</th>
      </tr>
      </thead>
      <tbody>
      {template.columns.map((c) => (
        <tr key={`template-${c.name}`}>
          <td>{c.name}</td>
          <td>{c.dataType}</td>
          <td>{c.required ? "Yes" : ""}</td>
        </tr>
      ))}
      </tbody>
    </table>
  );
};

export default TemplatePreview;

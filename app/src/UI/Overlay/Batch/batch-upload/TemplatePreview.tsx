import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { CodeTableReference } from './CodeTableReference';
import { useDispatch } from 'react-redux';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Download } from '@mui/icons-material';
import { selectUserSettings } from 'state/reducers/userSettings';
import { useSelector } from 'utils/use_selector';
import { selectBatch } from 'state/reducers/batch';
import { BATCH_TEMPLATE_DOWNLOAD_CSV_REQUEST, BATCH_TEMPLATE_DOWNLOAD_REQUEST } from 'state/actions';
import Spinner from 'UI/Spinner/Spinner';

const TemplatePreview = ({ name, id }) => {
  const dispatch = useDispatch();
  const { templateDetail } = useSelector(selectBatch);
  const { darkTheme } = useSelector(selectUserSettings);

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (expanded && !detail) {
      dispatch({
        type: BATCH_TEMPLATE_DOWNLOAD_REQUEST,
        payload: {
          key: id
        }
      });
    }
  }, [id, expanded]);

  useEffect(() => {
    if (templateDetail && templateDetail[id]) {
      setDetail(templateDetail[id].data);
      setLoading(templateDetail[id].working);
    } else {
      setDetail(null);
      setLoading(true);
    }
  }, [templateDetail]);

  const downloadTemplate = (key: string) => {
    new Promise((resolve, reject) => {
      dispatch({
        type: BATCH_TEMPLATE_DOWNLOAD_CSV_REQUEST,
        payload: {
          key: id,
          resolve
        }
      });
    }).then((data) => {
      const dataUrl = `data:text/csv;base64,${btoa(data as string)}`;
      const downloadLink = document.createElement('a');
      downloadLink.setAttribute('href', dataUrl);
      downloadLink.setAttribute('download', `InvasivesBC ${key} template.csv`);
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    });
  };

  function renderAcceptableValues(col) {
    switch (col.dataType) {
      case 'text':
        return (
          <>
            Valid text value - if using excel special characters (like quotes or commas) that can affect the CSV output
            are handled automatically - so just put text in the field. If not using Excel, these are valid values:
            value, "quoted value", "value containing ""escaped"" quotes"
          </>
        );
      case 'numeric':
        return (
          <>
            Use unquoted values with a decimal point separator . for non-integer values. Negatives prefixed with -
            accepted. Do not use commas or spaces to group digits.
          </>
        );
      case 'codeReference':
      case 'codeReferenceMulti':
        return codeValues(col);
      case 'tristate':
        return (
          <>
            Case insensitive
            <p>
              True values: <code>T, TRUE, Y, or YES</code>
            </p>
            <p>
              False values: <code>F, FALSE, N, or NO</code>
            </p>
            <p>
              Unknown values: <code>U, or UNKNOWN</code>
            </p>
          </>
        );
      case 'boolean':
        return (
          <>
            Case insensitive
            <p>
              True values: <code>T, TRUE, Y, or YES</code>
            </p>
            <p>
              False values: <code>F, FALSE, N, or NO</code>
            </p>
          </>
        );
      case 'date':
        return (
          <>
            ISO 8601 Date Format: <code>YYYY-MM-DD</code>
          </>
        );
      case 'datetime':
        return (
          <>
            ISO 8601 Format without timezone or seconds:<code>YYYY-MM-DDThh:mm</code>
          </>
        );
      default:
        return null;
    }
  }

  function codeValues(col) {
    if (col.codes !== null && col.codes.length > 0) {
      return <CodeTableReference column={col} />;
    }
    return <strong>CODE VALUES MISSING</strong>;
  }

  function renderDetails() {
    if (loading) {
      return <Spinner />;
    }
    return (
      <div className="template-description">
        <table className={`template-preview ${darkTheme ? 'template-dark-preview' : ''}`}>
          <thead>
            <tr>
              <th>Column</th>
              <th>Data Type</th>
              <th>Required?</th>
              <th>Acceptable Values</th>
            </tr>
          </thead>
          <tbody>
            {detail.columns.map((c) => (
              <tr key={`template-${c.name}`}>
                <td>{c.name}</td>
                <td>{c.dataType}</td>
                <td>{c.required ? 'Yes' : ''}</td>
                <td>{renderAcceptableValues(c)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      <Accordion
        sx={{ marginBottom: '0.5rem' }}
        expanded={expanded}
        onChange={() => {
          setExpanded(!expanded);
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'inline-flex', justifyContent: 'space-between', width: '100%' }}>
            <Typography>{name}</Typography>
            <Button
              variant={'contained'}
              className={'template-download-link'}
              onClick={() => {
                downloadTemplate(id);
              }}
            >
              Download Template CSV
              <Download fontSize={'medium'} />
            </Button>
          </Box>
        </AccordionSummary>
        <AccordionDetails>{renderDetails()}</AccordionDetails>
      </Accordion>
    </>
  );
};

export default TemplatePreview;

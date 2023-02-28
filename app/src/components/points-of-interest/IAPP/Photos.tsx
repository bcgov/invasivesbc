import { Accordion, AccordionSummary, Paper } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useInvasivesApi } from "../../../hooks/useInvasivesApi";
import Spinner from "../../spinner/Spinner";
import '../../../styles/iapp.scss';

export const Photos = ({ media }) => {
  const [expanded, setExpanded] = React.useState(true);
  const [mediaURLs, setMediaURLs] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const api = useInvasivesApi();

  useEffect(() => {
    setMediaURLs([]);
    setLoading(true);
    setError(false);

    const mediaKeysArray = media.map(m => m.media_key);

    api.getMedia(mediaKeysArray).then((result) => {
      setMediaURLs(result);
      setLoading(false);
    }).catch(e => {
      setLoading(false);
      setError(true);
      setMediaURLs([]);
    });
  }, [media]);

  function renderContent() {
    if (loading) {
      return (<Spinner />);
    }
    if (error) {
      return <span>Error loading images</span>;
    }
    if (media.length === 0) {
      return <span>This record has no photos associated with it.</span>;
    }
    return mediaURLs.map((m) => {
      const mediaData = media.find(x => x.media_key === m.media_key);
      if (!mediaData) {
        // shouldn't happen
        return null;
      }

      return (
        <div className={'iapp-photo'} key={m.media_key}>
          <img src={m.encoded_file} />
          <dl>
            <dt>Comments</dt>
            <dd>{mediaData.comments}</dd>

            <dt>Image Date</dt>
            <dd>{mediaData.image_date}</dd>

            <dt>Perspective Code</dt>
            <dd>{mediaData.perspective_code || 'None'}</dd>

            <dt>Reference Number</dt>
            <dd>{mediaData.reference_no}</dd>
          </dl>
        </div>);
    });
  }

  return (
    <Accordion expanded={expanded} style={{ marginTop: 15, alignItems: 'center' }}>
      <AccordionSummary
        onClick={() => setExpanded(!expanded)}
        style={{ fontSize: '1.125rem', marginLeft: 10, marginRight: 10 }}>
        Media
      </AccordionSummary>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <div className={'iapp-photo-container'}>
          {renderContent()}
        </div>
      </Paper>
    </Accordion>
  );
};

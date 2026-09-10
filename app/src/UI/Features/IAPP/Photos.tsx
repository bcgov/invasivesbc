import React, { useEffect, useState } from 'react';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import Spinner from 'UI/Reusable/Spinner/Spinner';
import './Photos.css';

type MediaDescriptor = {
  media_key: string;
  encoded_file: string;
  treatment_id: string | null;
  comments: string;
  image_date: string;
  reference_no: string;
  perspective_code?: string;
};

export const Photos: React.FC<{ media: MediaDescriptor[] }> = ({ media }) => {
  const [mediaURLs, setMediaURLs] = useState<MediaDescriptor[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const api = useInvasivesApi();

  useEffect(() => {
    setMediaURLs([]);
    setLoading(true);
    setError(false);

    const mediaKeysArray = media.map((m) => m.media_key);
    if (mediaKeysArray.length > 0) {
      api
        .getMedia(mediaKeysArray)
        .then((result) => {
          setMediaURLs(result);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          setError(true);
          setMediaURLs([]);
        });
    } else {
      setLoading(false);
    }
  }, [media]);

  const MISSING_CONTENT = 'Not Provided.';
  function renderContent() {
    if (loading) {
      return <Spinner />;
    } else if (error) {
      return <span>Error loading images</span>;
    } else if (media.length === 0) {
      return <span>This record has no photos associated with it.</span>;
    }
    return mediaURLs?.map((m) => {
      const mediaData = media.find((x) => x.media_key === m.media_key);
      if (!mediaData) {
        // shouldn't happen
        return null;
      }

      return (
        <div className={'iapp-photo'} key={m.media_key}>
          <img alt="IAPP Photo" src={m.encoded_file} />
          <dl className="image-details">
            <div>
              <dt>Comments</dt>
              <dd>{mediaData.comments ?? MISSING_CONTENT}</dd>
            </div>
            <div>
              <dt>Image Date</dt>
              <dd>{mediaData.image_date ?? MISSING_CONTENT}</dd>
            </div>
            <div>
              <dt>Perspective Code</dt>
              <dd>{mediaData.perspective_code ?? MISSING_CONTENT}</dd>
            </div>
            <div>
              <dt>Reference Number</dt>
              <dd>{mediaData.reference_no ?? MISSING_CONTENT}</dd>
            </div>

            {mediaData.treatment_id !== null && (
              <div>
                <dt>Treatment ID</dt>
                <dd>{mediaData.treatment_id ?? MISSING_CONTENT}</dd>
              </div>
            )}
          </dl>
        </div>
      );
    });
  }

  return (
    <div className="main-photo-cont">
      <div className={'iapp-photo-container'}>
        <h2>Media</h2>
        {renderContent()}
      </div>
    </div>
  );
};

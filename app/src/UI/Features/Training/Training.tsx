import { Box, Container, Grid, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSelector } from 'utils/use_selector';
import Spinner from 'UI/Reusable/Spinner/Spinner';
import 'UI/Features/Training/training.scss';

interface ITrainingVideoMetadata {
  id: number;
  src: string;
  title: string;
}
const TrainingPage = () => {
  const api_base = useSelector((state) => state.Configuration.current.runtime.API_BASE);
  const [videos, setVideos] = useState<Array<ITrainingVideoMetadata>>();
  useEffect(() => {
    (async () => {
      await fetch(`${api_base}/api/training_videos`)
        .then(async (res) => {
          console.log(res);
          const data = await res.json();
          setVideos(data.result);
        })
        .catch((e) => {
          console.error('[Training] Error occured in fetch: ', e);
        });
    })();
  }, []);
  if (!videos) {
    return <Spinner />;
  }

  return (
    <Container className={`training`} maxWidth={false}>
      <Box style={{ paddingTop: '30px', paddingBottom: '10px', display: 'flex', justifyContent: 'center' }}>
        <Typography variant="h4" align="center">
          Training Videos
        </Typography>
      </Box>
      <Grid container spacing={4}>
        {videos.length === 0 && (
          <Grid item>
            <span>No videos are available at this time.</span>
          </Grid>
        )}
        {videos.map((v) => (
          <Grid key={v.id} item xs={12} lg={6}>
            <div className={'trainingVideo'}>
              <label>{v.title}</label>
              <video width={568} height={320} controls preload="metadata">
                <source src={v.src} type={'video/mp4'} />
              </video>
            </div>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default TrainingPage;

import { Box, Container, Grid, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { selectUserSettings } from 'state/reducers/userSettings';
import { useSelector } from 'util/use_selector';
import { selectTrainingVideos } from 'state/reducers/training_videos';
import Spinner from 'UI/Spinner/Spinner';
import { TRAINING_VIDEOS_LIST_REQUEST } from 'state/actions';
import "UI/Styles/training.scss";

export const TrainingPage = () => {
  const { list: videos, working } = useSelector(selectTrainingVideos);
  const { darkTheme } = useSelector(selectUserSettings);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({ type: TRAINING_VIDEOS_LIST_REQUEST });
  }, []);

  if (working) {
    return <Spinner />;
  }

  return (
    <Container className={`training ${darkTheme ? 'trainingDark' : ''}`} maxWidth={false}>
      <Box style={{ paddingTop: '30px', paddingBottom: '10px', display: 'flex', justifyContent: 'center' }}>
        <Typography variant="h4" align="center">
          Training Videos
        </Typography>
      </Box>
      <Grid container spacing={4}>
        {videos.length === 0 && (<Grid item><span>No videos are available at this time.</span></Grid>)}
        {videos.map((v) => (
          <Grid key={v.id} item xs={12} lg={6}>
            <div className={'trainingVideo'}>
              <label>{v.title}</label>
              <video width={568} height={320} controls preload={'none'}>
                <source src={v.src} type={'video/mp4'} />
              </video>
            </div>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

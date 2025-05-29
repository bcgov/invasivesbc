import { Box, Grid, IconButton, LinearProgress, Typography } from '@mui/material';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';

interface ProgressControlPanelProps {
  isPaused: boolean;
  downloadProgress: { normalizedProgress: number; message: string };
  handlePauseResume: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleCancel: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const ProgressControlPanel: React.FC<ProgressControlPanelProps> = ({
  isPaused,
  downloadProgress,
  handlePauseResume,
  handleCancel
}) => {
  return (
    <Box
      sx={{
        border: '1px solid #1976d2',
        borderRadius: '8px',
        padding: '10px',
        minWidth: '230px'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={2}>
          <IconButton
            onClick={handlePauseResume}
            color="primary"
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              padding: '0px'
            }}
          >
            {isPaused ? <PlayCircleIcon /> : <PauseCircleIcon />}
          </IconButton>
        </Grid>
        <Grid item xs={8}>
          <LinearProgress variant="determinate" value={downloadProgress.normalizedProgress * 100} />
        </Grid>
        <Grid item xs={2}>
          <IconButton
            color="error"
            onClick={handleCancel}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              padding: '0px'
            }}
          >
            <CloseIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Grid>
        <Typography variant="caption">{downloadProgress.message}</Typography>
      </Grid>
    </Box>
  );
};

export default ProgressControlPanel;

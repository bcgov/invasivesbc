import React from 'react';
import { Box, Grid, IconButton, LinearProgress } from '@mui/material';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import CloseIcon from '@mui/icons-material/Close';

interface ProgressControlPanelProps {
  isPaused: boolean;
  downloadProgress: { normalizedProgress: number };
  handlePausePlayClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const ProgressControlPanel: React.FC<ProgressControlPanelProps> = ({
  isPaused,
  downloadProgress,
  handlePausePlayClick,
  handleClick
}) => {
  return (
    <Box
      sx={{
        border: '1px solid #1976d2',
        borderRadius: '8px',
        padding: 2
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={2}>
          <IconButton
            onClick={handlePausePlayClick}
            color="primary"
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%'
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
            onClick={handleClick}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%'
            }}
          >
            <CloseIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProgressControlPanel;

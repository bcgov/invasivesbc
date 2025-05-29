import { Typography } from '@mui/material';

const ErrorListTemplate = (err: { errors?: unknown[] }) => (
  <>
    {(err.errors?.length ?? 0) > 0 && (
      <div>
        <Typography color="error" sx={{ mt: 8, mb: 4 }}>
          Red text indicates mandatory entry in order to go from a status of Draft to Submitted. You can however save in
          progress work, and come back later.
        </Typography>
      </div>
    )}
  </>
);

export default ErrorListTemplate;

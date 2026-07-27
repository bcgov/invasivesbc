import { DeleteForever } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardMedia,
  FormControl,
  Grid,
  IconButton,
  TextField,
  Typography
} from '@mui/material';
import UploadedPhoto from 'interfaces/UploadedPhoto';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import Activity from 'state/actions/activity/Activity';
import { useDispatch } from 'utils/use_selector';

type PropTypes = {
  photo: UploadedPhoto;
  isDisabled?: boolean;
};
const Photo = ({ photo, isDisabled }: PropTypes) => {
  const handleDelete = () => dispatch(Activity.Photo.delete(photo));
  const handleEditDescription = () => {
    dispatch(Activity.Photo.edit({ ...photo, description }));
    setIsEditing(false);
  };

  const dispatch = useDispatch();
  const [description, setDescription] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  return (
    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
      <Card>
        <CardMedia src={photo.encoded_file} component="img" />
        <Typography style={{ marginTop: '15px' }} textAlign={'center'} variant="h5">
          {photo.description}
        </Typography>
        {!isDisabled && (
          <CardActions style={{ width: '100%', display: 'flex', justifyContent: 'space-around' }}>
            <IconButton onClick={handleDelete}>
              <DeleteForever color="error" />
            </IconButton>
            <IconButton disabled={isDisabled} onClick={() => setIsEditing((prev) => !prev)}>
              <EditIcon color={isEditing ? 'primary' : 'inherit'} />
            </IconButton>
          </CardActions>
        )}
        {isEditing && (
          <FormControl>
            <Box mb={2}>
              <TextField
                label="Change Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Button onClick={handleEditDescription} disabled={description === photo.description}>
                Save
              </Button>
            </Box>
          </FormControl>
        )}
      </Card>
    </Grid>
  );
};

export default Photo;

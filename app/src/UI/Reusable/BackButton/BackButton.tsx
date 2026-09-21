import { ArrowBackIos } from '@mui/icons-material';
import { Button } from '@mui/material';
import { To, useNavigate } from 'react-router';

interface PropTypes {
  destination?: To | number;
}

const BackButton = ({ destination = -1 }: PropTypes) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (typeof destination === 'number') {
      navigate(destination);
    } else {
      navigate(destination);
    }
  };

  return (
    <Button color="primary" onClick={handleBack} variant="contained">
      <ArrowBackIos /> Back{' '}
    </Button>
  );
};

export default BackButton;

import { ArrowBackIos } from '@mui/icons-material';
import { To, useNavigate } from 'react-router';
import Button, { InputButtonProps } from 'UI/Reusable/Button/Button';

interface PropTypes extends InputButtonProps {
  destination?: To;
}

const BackButton = ({ destination = -1 as To, ...props }: PropTypes) => {
  const navigate = useNavigate();
  const handleBack = () => navigate(destination);

  return (
    <Button color="primary" onClick={handleBack} variant="contained" {...props}>
      <ArrowBackIos /> Back
    </Button>
  );
};

export default BackButton;

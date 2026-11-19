import { useState } from 'react';
import StyledModal from '../StyledModal/StyledModal';
import { WebOnly } from '../Predicates/WebOnly';
import { createSafeLink } from 'utils/createSafeLink';
import { BrokenImage } from '@mui/icons-material';
import './image.css';
import CancelIcon from '@mui/icons-material/Cancel';
import IconButton from '@mui/material/IconButton';
import UploadedPhoto from 'interfaces/UploadedPhoto';

type Props = {
  photo: UploadedPhoto;
  remove?: () => void;
  height?: number;
  width?: number;
};

/**
 * @desc Generic component for displaying an image with click to view and optional delete button
 */
const Image = ({ photo, remove, height = 100, width = 100 }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleClose = () => setIsModalOpen(false);
  const handleOpen = () => setIsModalOpen(true);

  return (
    <div className="photo-card">
      <StyledModal variant="primary" open={isModalOpen} onClose={handleClose}>
        <div className="header">{photo.description}</div>
        <div className="content">
          <img src={photo.encoded_file} alt={photo.description} />
        </div>
        <div className="control">
          <WebOnly>
            <a href={createSafeLink(photo.encoded_file)} target="_blank">
              View in High Res
            </a>
          </WebOnly>
          <input type="button" className="close-button" onClick={handleClose} value="×" />
        </div>
      </StyledModal>
      {photo?.encoded_file ? (
        <img height={height} width={width} src={photo.encoded_file} onClick={handleOpen} alt={photo.description} />
      ) : (
        <div className="missing-image">
          <BrokenImage />
          Image not found
        </div>
      )}
      {remove && (
        <IconButton className="delete-button" onClick={remove}>
          <CancelIcon />
        </IconButton>
      )}
    </div>
  );
};

export default Image;

import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { FormSchema } from '../interfaces';
import StyledModal from 'UI/Reusable/StyledModal/StyledModal';
import { WebOnly } from 'UI/Reusable/Predicates/WebOnly';

const Photo = ({ photo, index, remove }) => {
  const handleClose = () => setIsModalOpen(false);
  const handleOpen = () => setIsModalOpen(true);

  const {
    control,
    formState: { disabled }
  } = useFormContext<FormSchema>();
  const { update } = useFieldArray<FormSchema>({ control, name: 'media' });

  const [newPhotoDesc, setNewPhotoDesc] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  /**
   * @desc Apply Photo Description changes to form, remove text input from view and reset the state.
   */
  const changeDescription = () => {
    if (!newPhotoDesc) return;
    update(index, {
      ...photo,
      description: newPhotoDesc
    });
    setIsEditing(false);
    setNewPhotoDesc('');
  };

  /**
   * Converts a dynamic Base64 string into a safe, temporary Blob URL.
   * Primarily intended as a safe guard from SVG images.
   * @param {string} dataUri - The full string (e.g., "data:image/svg+xml;base64,...")
   */
  const createSafeLink = (dataUri) => {
    try {
      const [header, base64] = dataUri.split(',');
      const mime = header.match(/:(.*?);/)[1];

      const binaryStr = atob(base64);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);

      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mime });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error('Invalid dynamic image format', e);
      return '#';
    }
  };

  return (
    <div className="photo-card">
      <StyledModal variant="primary" open={isModalOpen} onClose={handleClose}>
        <div className="header">{photo.description}</div>
        <div className="content">
          <img src={photo.encoded_file} />
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
      <div className="photo">
        <img src={photo.encoded_file} onClick={handleOpen} />
      </div>
      <div className="description">
        <p>{photo.description}</p>
      </div>
      {isEditing && (
        <div className="edit-control">
          <input
            type="text"
            placeholder="Change Description"
            value={newPhotoDesc}
            onChange={(e) => setNewPhotoDesc(e.target.value)}
            onKeyDown={(e) => {
              if (e.code === 'Enter' && !disabled) {
                e.preventDefault(); // Prevent Enter from triggering a form submission
                changeDescription();
              }
            }}
          />
          <input
            type="button"
            className="control-button"
            disabled={!newPhotoDesc}
            onClick={changeDescription}
            value="Save"
          />
        </div>
      )}
      <div className="photo-control">
        <input type="button" className="control-button" disabled={disabled} onClick={remove} value="Delete" />
        <input
          type="button"
          className="control-button"
          disabled={disabled}
          onClick={() => setIsEditing((prev) => !prev)}
          value="Edit"
        />
      </div>
    </div>
  );
};

export default Photo;

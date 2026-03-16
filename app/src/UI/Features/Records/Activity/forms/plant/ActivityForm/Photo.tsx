import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { FormSchema } from '../interfaces';

const Photo = ({ photo, index, remove }) => {
  const {
    control,
    formState: { disabled }
  } = useFormContext<FormSchema>();
  const { update } = useFieldArray<FormSchema>({ control, name: 'media' });

  const [newPhotoDesc, setNewPhotoDesc] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  /**
   * @desc Apply Photo Description changes to form, remove text input from view and reset the state.
   */
  const changeDescription = () => {
    update(index, {
      ...photo,
      description: newPhotoDesc
    });
    setIsEditing(false);
    setNewPhotoDesc('');
  };

  return (
    <div className="photo-card">
      <div className="photo">
        <img src={photo.encoded_file} />
      </div>
      <div className="description">
        <caption>{photo.description}</caption>
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
                e.preventDefault();
                changeDescription();
              }
            }}
          />
          <input type="button" onClick={changeDescription} value="Save" />
        </div>
      )}
      <div className="photo-control">
        <input type="button" disabled={disabled} onClick={remove} value="Delete" />
        <input type="button" disabled={disabled} onClick={() => setIsEditing((prev) => !prev)} value="Edit" />
      </div>
    </div>
  );
};

export default Photo;

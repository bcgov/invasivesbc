import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Modal,
  TextField,
  Typography
} from '@mui/material';
import './UserInputModals.css';
import { useEffect, useState } from 'react';
import { ManualUtmModalInterface, ReduxPayload, UtmInputObj } from 'interfaces/prompt-interfaces';
import { closeModal } from 'utils/userPrompts';
import { useDispatch } from 'react-redux';
import { UnknownAction } from 'redux';
import { calc_lat_long_from_utm } from 'utils/utm';

const ManualUtmModal = ({
  callback,
  disableCancel,
  prompt,
  title,
  id,
  confirmText,
  cancelText
}: ManualUtmModalInterface) => {
  const [zone, setUserZone] = useState<number>();
  const [easting, setUserEasting] = useState<number>();
  const [northing, setUserNorthing] = useState<number>();
  const [results, setResults] = useState<number[]>([]);

  const dispatch = useDispatch();
  const handleRedux = (redux: ReduxPayload[]) => {
    for (const action of redux) {
      dispatch(action as UnknownAction);
    }
  };
  const handleConfirmation = () => {
    handleRedux(callback(buildResponse()) ?? []);
    handleClose();
  };
  const buildResponse = (): UtmInputObj => ({
    zone: zone!,
    easting: easting!,
    northing: northing!,
    results: results
  });
  /**
   * Calculate lat long from UTM.
   */
  useEffect(() => {
    if (zone !== undefined && easting !== undefined && northing !== undefined) {
      setResults(calc_lat_long_from_utm(zone, easting, northing) ?? []);
    }
  }, [zone, easting, northing]);

  /**
   * @desc change handler for all inputs
   */
  const handleChange = (value: string, setter: (input: number) => void) => {
    const result = parseFloat(value);
    if (!isNaN(result)) {
      setter(result);
    }
  };

  const handleClose = () => {
    dispatch(closeModal(id!));
  };

  return (
    <Modal open aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
      <Box id="confirmationModal">
        <DialogTitle className="modalTitle">{title}</DialogTitle>
        <Divider />
        <DialogContent>
          {Array.isArray(prompt) ? (
            prompt.map((item) => <Typography key={item}>{item}</Typography>)
          ) : (
            <Typography>{prompt}</Typography>
          )}
        </DialogContent>
        <FormControl className="inputCont">
          <TextField
            aria-label="Zone"
            inputProps={{ type: 'number' }}
            label="Zone"
            onChange={(evt) => handleChange(evt.currentTarget.value, setUserZone)}
            value={zone ?? ''}
          />
          <TextField
            sx={{ margin: '10pt 0' }}
            aria-label="Easting"
            inputProps={{ type: 'number' }}
            label="Easting"
            onChange={(evt) => handleChange(evt.currentTarget.value, setUserEasting)}
            value={easting ?? ''}
          />
          <TextField
            aria-label="Northing"
            inputProps={{ type: 'number' }}
            label="Northing"
            onChange={(evt) => handleChange(evt.currentTarget.value, setUserNorthing)}
            value={northing ?? ''}
          />
        </FormControl>
        <Divider />
        <DialogActions>
          {!disableCancel && <Button onClick={handleClose}>{cancelText ?? 'Cancel'}</Button>}
          <Button onClick={handleConfirmation} disabled={results.length === 0}>
            {confirmText ?? 'Confirm'}
          </Button>
        </DialogActions>
      </Box>
    </Modal>
  );
};

export default ManualUtmModal;

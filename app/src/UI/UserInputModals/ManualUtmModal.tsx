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
import { useDispatch } from 'react-redux';
import { UnknownAction } from 'redux';
import { calc_lat_long_from_utm } from 'utils/utm';
import Prompt from 'state/actions/prompts/Prompt';

const ManualUtmModal = ({
  callback,
  disableCancel,
  prompt,
  title,
  id,
  confirmText,
  cancelText
}: ManualUtmModalInterface) => {
  const [zone, setUserZone] = useState<string>();
  const [easting, setUserEasting] = useState<string>();
  const [northing, setUserNorthing] = useState<string>();
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
    zone: parseFloat(zone!),
    easting: parseFloat(easting!),
    northing: parseFloat(northing!),
    results: results
  });
  /**
   * Calculate lat long from UTM.
   */
  useEffect(() => {
    try {
      if (zone !== undefined && easting !== undefined && northing !== undefined) {
        setResults(calc_lat_long_from_utm(parseFloat(zone), parseFloat(easting), parseFloat(northing)) ?? []);
      } else {
        setResults([]);
      }
    } catch (ex) {
      console.error(ex);
      setResults([]);
    }
  }, [zone, easting, northing]);

  /**
   * @desc change handler for all inputs
   */
  const handleChange = (value: string, setter: (input: string | undefined) => void) => {
    const regex = /^[+-]?\d*(?:[.,]\d*)?$/;
    if (!value) {
      setter(undefined);
    } else if (regex.test(value)) {
      setter(value);
    }
  };

  const handleClose = () => {
    dispatch(Prompt.closeOne(id!));
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
            label="Zone"
            onChange={(evt) => handleChange(evt.currentTarget.value, setUserZone)}
            value={zone ?? ''}
          />
          <TextField
            sx={{ margin: '10pt 0' }}
            aria-label="Easting"
            label="Easting"
            onChange={(evt) => handleChange(evt.currentTarget.value, setUserEasting)}
            value={easting ?? ''}
          />
          <TextField
            aria-label="Northing"
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

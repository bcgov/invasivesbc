import { Button } from "@mui/material";
import React from "react";
import GridOnIcon from '@mui/icons-material/GridOn';
import { useDispatch } from "react-redux";
import { RECORD_SET_TO_EXCEL_REQUEST } from "state/actions";

const ExcelExporter = (props) => {
  const dispatch = useDispatch();

  return (
    <Button onClick={() => dispatch({
      type: RECORD_SET_TO_EXCEL_REQUEST,
      payload: {
        id: props.setName
      }
    })} sx={{ mr: 1, ml: 'auto' }} size={'small'} variant="contained">
      <GridOnIcon></GridOnIcon>
    </Button>
  );
};

export default ExcelExporter;
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { Box, IconButton, TextField } from "@mui/material";
import { GridToolbarColumnsButton, GridToolbarExport, GridToolbarFilterButton } from "@mui/x-data-grid";
import { bcBlue } from "constants/colors";

interface Props {
  clearSearch: () => void;
  onChange: () => void;
  value: string;
}

const QuickSearchToolbar = ({ clearSearch, onChange, value }: Props) => {
  return (
    <Box
      sx={{
        p: 2,
        pb: 1,
        justifyContent: 'space-between',
        display: 'flex',
        alignItems: 'flex-start',
        flexWrap: 'wrap'
      }}
    >
      <Box>
        <GridToolbarColumnsButton style={{ color: bcBlue }} onResize={undefined} onResizeCapture={undefined} />
        <GridToolbarFilterButton style={{ color: bcBlue }} onResize={undefined} onResizeCapture={undefined} />
        <GridToolbarExport
          style={{ color: bcBlue }}
          csvOptions={{
            includeHeaders: true,
            allColumns: true,
            fileName: 'InvasivesBC - Application Users (' + new Date().toISOString() + ')'
          }}
        />
      </Box>
      <TextField
        variant="standard"
        value={value}
        onChange={onChange}
        placeholder="Search…"
        InputProps={{
          startAdornment: <SearchIcon fontSize="small" />,
          endAdornment: (
            <IconButton
              title="Clear"
              aria-label="Clear"
              size="small"
              style={{ visibility: value ? 'visible' : 'hidden' }}
              onClick={clearSearch}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          )
        }}
        sx={{
          width: {
            xs: 1,
            sm: 'auto'
          },
          m: (theme) => theme.spacing(1, 0.5, 1.5),
          '& .MuiSvgIconRoot': {
            mr: 0.5
          },
          '& .MuiInputUnderline:before': {
            borderBottom: 1,
            borderColor: 'divider'
          }
        }}
      />
    </Box>
  );
}

export default QuickSearchToolbar;

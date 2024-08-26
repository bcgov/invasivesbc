import { Table, TableBody, TableCell, TableRow } from '@mui/material';
import { useSelector } from 'utils/use_selector';

export const RenderTablePosition = ({ rows }) => {
  const whatsHere = useSelector((state) => state.Map?.whatsHere);
  return (
    <>
      {whatsHere?.section === 'position' ? (
        <Table>
          <TableBody>
            {rows &&
              rows?.map((row) => (
                <TableRow key={row.name}>
                  <TableCell component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell align="right">{row.value}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      ) : (
        <></>
      )}
    </>
  );
};

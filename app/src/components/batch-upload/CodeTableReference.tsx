import React, {useEffect, useState} from 'react';
import {Button} from "@mui/material";

const CodeTableReference = ({column}) => {
  const THRESHOLD = 10;

  const [shown, setShown] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [showButton, setShowButton] = useState(true);

  const [filterString, setFilterString] = useState('');
  const [filteredCodes, setFilteredCodes] = useState([]);

  useEffect(() => {
    setFilterString('');
    setFilteredCodes(column.codes);
  }, [column]);

  useEffect(() => {
    if (filterString.trim().length === 0) {
      setFilteredCodes(column.codes);
    } else {
      setFilteredCodes(column.codes.filter(c => {
        return c.code.toLowerCase().includes(filterString.toLowerCase()) || c.description.toLowerCase().includes(filterString.toLowerCase())
      }));
    }
  }, [filterString]);

  useEffect(() => {
    setShown(expanded ? filteredCodes.length : Math.min(THRESHOLD, filteredCodes.length));
    setShowButton( filteredCodes.length > THRESHOLD);
  }, [filteredCodes, expanded]);

  return (
    <>
      <input value={filterString} placeholder={'Type to filter...'} onChange={(e) => setFilterString(e.target.value)}/>
      <table className={'code-reference'}>
        <thead>
        <tr>
          <th>Description</th>
          <th>Code</th>
        </tr>
        </thead>
        <tbody>
        {
          filteredCodes.slice(0, shown).map((c, index) => (
            <React.Fragment key={c.code}>
              <tr>
                <td>{c.description}</td>
                <td>{c.code}</td>
              </tr>
            </React.Fragment>
          ))
        }
        </tbody>
      </table>
      Showing {shown} of {filteredCodes.length}.
      {(filteredCodes.length !== column.codes.length) && (<>&nbsp;(filtered from {column.codes.length})</>)}

      {showButton && (<Button variant='contained' onClick={() => setExpanded(!expanded)}>{expanded ? 'Fewer' : 'All'}</Button>)}
    </>
  );

}
export {CodeTableReference};

import { PropsWithChildren } from 'react';
import './styledTable.css';

const StyledTable = ({ children }: PropsWithChildren) => {
  return (
    <div className="table-wrapper">
      <table className="table-inner">{children}</table>
    </div>
  );
};
export default StyledTable;

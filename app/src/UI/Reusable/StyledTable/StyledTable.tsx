import { ComponentPropsWithoutRef, ComponentPropsWithRef } from 'react';
import './styledTable.css';

const StyledTable = ({ children, ...props }: ComponentPropsWithoutRef<'table'> | ComponentPropsWithRef<'table'>) => {
  return (
    <div className="table-wrapper">
      <table className="table-inner" {...props}>
        {children}
      </table>
    </div>
  );
};
export default StyledTable;

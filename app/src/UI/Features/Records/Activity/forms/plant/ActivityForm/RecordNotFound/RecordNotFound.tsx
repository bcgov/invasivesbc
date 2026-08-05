import { NavLink, useParams } from 'react-router';
import './recordNotFound.css';

const RecordNotFound = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div id="record-not-found">
      <div className="content">
        <p>Sorry, we can't find a record with that ID.</p>
        <p>
          ID: <span>{id}</span>
        </p>
        <NavLink to="/Records">Go to Records</NavLink>
      </div>
    </div>
  );
};

export default RecordNotFound;

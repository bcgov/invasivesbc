import UserGuideEntry from 'interfaces/UserGuideEntry';
import Accordion from 'UI/Reusable/Accordion/Accordion';
import './Guide.css';

type PropTypes = {
  entry: UserGuideEntry;
};
const Guide = ({ entry }: PropTypes) => {
  return (
    <Accordion icon={entry.titleIcon} title={entry.title}>
      <article>
        <h3>{entry.title}</h3>
        {entry.content}
      </article>
    </Accordion>
  );
};

export default Guide;

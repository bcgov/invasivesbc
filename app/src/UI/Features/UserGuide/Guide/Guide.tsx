import UserGuideEntry from 'interfaces/UserGuideEntry';
import Accordion from 'UI/Reusable/Accordion/Accordion';
import './Guide.css';

type PropTypes = {
  entry: UserGuideEntry;
};
const Guide = ({ entry }: PropTypes) => {
  return (
    <Accordion icon={entry?.titleIcon} title={entry.title}>
      <div className="guide-content">
        <h3>{entry.title}</h3>
        {entry.content.map((content) => (
          <div className="guide-inner">
            <div className="content-images">
              {content.images?.map((image) => (
                <figure>
                  <img src={image.imgSource} alt={image?.caption} />
                  {image?.caption && <figcaption>{image.caption}</figcaption>}
                </figure>
              ))}
            </div>
            <div className="content-text">
              {content.text.map((text) => (
                <p>{text}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Accordion>
  );
};

export default Guide;

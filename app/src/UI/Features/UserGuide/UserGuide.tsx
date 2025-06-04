import faqEntries from './Faq/faqEntries';
import Guide from './Guide/Guide';
import guideEntries from './Guide/guideEntries';
import './UserGuide.css';

const UserGuide = () => (
  <div id="user-guide-page">
    <div className="content">
      <h1>User Guide & FAQ</h1>
      <p>A quick overview to help you get started and make the most of the features available.</p>
      {guideEntries.length > 0 && (
        <section className="user-guide-section">
          <h2>User Guide</h2>
          {guideEntries.map((guide) => (
            <Guide entry={guide} />
          ))}
        </section>
      )}
      {faqEntries.length > 0 && (
        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <p>
            Here you'll find answers to some common questions. We hope this helps, but feel free to reach out if you
            need more information.
          </p>
          {faqEntries.map((faq) => (
            <Guide entry={faq} />
          ))}
        </section>
      )}
    </div>
  </div>
);

export default UserGuide;

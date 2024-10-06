export const ReportInvasivesForm = () => {
  const handleSubmit = () => {};

  return (
    <div>
      <h1>Report Invasive Species</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div>
          <label htmlFor="telephone">Telephone:</label>
          <input type="tel" id="telephone" name="telephone" required />
        </div>
        <div>
          <label htmlFor="personObserving">Person Observing:</label>
          <input type="text" id="personObserving" name="personObserving" required />
        </div>
        <div>
          <label htmlFor="date_observed">Date Observed:</label>
          <input type="date" id="date_observed" name="date_observed" required />
        </div>
        <div>
          <label htmlFor="suspected_species">Suspected Species:</label>
          <input type="text" id="suspected_species" name="suspected_species" required />
        </div>
        <div>
          <label htmlFor="location">Location:</label>
          <input type="text" id="location" name="location" required />
        </div>
        <div>
          <label htmlFor="area_of_infestation_comments">Area of Infestation Comments:</label>
          <textarea id="area_of_infestation_comments" name="area_of_infestation_comments" required></textarea>
        </div>
        <div>
          <button type="submit">Submit Report</button>
        </div>
      </form>
    </div>
  );
};

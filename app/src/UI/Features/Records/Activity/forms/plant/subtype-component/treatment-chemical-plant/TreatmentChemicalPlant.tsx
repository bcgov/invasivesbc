type PropTypes = {
  type: 'terrestrial' | 'aquatic';
};

const TreatmentChemicalPlant = ({ type }: PropTypes) => {
  return (
    <>
      <p>Hello World "{type}"</p>
    </>
  );
};

export default TreatmentChemicalPlant;

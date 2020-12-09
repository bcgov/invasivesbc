const herbicideApplicationRates = {
  '23713': 5
};

export function populateHerbicideRate(oldSubtypeData: any, newSubtypeData: any): any {
  console.log(oldSubtypeData)
  console.log(newSubtypeData)

  return newSubtypeData;

  // const { activity_subtype_data: { herbicide } } = formData || {};

  // if (!herbicide) {
  //   return formData;
  // }

  // const herbicideToUpdate = { ...herbicide[0] };
  // const herbicideCode = herbicideToUpdate.liquid_herbicide_code;

  // herbicideToUpdate.application_rate = herbicideApplicationRates[herbicideCode];

  // const updatedActivitySubtypeData = {
  //   ...formData.activity_subtype_data,
  //   herbicide: [herbicideToUpdate]
  // };

  // console.log(updatedActivitySubtypeData);

  // return {
  //   ...formData,
  //   activity_subtype_data: updatedActivitySubtypeData
  // };
}

import objectPath from 'object-path';

export const mapObservationTerrestrialPlant = (inputToMapTo: Object, csvRowData: Object) => {
  let output = { ...inputToMapTo };

  //   output.somefield = csvRowData.somefieldrelatedtothisform;
  return output;
};

export const mapDefaultFields = (inputToMapTo: Object, csvRowData: any) => {
  let output = { ...inputToMapTo };

  let fields = Object.keys(csvRowData.data);

  fields.map((field) => {
    try {
      if (
        csvRowData.data[field]['parsedValue'] !== null &&
        csvRowData.data[field]['parsedValue'] !== 'null' &&
        !Number.isNaN(csvRowData.data[field]['parsedValue'])
      ) {
        objectPath.set(
          output,
          csvRowData.data[field]['templateColumn']['mappedPath'],
          csvRowData.data[field]['parsedValue']
        );
      }
    } catch (e) {
      console.log('unable to map field');
      console.log(e);
    }
  });
  //output['form_data']['activity_data']['project_code'] = [{'description': csvRowData['data']['Project - Code']['parsedValue']}]
  return output;
};

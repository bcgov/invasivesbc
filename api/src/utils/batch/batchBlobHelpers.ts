export const mapObservationTerrestrialPlant = (inputToMapTo: Object, csvRowData: Object) => {
    let output = {...inputToMapTo}

 //   output.somefield = csvRowData.somefieldrelatedtothisform;
    return  output
}


export const mapDefaultFields = (inputToMapTo: Object, csvRowData: Object) => {
    let output = {...inputToMapTo}
    console.log('object we are pulling from')
    console.log(JSON.stringify(csvRowData, null, 2))
    output['form_data']['activity_data']['project_code'] = [{'description': 'hardcoded code'}]
    return  output
}
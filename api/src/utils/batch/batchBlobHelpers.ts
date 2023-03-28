import objectPath from 'object-path'


export const mapObservationTerrestrialPlant = (inputToMapTo: Object, csvRowData: Object) => {
    let output = {...inputToMapTo}

 //   output.somefield = csvRowData.somefieldrelatedtothisform;
    return  output
}


export const mapDefaultFields = (inputToMapTo: Object, csvRowData: any) => {
    let output = {...inputToMapTo}

    let fields = Object.keys(csvRowData.data)
    console.log('fields')
    console.log(JSON.stringify(fields))

    fields.map((field) => {
        console.log('field')
        console.log(JSON.stringify(field))
        try
        {

        objectPath.set(output, csvRowData.data[field]['templateColumn']['mappedPath'], csvRowData.data[field]['parsedValue'])
        }
        catch(e)
        {
            console.log('unable to map field')
            console.log(e)
        }
    })
    //output['form_data']['activity_data']['project_code'] = [{'description': csvRowData['data']['Project - Code']['parsedValue']}]
    return  output
}

export const mapSitesRowsToCSV = async (response: any, searchCriteria: any) => {
    const headers = ''
    console.log('response properties')
    console.dir(JSON.stringify(Object.keys(response)))
    const rows = response.rows.map((row)=> {
        return row.join(',')
    })
    const csv = headers + rows.join('\n')
    return csv
}
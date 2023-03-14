
export const mapSitesRowsToCSV = async (response: any, searchCriteria: any) => {
    const headers = ''
    console.log('response properties')
    console.dir(JSON.stringify(Object.keys(response)))
    const rows = response.rows.map((row)=> {
        console.log(typeof row)
        return Object.values(row).join(',')
    })
    console.log(typeof rows)
    const csv = headers + rows.join('\n')
    return csv
}
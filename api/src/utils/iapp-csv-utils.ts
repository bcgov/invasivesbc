export const mapSitesRowsToCSV = async (response: any, searchCriteria: any) => {
  const headers = response.fields.map((fieldObj) => fieldObj.name).join(',');
  const rows = response.rows.map((row, i) => {
    return Object.values(row).map((value: any) => typeof value === 'string'? value.replace(/(\r\n|\n|\r)/gm, ""): value).join(',');
  });
  const csv = headers + rows.join('\n');
  return csv;
};

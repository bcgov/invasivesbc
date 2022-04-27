import { SQL, SQLStatement } from 'sql-template-strings';

export const getAllEmbeddedReports = (): SQLStatement => {
  return SQL`
    SELECT *
    FROM embedded_reports_view;
  `;
};

export const getEmbeddedReport = (reportId: number): SQLStatement => {
  return SQL`
    SELECT *
    FROM embedded_reports_view
    WHERE id = ${reportId};
  `;
};

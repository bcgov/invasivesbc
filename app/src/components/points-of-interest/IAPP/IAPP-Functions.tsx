export const getJurisdictions = (surveys: any[]) => {
  const tempArr = [];

  surveys?.forEach((survey) => {
    survey?.jurisdictions?.forEach((jurisdiction) => {
      if (tempArr.length < 1) {
        tempArr.push(jurisdiction);
      } else {
        var flag = 0;

        tempArr.forEach((item) => {
          if (item.jurisdiction_code === jurisdiction.jurisdiction_code) {
            flag = 1;
          }
        });

        if (flag === 0) {
          tempArr.push(jurisdiction);
        }
      }
    });
  });

  return tempArr;
};

export const getLatestReportedArea = (surveys: any[]) => {
  var tempSurveyDate = null;
  var tempSurveyArea = null;

  if (surveys.length > 0) {
    surveys.forEach((survey) => {
      const surveyDate = new Date(survey.survey_date);
      if (tempSurveyDate === null) {
        tempSurveyDate = surveyDate;
        tempSurveyArea = survey.reported_area;
      }
      if (tempSurveyDate.valueOf() < surveyDate.valueOf()) {
        tempSurveyDate = surveyDate;
        tempSurveyArea = survey.reported_area;
      }
    });
  }

  return tempSurveyArea;
};

export const getReportedAreaOutput = (reportedArea: any) => {
  if (reportedArea > 0 || reportedArea !== null) {
    return reportedArea;
  } else return 'NWF';
};

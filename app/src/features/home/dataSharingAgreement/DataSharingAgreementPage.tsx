import {
  Box,
  Container,
  Typography
} from '@mui/material';
import React from 'react';


interface IDataSharingAgreementPage {
  classes?: any;
}

const DataSharingAgreementPage: React.FC<IDataSharingAgreementPage> = (props) => {
  return (
    <Container className={props.classes.container}>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h4">InvasivesBC Data Sharing Agreement</Typography>
      </Box>
      <Box >
        <ol>
          <li>Use of the InvasivesBC mobile or web application indicates your acceptance of the terms below.</li>
          <li>This is an agreement between you (either an individual or an entity) and the Province of British Columbia, Ministry of Forests (“the Province”).</li>
          <li>Before using InvasivesBC you should carefully read the following terms and conditions.</li>
          <li>InvasivesBC is a compilation of invasive species inventory, treatment, and monitoring information submitted by various government and non- government agencies and organizations. The Province has included stable and unique identifiers for all data entered into InvasivesBC so that the lifecycle of the data is tracked and the data may only be edited or deleted by the individual or agency (ie employer) that entered the data or by a system administrator.</li>
          <li>Occurrence data (aka survey data) may be visible to the Public, however treatment and monitoring data and user names are only visible to authenticated users of InvasivesBC once they are logged into the system.</li>
          <li>InvasivesBC does not allow the collection of personal information.</li>
          <li>The Province does not warrant the accuracy, completeness, timeliness, or fitness of the information in InvasivesBC for a particular purpose.</li>
          <li>Users of InvasivesBC are free to copy, modify, publish, translate, adapt, distribute or otherwise use the Information in any medium, mode or format for any lawful purpose, but must acknowledge the source of the information.</li>
          <li>In view of the temporal (i.e. changes of time) nature of the InvasivesBC data, it is the responsibility of the individual/agency that extracts data to ensure anyone who views or uses a particular extract knows the extraction date of that data.</li>
          <li>This Agreement does not grant you any right to use
            <ol type="a">
              <li>
                Personal Information;
              </li>
              <li>
                Information or Records not accessible under the Freedom of Information and Protection of Privacy Act (B.C.);
              </li>
              <li>
                third party rights the Information Provider is not authorized to licence;
              </li>
              <li>
                the names, crests, logos, or other official marks of the Information Provider; and
              </li>
              <li>
                Information subject to other intellectual property rights, including patents, trade-marks and official marks.
              </li>
            </ol>
          </li>
          <li>This Agreement does not grant you any right to use the Information in a way that suggests any official status or that the Province endorses you or your use of the Information.</li>
          <li>All right and title to InvasivesBC, including copyright, remain with the Province and the intellectual property rights of the data with the specific individual or agency (ie Employer) that the data was entered by or on behalf of (ie Funding Agency).</li>
          <li>In no event will the Province be liable to you or anyone else for any decision made or action taken by you or anyone else in reliance on the InvasivesBC information.</li>
          <li>The Province does not warrant that InvasivesBC will function without error, failure or interruption.</li>
          <li>The Province is not liable for any errors or omissions in the Information, and will not under any circumstances be liable for any direct, indirect, special, incidental, consequential, or other loss, injury or damage caused by its use or otherwise arising in connection with this licence or the Information, even if specifically advised of the possibility of such loss, injury or damage.</li>
          <li>Your e-mail address may be used to contact you in the future, only for the purposes of user-satisfaction surveys, notifications of updates or problems with the system, or similar communications. Your e-mail address will not be used for any other purpose or distributed to any other party.</li>
          <li>This is version 1.0 of the InvasivesBC Data Sharing Agreement. The Province may make changes to the terms of this licence from time to time and issue a new version of the licence. Your use of the Information will be governed by the terms of the licence in force as of the date you accessed the Information.</li>
        </ol>
      </Box>
      <Box sx={{m:4, mb:20}}>
        <Typography sx={{ fontStyle: 'italic' }}>May 2022</Typography>
      </Box>

    </Container>
  );
};

export default DataSharingAgreementPage;

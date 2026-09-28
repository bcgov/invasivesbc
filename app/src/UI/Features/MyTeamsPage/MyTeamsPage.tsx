import './myTeamsPage.css';
import MyInvitations from './subcomponents/MyInvitations/MyInvitations';
import MyTeams from './subcomponents/MyTeams/MyTeams';

const MyTeamsPage = () => {
  return (
    <div id="my-teams-page">
      <div className="content">
        <MyInvitations />
        <MyTeams />
      </div>
    </div>
  );
};

export default MyTeamsPage;

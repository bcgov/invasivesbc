import './myTeamsPage.css';
import CreateNewTeam from './subcomponents/CreateNewTeam/CreateNewTeam';
import MyInvitations from './subcomponents/MyInvitations/MyInvitations';
import MyTeams from './subcomponents/MyTeams/MyTeams';

const MyTeamsPage = () => {
  return (
    <div id="my-teams-page">
      <div className="content">
        <CreateNewTeam />
        <MyInvitations />
        <MyTeams />
      </div>
    </div>
  );
};

export default MyTeamsPage;

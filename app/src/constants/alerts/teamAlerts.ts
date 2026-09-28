import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import AlertMessage from 'interfaces/AlertMessage';

const teamAlertMessages: Record<string, AlertMessage> = {
  inviteSuccess: {
    content: 'Invitation Sent',
    severity: AlertSeverity.Success,
    subject: AlertSubjects.Team,
    autoClose: 6
  },
  inviteFailed: {
    content: 'Failed to invite user to team',
    severity: AlertSeverity.Error,
    subject: AlertSubjects.Team,
    autoClose: 6
  },
  suggestionsFailed: {
    content: 'Unable to get user suggestions',
    severity: AlertSeverity.Error,
    subject: AlertSubjects.Team,
    autoClose: 6
  },
  updateInvitationSuccess: {
    content: 'Invitation updated',
    severity: AlertSeverity.Success,
    subject: AlertSubjects.Team,
    autoClose: 6
  },
  updateInvitationFailed: {
    content: 'Could not update invitation',
    severity: AlertSeverity.Error,
    subject: AlertSubjects.Team,
    autoClose: 6
  },
  leaveTeamSuccess: {
    content: 'Successfully left team',
    severity: AlertSeverity.Success,
    subject: AlertSubjects.Team,
    autoClose: 6
  },
  leaveTeamFailure: {
    content: 'Failed to leave team',
    severity: AlertSeverity.Error,
    subject: AlertSubjects.Team,
    autoClose: 6
  },
  disbandTeamSuccess: {
    content: 'Successfully disbanded team',
    severity: AlertSeverity.Success,
    subject: AlertSubjects.Team,
    autoClose: 6
  },
  disbandTeamFailure: {
    content: 'Failed to disband team',
    severity: AlertSeverity.Error,
    subject: AlertSubjects.Team,
    autoClose: 6
  },
  removeMemberSuccess: {
    content: 'Member removed',
    severity: AlertSeverity.Success,
    subject: AlertSubjects.Team,
    autoClose: 6
  },
  removeMemberFailure: {
    content: 'Could not remove member',
    severity: AlertSeverity.Error,
    subject: AlertSubjects.Team,
    autoClose: 6
  },
  getTeamFailed: {
    content: 'Unable to get Team details',
    severity: AlertSeverity.Success,
    subject: AlertSubjects.Team,
    autoClose: 6
  }
};

export default teamAlertMessages;

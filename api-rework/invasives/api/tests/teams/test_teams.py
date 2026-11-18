from django.test.client import Client
from api.tests.base_test_case import BaseTestCase
from api.models.auth import User
from api.models.teams import InviteStatus, Team, TeamInvitation, TeamMember
from api.schemas.teams import SingleTeamOut
from rest_framework import status


class TeamsTest(BaseTestCase):
    base_url = "/ninja/teams"

    client = Client()
    extra_fixtures = [
        "test/common/test_activities.json",
        "test/common/test_jurisdictions_codes.json",
        "test/common/test_jurisdictions.json",
        "test/common/test_funding_agency_codes.json",
        "test/common/test_funding_agency.json",
        "test/common/test_employer_codes.json",
        "test/common/test_employer.json",
    ]

    NONE = 0

    def post(self, url, payload, user: str = "bc_datamanager"):
        headers = self.auth_headers(user) if user else None
        return self.client.post(
            self.base_url + url,
            content_type="application/json",
            data=payload,
            headers=headers,
        )

    def patch(self, url, payload, user: str = "bc_datamanager"):
        headers = self.auth_headers(user) if user else None
        return self.client.patch(
            self.base_url + url,
            content_type="application/json",
            data=payload,
            headers=headers,
        )

    def delete(self, url, payload=None, user: str = "bc_datamanager"):
        headers = self.auth_headers(user) if user else None
        return self.client.delete(
            self.base_url + url,
            content_type="application/json",
            data=payload,
            headers=headers,
        )

    def get(self, url, user: str = "bc_datamanager"):
        headers = self.auth_headers(user) if user else None
        return self.client.get(
            self.base_url + url,
            content_type="application/json",
            headers=headers,
        )

    def test_team_workflow(self):
        DATA_MANAGER = "bc_datamanager"
        MEMBER = "bc_admin"
        NON_MEMBER = "bc_biocontrol"
        TEAM_ONE_CONFIG = {
            "name": "Primary User Test Team",
            "agencies": ["MOTI", "MECS"],
            "description": "Primary User's IBC Team",
        }
        TEAM_TWO_CONFIG = {
            "name": "Primary User Test Team 2",
            "agencies": ["MOTI", "MECS"],
            "description": "Primary User's IBC Team",
        }
        ####################
        ## CREATE NEW TEAM
        ####################

        ## New Team Created -- Accepted
        res = self.post(url="/team", payload=TEAM_ONE_CONFIG, user=DATA_MANAGER)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        data = res.json()
        TEAM_ID = data["id"]
        self.assertIsNotNone(TEAM_ID)
        self.assertTrue(
            TeamMember.objects.filter(
                team_id=TEAM_ID, user__subject=DATA_MANAGER, leave_date=None
            ).exists()
        )
        self.assertFalse(
            TeamMember.objects.filter(
                team_id=TEAM_ID, user__subject=MEMBER, leave_date=None
            ).exists()
        )
        self.assertFalse(
            TeamMember.objects.filter(
                team_id=TEAM_ID, user__subject=NON_MEMBER, leave_date=None
            ).exists()
        )

        ## New Team Created -- Accepted (Second team, Different name)
        self.assertTrue(
            TeamMember.objects.filter(
                team_id=TEAM_ID, user__subject=DATA_MANAGER, leave_date=None
            ).exists()
        )
        res = self.post(url="/team", payload=TEAM_TWO_CONFIG, user=DATA_MANAGER)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        ## Constraint, User cannot have multiple teams by same name -- Denied (Duplicate Team name)
        self.assertTrue(
            TeamMember.objects.filter(
                team_id=TEAM_ID, user__subject=DATA_MANAGER, leave_date=None
            ).exists()
        )
        res = self.post(
            url="/team",
            payload=TEAM_ONE_CONFIG,
            user=DATA_MANAGER,
        )
        self.assertEqual(res.status_code, status.HTTP_409_CONFLICT)

        ## Create Team with Existing Name But different user -- Accepted (User does not have a team by this name)
        self.assertFalse(
            TeamMember.objects.filter(
                team_id=TEAM_ID, user__subject=MEMBER, leave_date=None
            ).exists()
        )
        res = self.post(
            url="/team",
            payload=TEAM_ONE_CONFIG,
            user=MEMBER,
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        ## Create New Team -- Denied (Unauthorized)
        self.assertFalse(
            TeamMember.objects.filter(
                team_id=TEAM_ID, user__subject=NON_MEMBER, leave_date=None
            ).exists()
        )
        res = self.post(
            url="/team",
            payload={**TEAM_ONE_CONFIG, "name": "Unauthorized Team Creation"},
            user=NON_MEMBER,
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        ####################
        ## TEAM UPDATING
        ####################
        NEW_NAME = "New Name"
        NEW_DESCRIPTION = "New Description"

        ## Update Team -- Approved
        self.assertTrue(
            TeamMember.objects.filter(
                team_id=TEAM_ID, user__subject=DATA_MANAGER, leave_date=None
            ).exists()
        )
        res = self.patch(
            url=f"/team/{TEAM_ID}",
            payload={
                "name": NEW_NAME,
                "description": NEW_DESCRIPTION,
            },
            user=DATA_MANAGER,
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()

        ### Not a new team, name and description are updated.
        self.assertEqual(data["id"], TEAM_ID, "Team was created, not updated")
        self.assertEqual(data["name"], NEW_NAME, "Name Unchanged")
        self.assertEqual(data["description"], NEW_DESCRIPTION, "Description Unchanged")

        ## Update Team -- Denied (User has different team by this name)
        self.assertTrue(
            TeamMember.objects.filter(
                team_id=TEAM_ID, user__subject=DATA_MANAGER, leave_date=None
            ).exists()
        )
        res = self.patch(
            url=f"/team/{TEAM_ID}",
            payload={
                "name": TEAM_TWO_CONFIG["name"],
                "description": TEAM_TWO_CONFIG["description"],
            },
            user=DATA_MANAGER,
        )
        self.assertEqual(res.status_code, status.HTTP_409_CONFLICT)

        ### Add a User to team
        TeamMember.objects.create(
            user=User.objects.get(subject=MEMBER), team=Team.objects.get(id=TEAM_ID)
        )
        self.assertTrue(
            TeamMember.objects.filter(
                team_id=TEAM_ID, user__subject=MEMBER, leave_date=None
            ).exists()
        )
        self.assertFalse(
            TeamMember.objects.filter(
                team_id=TEAM_ID, user__subject=NON_MEMBER, leave_date=None
            ).exists()
        )

        ## Update Team -- Denied (Non-Founder)
        self.assertTrue(
            TeamMember.objects.filter(
                team_id=TEAM_ID, user__subject=MEMBER, leave_date=None
            ).exists()
        )
        res = self.patch(
            url=f"/team/{TEAM_ID}",
            payload={
                "name": "Unauthorized Name",
                "description": "Unauthorized Description",
            },
            user=MEMBER,
        )
        self.assertEqual(
            res.status_code,
            status.HTTP_403_FORBIDDEN,
            "Unauthorized user updated team",
        )

        ##########
        ## TEAM FETCHING
        ##########

        ## Fetch Team Page  -- Success (Creator)
        self.assertTrue(
            TeamMember.objects.filter(
                team_id=TEAM_ID, user__subject=DATA_MANAGER, leave_date=None
            ).exists()
        )
        res = self.get(url=f"/team/{TEAM_ID}", user=DATA_MANAGER)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data: SingleTeamOut = res.json()

        self.assertEqual(data["name"], NEW_NAME)
        self.assertEqual(data["description"], NEW_DESCRIPTION)
        self.assertIsNotNone(data["agencies"])
        # TODO: Verify Employers not 'None' when implemented. For now, check key exists
        self.assertTrue("employers" in data)
        self.assertIsNotNone(data["founding_date"])
        self.assertIsNotNone(data["id"])
        self.assertTrue(data["can_edit"])
        self.assertIsNotNone(data["founder"])
        self.assertIsNotNone(data["invitations"])

        ## Fetch Team Page  -- Failure (Does not Exist)
        res = self.get(url="/team/90210", user=DATA_MANAGER)
        self.assertEqual(
            res.status_code,
            404,
            "Success response sent when fetching non-existent team",
        )

        ## Fetch Team Page  -- Failure (Non-member)
        self.assertFalse(
            TeamMember.objects.filter(
                team_id=TEAM_ID, user__subject=NON_MEMBER, leave_date=None
            ).exists()
        )
        res = self.get(url=f"/team/{TEAM_ID}", user=NON_MEMBER)
        self.assertEqual(
            res.status_code,
            status.HTTP_403_FORBIDDEN,
            "Non-member of team fetched page",
        )

        ####################
        ## TEAM DELETION
        ####################

        # Delete Team Page  -- Failure (Non-Founder)
        self.assertTrue(
            TeamMember.objects.filter(
                team_id=TEAM_ID, user__subject=MEMBER, leave_date=None
            ).exists()
        )
        res = self.delete(url=f"/team/{TEAM_ID}", user=MEMBER)
        self.assertEqual(
            res.status_code,
            status.HTTP_403_FORBIDDEN,
            "Team was deleted by unauthorized source",
        )

        # Delete Team Page -- Failure (Team Member, not Founder)

        ###
        # Delete Team Success -- Founder
        self.assertTrue(
            TeamMember.objects.filter(
                team_id=TEAM_ID, user__subject=DATA_MANAGER, leave_date=None
            ).exists()
        )
        res = self.delete(url=f"/team/{TEAM_ID}", user=DATA_MANAGER)
        self.assertEqual(
            res.status_code,
            status.HTTP_204_NO_CONTENT,
            "Team was not deleted by owners request",
        )

        ###
        # Fetching Deleted Team returns 404
        res = self.get(url=f"/team/{TEAM_ID}", user=DATA_MANAGER)
        self.assertEqual(
            res.status_code,
            status.HTTP_404_NOT_FOUND,
            "Fetching deleted team did not return 404 Response",
        )
        team = Team.objects.get(id=TEAM_ID)

        # Soft Delete (Team exists, disbanded date populated)
        self.assertIsNotNone(
            team.disbanded_date,
            "Team assumed deleted did not return disbanded date",
        )

    def test_team_management(self):
        DATA_MANAGER = "bc_datamanager"
        PRIVILEGED_NON_MEMBER = "bc_admin"
        NON_MEMBER = PRIVILEGED_NON_MEMBER
        INVITEE = "bc_biocontrol"

        def assert_active_member(subject):
            self.assertTrue(
                TeamMember.objects.filter(
                    team_id=TEAM_ID, user__subject=subject, leave_date=None
                ).exists(),
                f"{subject} is not an active team member",
            )

        def assert_not_active_member(subject):
            self.assertFalse(
                TeamMember.objects.filter(
                    team_id=TEAM_ID, user__subject=subject, leave_date=None
                ).exists(),
                f"{subject} is an active team member",
            )

        ####################
        ## SETUP
        ####################
        TEAM_ONE_CONFIG = {
            "name": "Primary User Test Team",
            "agencies": ["MOTI", "MECS"],
            "description": "Primary User's IBC Team",
        }
        res = self.post(
            url="/team",
            payload={
                "name": TEAM_ONE_CONFIG["name"],
                "agencies": TEAM_ONE_CONFIG["agencies"],
                "description": TEAM_ONE_CONFIG["description"],
            },
            user=DATA_MANAGER,
        )
        data = res.json()
        TEAM_ID = data["id"]
        assert_active_member(DATA_MANAGER)
        assert_not_active_member(NON_MEMBER)
        assert_not_active_member(INVITEE)

        def assert_pending_invitation():
            invitation = TeamInvitation.objects.get(id=INVITATION_ID)
            self.assertEqual(invitation.status, InviteStatus.Pending.value)

        ## Get Own Invitations  -- Success
        assert_not_active_member(INVITEE)
        res = self.get("/invite", user=INVITEE)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertEqual(len(data), self.NONE, "Unexpected Invitations were found")

        ## Invite User Failed -- Not Team Founder
        assert_active_member(DATA_MANAGER)
        assert_not_active_member(NON_MEMBER)
        assert_not_active_member(INVITEE)
        res = self.post(
            url=f"/team/{TEAM_ID}/invite",
            payload={"subject": INVITEE},
            user=NON_MEMBER,
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        invites = TeamInvitation.objects.all().count()
        self.assertEqual(invites, self.NONE, "Invitation was created when unexpected")
        assert_not_active_member(INVITEE)

        ## Get Suggested Users for Team -- Founder
        assert_active_member(DATA_MANAGER)
        res = self.get(url=f"/team/{TEAM_ID}/invite", user=DATA_MANAGER)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        suggestions = res.json()
        self.assertGreaterEqual(len(suggestions), 1, "No Suggestions Provided")

        ## Get Suggested Users for Team -- Non-Member
        assert_not_active_member(NON_MEMBER)
        res = self.get(url=f"/team/{TEAM_ID}/invite", user=NON_MEMBER)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        ## Invite User Success -- Founder
        assert_active_member(DATA_MANAGER)
        assert_not_active_member(INVITEE)
        res = self.post(
            url=f"/team/{TEAM_ID}/invite",
            payload={"subject": INVITEE},
            user=DATA_MANAGER,
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertFalse(
            TeamMember.objects.filter(team_id=TEAM_ID, user__subject=INVITEE).exists()
        )
        INVITATION_ID = TeamInvitation.objects.get(
            team_id=TEAM_ID, recipient__subject=INVITEE
        ).id

        ## Invite User Failure -- Founder (Cannot invite self)
        assert_active_member(DATA_MANAGER)
        res = self.post(
            url=f"/team/{TEAM_ID}/invite",
            payload={"subject": DATA_MANAGER},
            user=DATA_MANAGER,
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        ## Get Invitations  -- Success (1 Active Invite)
        assert_pending_invitation()
        assert_not_active_member(INVITEE)
        res = self.get("/invite", user=INVITEE)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["id"], INVITATION_ID)

        ## Respond To Invite -- Invalid User
        assert_not_active_member(NON_MEMBER)
        res = self.patch(
            "/invite",
            payload={"invitation_id": INVITATION_ID, "response": "Cancelled"},
            user=NON_MEMBER,
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        assert_pending_invitation()
        assert_not_active_member(INVITEE)

        ## Respond To Invite -- Recipient (Invalid Command)
        assert_not_active_member(INVITEE)
        res = self.patch(
            "/invite",
            payload={"invitation_id": INVITATION_ID, "response": "Cancelled"},
            user=INVITEE,
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        assert_pending_invitation()
        assert_not_active_member(INVITEE)

        ## Respond To Invite -- Founder (Invalid Command)
        assert_active_member(DATA_MANAGER)
        res = self.patch(
            "/invite",
            payload={"invitation_id": INVITATION_ID, "response": "Accepted"},
            user=DATA_MANAGER,
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        assert_pending_invitation()
        assert_not_active_member(INVITEE)

        ## Cancel Invite -- Sender
        assert_active_member(DATA_MANAGER)
        assert_not_active_member(INVITEE)
        res = self.patch(
            "/invite",
            payload={"invitation_id": INVITATION_ID, "response": "Cancelled"},
            user=DATA_MANAGER,
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(
            TeamInvitation.objects.get(id=INVITATION_ID).status,
            InviteStatus.Cancelled.value,
        )
        assert_not_active_member(INVITEE)

        ## Get Invitations  -- Zero Active Invites (Previously 1)
        assert_not_active_member(INVITEE)
        res = self.get("/invite", user=INVITEE)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertEqual(len(data), self.NONE, "Unexpected Invitations were found")

        ## Resubmit Invitation -- Founder
        assert_active_member(DATA_MANAGER)
        assert_not_active_member(INVITEE)
        res = self.post(
            url=f"/team/{TEAM_ID}/invite",
            payload={"subject": INVITEE},
            user=DATA_MANAGER,
        )
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        assert_pending_invitation()
        assert_not_active_member(INVITEE)

        ## Get Invitations  -- Success (1 Invite Found)
        res = self.get("/invite", user=INVITEE)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["id"], INVITATION_ID)

        ## Check enrolled teams of user being invited (None)
        assert_not_active_member(INVITEE)
        res = self.get(url="/team", user=INVITEE)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()

        self.assertEqual(len(data["teams"]), self.NONE)

        ## Respond To Invite -- Recipient (Valid)
        assert_not_active_member(INVITEE)
        pre_invite = TeamInvitation.objects.all().count()
        res = self.patch(
            "/invite",
            payload={"invitation_id": INVITATION_ID, "response": "Accepted"},
            user=INVITEE,
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        MEMBER = INVITEE
        assert_active_member(MEMBER)

        ## Get Invitations  -- Success
        assert_active_member(MEMBER)
        res = self.get("/invite", user=MEMBER)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertEqual(len(data), self.NONE)  # Accepted Invitation Does not appear.
        self.assertEqual(
            TeamInvitation.objects.get(id=INVITATION_ID).status,
            InviteStatus.Accepted.value,
        )

        post_invite = TeamInvitation.objects.all().count()
        self.assertEqual(
            pre_invite, post_invite, "New invites were created instead of updated"
        )

        ## Get Teams List -- (bc_noroles)
        assert_active_member(MEMBER)
        res = self.get(url="/team", user=MEMBER)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        teams = data["teams"]
        self.assertEqual(len(teams), 1)
        self.assertEqual(data["teams"][0]["team_id"], TEAM_ID)  # User was added to Team

        ## Non-Founder Member Loads Team Details (Limited View)
        assert_active_member(MEMBER)
        assert_not_active_member(NON_MEMBER)
        res = self.get(url=f"/team/{TEAM_ID}", user=MEMBER)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data: SingleTeamOut = res.json()

        self.assertEqual(data["name"], TEAM_ONE_CONFIG["name"])
        self.assertEqual(data["description"], TEAM_ONE_CONFIG["description"])
        self.assertIsNotNone(data["agencies"])
        self.assertIsNotNone(data["employers"])
        self.assertIsNotNone(data["founding_date"])
        self.assertIsNotNone(data["id"])
        self.assertIsNotNone(data["founder"])
        self.assertFalse(data["can_edit"], "Regular member was given edit permission")
        self.assertIsNone(data["invitations"], "Regular member was given invitations")
        # Expect Founder + 1 User
        self.assertEqual(
            len(data["members"]), 2, "Team has incorrect number of members"
        )
        ## Invite User Failure -- Founder (Invited User already on Team)
        assert_active_member(DATA_MANAGER)
        assert_active_member(MEMBER)
        res = self.post(
            url=f"/team/{TEAM_ID}/invite",
            payload={"subject": MEMBER},
            user=DATA_MANAGER,
        )
        self.assertEqual(res.status_code, status.HTTP_409_CONFLICT)

        ## Get Suggested Users for Team -- Member (Non-Founder)
        assert_active_member(MEMBER)
        res = self.get(url=f"/team/{TEAM_ID}/invite", user=MEMBER)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        ## Leave Team - Non-Member
        assert_not_active_member(NON_MEMBER)
        res = self.delete(url=f"/team/{TEAM_ID}/leave", user=NON_MEMBER)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        ## Leave Team - Member
        assert_active_member(MEMBER)
        res = self.delete(url=f"/team/{TEAM_ID}/leave", user=MEMBER)
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        membership = TeamMember.objects.get(team_id=TEAM_ID, user__subject=MEMBER)
        self.assertIsNotNone(membership.leave_date)
        NON_MEMBER = MEMBER
        assert_not_active_member(NON_MEMBER)

        ## User can no longer load team page
        assert_not_active_member(NON_MEMBER)
        res = self.get(url=f"/team/{TEAM_ID}", user=NON_MEMBER)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Reactivate only the member being tested for removal.
        TeamMember.objects.filter(team_id=TEAM_ID, user__subject=NON_MEMBER).update(
            leave_date=None
        )
        MEMBER = NON_MEMBER
        NON_MEMBER = PRIVILEGED_NON_MEMBER
        assert_active_member(MEMBER)
        assert_not_active_member(NON_MEMBER)

        ## Disband Team -- Non-Member (Fail)
        assert_not_active_member(NON_MEMBER)
        res = self.delete(url=f"/team/{TEAM_ID}", user=NON_MEMBER)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        ## Disband Team -- Member (Fail)
        assert_active_member(MEMBER)
        res = self.delete(url=f"/team/{TEAM_ID}", user=MEMBER)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        ## Kick User -- Non-Member (Fail)
        assert_not_active_member(NON_MEMBER)
        assert_active_member(MEMBER)
        res = self.delete(
            url=f"/team/{TEAM_ID}/members/{MEMBER}",
            user=NON_MEMBER,
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        ## Kick User -- Member (Fail)
        assert_active_member(MEMBER)
        res = self.delete(
            url=f"/team/{TEAM_ID}/members/{MEMBER}",
            user=MEMBER,
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        ## Kick User -- Admin (Success)
        assert_active_member(DATA_MANAGER)
        assert_active_member(MEMBER)
        res = self.delete(url=f"/team/{TEAM_ID}/members/{MEMBER}", user=DATA_MANAGER)
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        membership = TeamMember.objects.get(team_id=TEAM_ID, user__subject=MEMBER)
        self.assertIsNotNone(membership.leave_date)
        NON_MEMBER = MEMBER
        assert_not_active_member(NON_MEMBER)

        ## Removed Member Cannot Load Team Details
        res = self.get(url=f"/team/{TEAM_ID}", user=NON_MEMBER)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        ## Kick Non-Member User -- Admin (Fail)
        assert_not_active_member(NON_MEMBER)
        res = self.delete(
            url=f"/team/{TEAM_ID}/members/{NON_MEMBER}", user=DATA_MANAGER
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        ## Disband Team -- Founder (Success)
        assert_active_member(DATA_MANAGER)
        res = self.delete(url=f"/team/{TEAM_ID}", user=DATA_MANAGER)
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

        team_exists = Team.objects.filter(id=TEAM_ID, disbanded_date=None).exists()
        self.assertFalse(team_exists)

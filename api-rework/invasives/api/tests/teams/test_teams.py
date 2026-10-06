from django.test.client import Client
from api.tests.base_test_case import BaseTestCase
from api.models.auth import User
from api.models.teams import Team, TeamInvitation, TeamMember
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

    NO_ROLE_USER = "bc_noroles"
    NONE = 0

    def post(self, url, payload, user: str = "bc_datamanager"):
        headers = {"Authorization": f"Bearer act_as_user={user}"} if user else None
        return self.client.post(
            self.base_url + url,
            content_type="application/json",
            data=payload,
            headers=headers,
        )

    def patch(self, url, payload, user: str = "bc_datamanager"):
        headers = {"Authorization": f"Bearer act_as_user={user}"} if user else None
        return self.client.patch(
            self.base_url + url,
            content_type="application/json",
            data=payload,
            headers=headers,
        )

    def delete(self, url, payload=None, user: str = "bc_datamanager"):
        headers = {"Authorization": f"Bearer act_as_user={user}"} if user else None
        return self.client.delete(
            self.base_url + url,
            content_type="application/json",
            data=payload,
            headers=headers,
        )

    def get(self, url, user: str = "bc_datamanager"):
        headers = {"Authorization": f"Bearer act_as_user={user}"} if user else None
        return self.client.get(
            self.base_url + url,
            content_type="application/json",
            headers=headers,
        )

    def test_team_workflow(self):
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
        res = self.post(url="/team", payload=TEAM_ONE_CONFIG)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        data = res.json()
        TEAM_ID = data["id"]
        self.assertIsNotNone(TEAM_ID)

        ## New Team Created -- Accepted (Second team, Different name)
        res = self.post(url="/team", payload=TEAM_TWO_CONFIG)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        ## Constraint, User cannot have multiple teams by same name -- Denied (Duplicate Team name)
        res = self.post(
            url="/team",
            payload=TEAM_ONE_CONFIG,
        )
        self.assertEqual(res.status_code, status.HTTP_409_CONFLICT)

        ## Create Team with Existing Name But different user -- Accepted (User does not have a team by this name)
        res = self.post(
            url="/team",
            payload=TEAM_ONE_CONFIG,
            user="bc_admin",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        ## Create New Team -- Denied (Unauthorized)
        res = self.post(
            url="/team",
            payload={**TEAM_ONE_CONFIG, "name": "Unauthorized Team Creation"},
            user=self.NO_ROLE_USER,
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        ####################
        ## TEAM UPDATING
        ####################
        NEW_NAME = "New Name"
        NEW_DESCRIPTION = "New Description"

        ## Update Team -- Approved
        res = self.patch(
            url=f"/team/{TEAM_ID}",
            payload={
                "name": NEW_NAME,
                "description": NEW_DESCRIPTION,
            },
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()

        ### Not a new team, name and description are updated.
        self.assertEqual(data["id"], TEAM_ID, "Team was created, not updated")
        self.assertEqual(data["name"], NEW_NAME, "Name Unchanged")
        self.assertEqual(data["description"], NEW_DESCRIPTION, "Description Unchanged")

        ## Update Team -- Denied (User has different team by this name)
        res = self.patch(
            url=f"/team/{TEAM_ID}",
            payload={
                "name": TEAM_TWO_CONFIG["name"],
                "description": TEAM_TWO_CONFIG["description"],
            },
        )
        self.assertEqual(res.status_code, status.HTTP_409_CONFLICT)

        ### Add a User to team
        TeamMember.objects.create(
            user=User.objects.get(subject="bc_admin"), team=Team.objects.get(id=TEAM_ID)
        )

        ## Update Team -- Denied (Non-Founder)
        res = self.patch(
            url=f"/team/{TEAM_ID}",
            payload={
                "name": "Unauthorized Name",
                "description": "Unauthorized Description",
            },
            user="bc_admin",
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
        res = self.get(url=f"/team/{TEAM_ID}")
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
        res = self.get(url="/team/90210")
        self.assertEqual(
            res.status_code,
            404,
            "Success response sent when fetching non-existent team",
        )

        ## Fetch Team Page  -- Failure (Non-member)
        res = self.get(url=f"/team/{TEAM_ID}", user=self.NO_ROLE_USER)
        self.assertEqual(
            res.status_code,
            status.HTTP_403_FORBIDDEN,
            "Non-member of team fetched page",
        )

        ####################
        ## TEAM DELETION
        ####################

        # Delete Team Page  -- Failure (Non-Founder)
        res = self.delete(url=f"/team/{TEAM_ID}", user="bc_admin")
        self.assertEqual(
            res.status_code,
            status.HTTP_403_FORBIDDEN,
            "Team was deleted by unauthorized source",
        )

        # Delete Team Page -- Failure (Team Member, not Founder)

        ###
        # Delete Team Success -- Founder
        res = self.delete(url=f"/team/{TEAM_ID}")
        self.assertEqual(
            res.status_code,
            status.HTTP_204_NO_CONTENT,
            "Team was not deleted by owners request",
        )

        ###
        # Fetching Deleted Team returns 404
        res = self.get(url=f"/team/{TEAM_ID}")
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
        )
        data = res.json()
        TEAM_ID = data["id"]

        ## Get Own Invitations  -- Success
        res = self.get("/invite", user=self.NO_ROLE_USER)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertEqual(len(data), self.NONE, "Unexpected Invitations were found")

        ## Invite User Failed -- Not Team Founder
        res = self.post(
            url=f"/team/{TEAM_ID}/invite",
            payload={"subject": self.NO_ROLE_USER},
            user="bc_admin",
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        invites = TeamInvitation.objects.all().count()
        self.assertEqual(invites, self.NONE, "Invitation was created when unexpected")

        ## Get Suggested Users for Team -- Founder
        res = self.get(url=f"/team/{TEAM_ID}/invite")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        suggestions = res.json()
        self.assertGreaterEqual(len(suggestions), 1, "No Suggestions Provided")

        ## Get Suggested Users for Team -- Non-Member
        res = self.get(url=f"/team/{TEAM_ID}/invite", user="bc_admin")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        ## Invite User Success -- Founder
        res = self.post(
            url=f"/team/{TEAM_ID}/invite",
            payload={"subject": self.NO_ROLE_USER},
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        ## Invite User Failure -- Founder (Cannot invite self)
        res = self.post(
            url=f"/team/{TEAM_ID}/invite",
            payload={"subject": "bc_datamanager"},
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        ## Get Invitations  -- Success (1 Active Invite)
        res = self.get("/invite", user=self.NO_ROLE_USER)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertEqual(len(data), 1)
        INVITATION_ID = data[0]["id"]
        self.assertIsNotNone(INVITATION_ID)

        ## Respond To Invite -- Invalid User
        res = self.patch(
            "/invite",
            payload={"invitation_id": INVITATION_ID, "response": "Cancelled"},
            user="bc_admin",
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        ## Respond To Invite -- Recipient (Invalid Command)
        res = self.patch(
            "/invite",
            payload={"invitation_id": INVITATION_ID, "response": "Cancelled"},
            user=self.NO_ROLE_USER,
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        ## Respond To Invite -- Founder (Invalid Command)
        res = self.patch(
            "/invite",
            payload={"invitation_id": INVITATION_ID, "response": "Accepted"},
            user="bc_admin",
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        ## Cancel Invite -- Sender
        res = self.patch(
            "/invite",
            payload={"invitation_id": INVITATION_ID, "response": "Cancelled"},
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        ## Get Invitations  -- Zero Active Invites (Previously 1)
        res = self.get("/invite", user=self.NO_ROLE_USER)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertEqual(len(data), self.NONE, "Unexpected Invitations were found")

        ## Resubmit Invitation -- Founder
        res = self.post(
            url=f"/team/{TEAM_ID}/invite",
            payload={"subject": self.NO_ROLE_USER},
        )
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

        ## Get Invitations  -- Success (1 Invite Found)
        res = self.get("/invite", user=self.NO_ROLE_USER)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertEqual(len(data), 1)

        ## Check enrolled teams of user being invited (None)
        res = self.get(url="/team", user=self.NO_ROLE_USER)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()

        self.assertEqual(len(data["teams"]), self.NONE)

        ## Respond To Invite -- Recipient (Valid)
        res = self.patch(
            "/invite",
            payload={"invitation_id": INVITATION_ID, "response": "Accepted"},
            user=self.NO_ROLE_USER,
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        pre_invite = TeamInvitation.objects.all().count()
        ## Get Invitations  -- Success
        res = self.get("/invite", user=self.NO_ROLE_USER)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertEqual(len(data), self.NONE)  # Accepted Invitation Does not appear.

        post_invite = TeamInvitation.objects.all().count()
        self.assertEqual(
            pre_invite, post_invite, "New invites were created instead of updated"
        )

        ## Get Teams List -- (bc_noroles)
        res = self.get(url="/team", user=self.NO_ROLE_USER)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        teams = data["teams"]
        self.assertEqual(len(teams), 1)
        self.assertEqual(data["teams"][0]["team_id"], TEAM_ID)  # User was added to Team

        ## Non-Founder Member Loads Team Details (Limited View)
        res = self.get(url=f"/team/{TEAM_ID}", user=self.NO_ROLE_USER)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data: SingleTeamOut = res.json()

        self.assertEqual(data["name"], TEAM_ONE_CONFIG["name"])
        self.assertEqual(data["description"], TEAM_ONE_CONFIG["description"])
        self.assertIsNotNone(data["agencies"])
        # TODO: Verify Employers not 'None' when implemented. For now, check key exists
        self.assertTrue("employers" in data)
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
        res = self.post(
            url=f"/team/{TEAM_ID}/invite",
            payload={"subject": self.NO_ROLE_USER},
        )
        self.assertEqual(res.status_code, status.HTTP_409_CONFLICT)

        ## Get Suggested Users for Team -- Member (Non-Founder)
        res = self.get(url=f"/team/{TEAM_ID}/invite", user=self.NO_ROLE_USER)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        ## Leave Team - Non-Member
        res = self.delete(url=f"/team/{TEAM_ID}/leave", user="bc_admin")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        ## Leave Team - Member
        res = self.delete(url=f"/team/{TEAM_ID}/leave", user=self.NO_ROLE_USER)
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

        ## User can no longer load team page
        res = self.get(url=f"/team/{TEAM_ID}", user=self.NO_ROLE_USER)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Re-add memberships
        TeamMember.objects.filter(team__id=TEAM_ID).update(leave_date=None)

        ## Kick User -- Non-Member (Fail)
        res = self.delete(
            url=f"/team/{TEAM_ID}/members/{self.NO_ROLE_USER}",
            user="bc_admin",
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        ## Kick User -- Member (Fail)
        res = self.delete(
            url=f"/team/{TEAM_ID}/members/{self.NO_ROLE_USER}",
            user=self.NO_ROLE_USER,
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        ## Kick User -- Admin (Success)
        res = self.delete(url=f"/team/{TEAM_ID}/members/{self.NO_ROLE_USER}")
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

        ## Kick Non-Member User -- Admin (Fail)
        res = self.delete(url=f"/team/{TEAM_ID}/members/{self.NO_ROLE_USER}")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        ## Disband Team -- Non-Member (Fail)
        res = self.delete(url=f"/team/{TEAM_ID}", user="bc_admin")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        ## Disband Team -- Member (Fail)
        res = self.delete(url=f"/team/{TEAM_ID}", user=self.NO_ROLE_USER)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        ## Disband Team -- Founder (Success)
        res = self.delete(url=f"/team/{TEAM_ID}")
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

        team_exists = Team.objects.filter(id=TEAM_ID, disbanded_date=None).exists()
        self.assertFalse(team_exists)

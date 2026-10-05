from django.test.client import Client
from api.tests.base_test_case import BaseTestCase
from api.models.teams import TeamMember, Team, TeamInvitation
from api.models.auth import User
from api.schemas.teams import SingleTeamOut


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
        ##########
        ## TEAM CREATION
        ##########

        #####
        ## Create New Team -- Happy
        res = self.post(
            url="/team",
            payload={
                "name": TEAM_ONE_CONFIG["name"],
                "agencies": TEAM_ONE_CONFIG["agencies"],
                "description": TEAM_ONE_CONFIG["description"],
            },
        )
        self.assertEqual(res.status_code, 201)
        data = res.json()
        TEAM_ID = data["id"]
        self.assertIsNotNone(TEAM_ID)

        #####
        ## Create New Team -- Denied (Unauthorized)
        res = self.post(
            url="/team",
            payload={
                "name": "Unauthorized Team Creation",
                "agencies": TEAM_ONE_CONFIG["agencies"],
                "description": TEAM_ONE_CONFIG["description"],
            },
            user=self.NO_ROLE_USER,
        )
        self.assertEqual(res.status_code, 403)

        #####
        ## Create New Team -- Happy (Different User, no name collision)
        res = self.post(
            url="/team",
            payload=TEAM_ONE_CONFIG,
            user="bc_admin",
        )
        self.assertEqual(res.status_code, 201)

        #####
        ## Create New Team -- Denied (Duplicate Team name)
        res = self.post(
            url="/team",
            payload=TEAM_ONE_CONFIG,
        )
        self.assertEqual(res.status_code, 409)

        ##########
        ## TEAM UPDATING
        ##########

        #####
        ## Update Team -- Approved
        new_name = "New Name"
        new_description = "New Description"

        res = self.patch(
            url=f"/team/{TEAM_ID}",
            payload={
                "name": new_name,
                "description": new_description,
            },
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()

        # Not a new team, name and description are updated.
        self.assertEqual(data["id"], TEAM_ID)
        self.assertEqual(data["name"], new_name)
        self.assertEqual(data["description"], new_description)

        #####
        ## Update Team -- Denied (Non-Founder)
        res = self.patch(
            url=f"/team/{TEAM_ID}",
            payload={
                "name": "Unauthorized Name",
                "description": "Unauthorized Description",
            },
            user="bc_admin",
        )
        self.assertEqual(res.status_code, 403)

        ##########
        ## TEAM FETCHING
        ##########

        #####
        # Fetch Team Page  -- Success (Creator)
        res = self.get(url=f"/team/{TEAM_ID}")
        self.assertEqual(res.status_code, 200)
        data: SingleTeamOut = res.json()

        # Check for Expected Details
        self.assertEqual(data["name"], new_name)
        self.assertEqual(data["description"], new_description)
        self.assertIsNotNone(data["agencies"])
        self.assertIsNotNone(data["founding_date"])
        self.assertIsNotNone(data["id"])
        self.assertTrue(data["can_edit"])
        self.assertIsNotNone(data["founder"])
        self.assertIsNotNone(data["invitations"])

        #####
        # Fetch Team Page  -- Failure (Does not Exist)
        res = self.get(url="/team/90210")
        self.assertEqual(
            res.status_code,
            404,
            "Success response sent when fetching non-existent team",
        )

        #####
        # Fetch Team Page  -- Failure (Non-member)
        res = self.get(url=f"/team/{TEAM_ID}", user=self.NO_ROLE_USER)
        self.assertEqual(res.status_code, 403, "Non-member of team fetched page")

        ##########
        ## TEAM DELETION
        ##########

        #####
        # Delete Team Page  -- Failure (Non-Founder)
        res = self.delete(url=f"/team/{TEAM_ID}", user="bc_admin")
        self.assertEqual(
            res.status_code,
            403,
            "Team was deleted by unauthorized source",
        )

        ####
        # Delete Team Page -- Failure (Team Member, not Founder)

        ###
        # Delete Team Success -- Founder
        res = self.delete(url=f"/team/{TEAM_ID}")
        self.assertEqual(
            res.status_code,
            200,
            "Team was not deleted by owners request",
        )

        ###
        # Fetching Deleted Team returns 404
        res = self.get(url=f"/team/{TEAM_ID}")
        self.assertEqual(
            res.status_code,
            404,
            "Fetching deleted team did not return 404 Response",
        )
        team = Team.objects.get(id=TEAM_ID)

        # Soft Delete (Team exists, disbanded date populated)
        self.assertIsNotNone(
            team.disbanded_date,
            "Team assumed deleted did not return disbanded date",
        )

    def test_invitation_workflow(self):
        # Setup for Invitation Workflow
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

        #####
        # Get Invitations  -- Success
        res = self.get("/invite", user=self.NO_ROLE_USER)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data), 0, "Unexpected Invitations were found")

        #####
        # Invite User Failed -- Not Team Founder
        res = self.post(
            url=f"/team/{TEAM_ID}/invite",
            payload={"subject": self.NO_ROLE_USER},
            user="bc_admin",
        )
        self.assertEqual(res.status_code, 403)

        invites = TeamInvitation.objects.all().count()
        self.assertEqual(invites, 0, "Invitation was created when unexpected")

        ####
        # Invite User Success -- Founder
        res = self.post(
            url=f"/team/{TEAM_ID}/invite",
            payload={"subject": self.NO_ROLE_USER},
        )
        self.assertEqual(res.status_code, 201)

        #####
        # Get Invitations  -- Success (1 Active Invite)
        res = self.get("/invite", user=self.NO_ROLE_USER)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data), 1)
        INVITATION_ID = data[0]["id"]
        self.assertIsNotNone(INVITATION_ID)

        ####
        # Respond To Invite -- Invalid User
        res = self.patch(
            "/invite",
            payload={"invitation_id": INVITATION_ID, "response": "Cancelled"},
            user="bc_admin",
        )
        self.assertEqual(res.status_code, 403)

        #####
        # Respond To Invite -- Recipient (Invalid Command)
        res = self.patch(
            "/invite",
            payload={"invitation_id": INVITATION_ID, "response": "Cancelled"},
            user=self.NO_ROLE_USER,
        )
        self.assertEqual(res.status_code, 403)

        #####
        # Respond To Invite -- Founder (Invalid Command)
        res = self.patch(
            "/invite",
            payload={"invitation_id": INVITATION_ID, "response": "Accepted"},
            user="bc_admin",
        )
        self.assertEqual(res.status_code, 403)

        #####
        # Cancel Invite -- Sender
        res = self.patch(
            "/invite",
            payload={"invitation_id": INVITATION_ID, "response": "Cancelled"},
        )
        self.assertEqual(res.status_code, 200)

        #####
        # Get Invitations  -- Zero Active Invites
        res = self.get("/invite", user=self.NO_ROLE_USER)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data), 0, "Unexpected Invitations were found")

        ####
        # Resubmit Invitation -- Founder
        res = self.post(
            url=f"/team/{TEAM_ID}/invite",
            payload={"subject": self.NO_ROLE_USER},
        )
        self.assertEqual(res.status_code, 204)

        #####
        # Get Invitations  -- Success (1 Invite Found)
        res = self.get("/invite", user=self.NO_ROLE_USER)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data), 1)

        ####
        # Check enrolled teams of user being invited (None)
        res = self.get(url="/team", user=self.NO_ROLE_USER)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertEqual(len(data["teams"]), 0)

        ####
        # Respond To Invite -- Recipient (Valid)
        res = self.patch(
            "/invite",
            payload={"invitation_id": INVITATION_ID, "response": "Accepted"},
            user=self.NO_ROLE_USER,
        )
        self.assertEqual(res.status_code, 200)

        #####
        # Get Invitations  -- Success
        res = self.get("/invite", user=self.NO_ROLE_USER)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data), 0)  # Accepted Invitation Does not appear.

        res = self.get(url="/team", user=self.NO_ROLE_USER)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        teams = data["teams"]
        self.assertEqual(len(teams), 1)
        self.assertEqual(data["teams"][0]["team_id"], TEAM_ID)  # User was added to Team

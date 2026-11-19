import logging
from pydantic import PositiveInt
from rest_framework import status
from ninja import Router
from django.db import transaction
from django.http import JsonResponse
from api.ninja_authentication import NinjaAnyRoleRequired, NinjaRoleRequired
from api.models.app_report import BugReport
from . import CreateBugReportInSchema
from api.schemas.app_report import SingleBugReportOut
from api.schemas.app_report.bug_report_out import BugReportResponseOut
from api.constants import WellKnownRoles

ROOT_PATH = "/app_report"
router = Router(auth=NinjaAnyRoleRequired())

log = logging.getLogger(__name__)


@router.post("/bug_report", response={201: dict, 403: str})
def create_bug_report(request, data: CreateBugReportInSchema):
    """
    Endpoint to create a bug report.
    """
    with transaction.atomic():
        payload = data.model_dump(mode="python", exclude_unset=True)

        bug_report = BugReport.objects.create(
            **payload,
            created_by=request.auth,
        )
        return JsonResponse(data={"id": bug_report.id}, status=status.HTTP_201_CREATED)


@router.get(
    "/bug_report",
    response=BugReportResponseOut,
    auth=NinjaRoleRequired(
        WellKnownRoles.ADMINISTRATOR, WellKnownRoles.MASTER_ADMINISTRATOR
    ),
)
def get_bug_reports(request):
    """
    Endpoint to get all bug reports.
    If Admin, return all bug reports. If not Admin, return None
    """
    return {"entries": BugReport.objects.all()}


@router.get(
    "/bug_report/{bug_report_id}",
    response={200: SingleBugReportOut, 403: dict},
    auth=NinjaRoleRequired(
        WellKnownRoles.ADMINISTRATOR, WellKnownRoles.MASTER_ADMINISTRATOR
    ),
)
def get_bug_report(request, bug_report_id: PositiveInt):
    """
    Endpoint to get specified bug report.
    """
    bug_report = BugReport.objects.filter(id=bug_report_id).first()

    if not bug_report:
        return JsonResponse(
            status=status.HTTP_403_FORBIDDEN,
            data={"detail": "No bug report found"},
        )

    return bug_report

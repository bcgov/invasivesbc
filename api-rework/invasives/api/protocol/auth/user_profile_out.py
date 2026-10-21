from ninja import ModelSchema
from typing import List, Optional
from api.models.auth import User, PACNumber, AgencyAssociation, EmployerAssociation
from api.models.activity import ActivitySubtypes
from api.models.codes.code_tables import ServiceLicenseNumberAndCompany


class UserProfileOut(ModelSchema):
    employers: List[str]
    funding_agencies: List[str]
    pac_number: Optional[int] = None  # TODO: Should be Int
    pac_service_numbers: List[str]
    roles: List[str]
    write_privilege: List[str]

    class Meta:
        model = User
        fields = (
            "subject",
            "display_name",
            "email",
            "is_active",
            "phone_number",
            "expiry_date",
        )

    @staticmethod
    def resolve_pac_number(obj) -> str | None:  # TODO: Should be int
        """Individuals Pesticide Application Certificate Number"""
        # @TODO Update when fields adjusted
        pacs: str = (
            PACNumber.objects.filter(user=obj).values_list("number", flat=True).first()
        )

        if not pacs:
            return None
        return pacs

    @staticmethod
    def resolve_pac_service_numbers(obj) -> List[str]:
        """Pesticide Application Certificate Numbers for a Company the user is registered with."""
        # @TODO Update when fields adjusted
        pacs: List[str] = PACNumber.objects.filter(user=obj).values_list(
            "number", flat=True
        )
        if not pacs:
            return []
        return ServiceLicenseNumberAndCompany.objects.filter(pk__in=pacs).values_list(
            "code", flat=True
        )

    @staticmethod
    def resolve_roles(obj):
        return [role.description for role in obj.roles.all()]

    @staticmethod
    def resolve_employers(obj) -> List[str]:
        return (
            EmployerAssociation.objects.filter(user=obj).values_list(
                "employer__full", flat=True
            )
            or []
        )

    @staticmethod
    def resolve_funding_agencies(obj) -> List[str]:
        return (
            AgencyAssociation.objects.filter(user=obj).values_list(
                "agency__full", flat=True
            )
            or []
        )

    @staticmethod
    def resolve_write_privilege(obj) -> List[str]:
        """Activities a user can create records for"""
        if obj.roles.all().count() > 0:
            return [ast.name for ast in ActivitySubtypes]
        return []

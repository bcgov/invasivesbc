from django.db import models
from api.models.activity import RepeatedFormData
from api.models.codes.code_tables import FundingAgencyCode


class FundingAgency(RepeatedFormData):
    agency = models.ForeignKey(FundingAgencyCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."funding_agency"'
        db_table_comment = "Agencies funding the activity."

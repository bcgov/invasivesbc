from django.db import models
from api.models.activity import RepeatedFormData, DraftRepeatedFormData
from api.models.codes.code_tables import FundingAgencyCode


class FundingAgencyMixin(models.Model):
    agency = models.ForeignKey(FundingAgencyCode, on_delete=models.PROTECT)

    class Meta:
        abstract = True


class FundingAgency(FundingAgencyMixin, RepeatedFormData):
    class Meta:
        db_table = '"activity"."funding_agency"'
        db_table_comment = "Agencies funding the activity."


class DraftFundingAgency(FundingAgencyMixin, DraftRepeatedFormData):

    class Meta:
        db_table = '"draft_activity"."funding_agency"'
        db_table_comment = "Agencies funding the activity."

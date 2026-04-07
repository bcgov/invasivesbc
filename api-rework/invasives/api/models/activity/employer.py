from django.db import models
from api.models.activity import RepeatedFormData
from api.models.codes.code_tables import EmployerCode


class Employer(RepeatedFormData):
    employer = models.ForeignKey(EmployerCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."employer"'
        db_table_comment = "Employer of the person filling out the activity form. Generally a 1:1 Relation."

    def __str__(self):
        return f"{self.activity.short_id}: {self.employer.full}"

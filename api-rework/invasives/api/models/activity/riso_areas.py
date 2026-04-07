from django.db import models
from api.models.activity import RepeatedFormData


class RisoArea(RepeatedFormData):
    """
    Regional Invasive Species Organization (RISO) areas
    Non-User submitted Field. Generated after an activity submission based on latest geo data
    One Geolocation may be contained by overlapping RISO areas
    """

    organization = models.CharField(max_length=62, db_index=True)

    class Meta:
        db_table = '"activity"."riso_area"'
        db_table_comment = "Regional Invasive Species Organization (RISO) areas"

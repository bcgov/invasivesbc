from django.db import models
from django.contrib.gis.db.models import GeometryField
from django.db.models import F, Value
from django.db.models.functions import Concat


class ZoneOfInterest(models.Model):
    id = models.BigAutoField(primary_key=True, editable=False)
    public_id = models.GeneratedField(
        expression=Concat(Value("H"), F("id"), output_field=models.CharField()),
        output_field=models.CharField(max_length=32),
        db_persist=True,
        unique=True,
        editable=False,
        db_comment="Public ID to differentiate from other IDs e.g. IAPP Sites",
    )
    shape = GeometryField(
        srid=3005, spatial_index=True, geography=False, null=False, blank=False
    )

    ID_PREFIX = "H"

    class Meta:
        db_table = '"mapping"."zone_of_interest_hex_grid"'
        db_table_comment = "Hexagon Grid for defining Zones of Interest"

from django.db import models
from django.db.models import CASCADE

from api.models.mixins.dated import Dated
from api.models.mixins.owned import OptionallyOwned


class MapGenerationIntermediateResult(OptionallyOwned, Dated, models.Model):

    id = models.AutoField(primary_key=True, null=False, blank=False)

    tiles_downloaded = models.PositiveIntegerField(
        default=0,
        null=False,
        db_comment="Number of tiles downloaded. Updated periodically during download operation for progress reporting",
    )

    cache_hits = models.PositiveIntegerField(
        null=True,
        blank=True,
        db_comment="Used to track caching effectiveness. May be removed in future",
    )

    cache_misses = models.PositiveIntegerField(
        null=True,
        blank=True,
        db_comment="Used to track caching effectiveness. May be removed in future",
    )

    remaining_tiles = models.PositiveIntegerField(null=True, blank=True)

    generation_request = models.OneToOneField(
        "RasterMapGenerationRequest",
        on_delete=CASCADE,
        blank=True,
        null=True,
        db_comment="Optional map generation request that caused this record to be created (may be null for system-generated maps)",
    )

    status_information = models.TextField(
        db_comment="Diagnostic information from the map generation processor",
        null=False,
        default="",
    )

    seconds_elapsed = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        db_table = '"activity"."raster_map_generation_intermediate_result"'
        db_table_comment = "Temporary record with intermediate results of generation request (for reporting download progress to client, and cache statistics tracking)"

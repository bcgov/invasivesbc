from api.models.cache.cached import Cached
from django.db import models


class CachedRasterTile(Cached):

    data = models.BinaryField(max_length=512 * 1024, null=False)

    class Meta:
        db_table = '"cache"."raster_tile"'

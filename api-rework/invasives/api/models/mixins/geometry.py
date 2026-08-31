from decimal import Decimal

from django.contrib.gis.db import models as geomodels
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from ninja.orm import register_field

register_field("GeometryField", dict)
MAX_AREA = 500000


class GeometryMixin(models.Model):
    """
    Geometry details for an activity Record
    consumed by:
      - All Activity Types
    @TODO: Constrain to BC Geometry
    """

    area_m = models.PositiveBigIntegerField(
        validators=[MaxValueValidator(MAX_AREA)], null=True
    )
    utm_zone = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(7), MaxValueValidator(12)], null=True
    )
    utm_easting = models.PositiveBigIntegerField(null=True)
    utm_northing = models.PositiveBigIntegerField(null=True)
    latitude: models.DecimalField[Decimal | None, Decimal | None] = models.DecimalField(
        max_digits=10, decimal_places=7, null=True
    )
    longitude: models.DecimalField[Decimal | None, Decimal | None] = (
        models.DecimalField(max_digits=10, decimal_places=7, null=True)
    )
    location_description = models.CharField(max_length=16384, null=True)

    shape = geomodels.GeometryField(
        srid=4326, geography=False, spatial_index=True, null=False
    )
    shape_radius = models.DecimalField(
        max_digits=17,
        decimal_places=16,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
    )
    computed_tile_shape = geomodels.GeometryField(
        srid=3857,
        spatial_index=True,
        geography=False,
        null=False,
        blank=True,
        db_comment="Baked spatial reference for vector tiles generation.",
    )

    computed_map_symbol = models.CharField(
        max_length=128,
        null=False,
        blank=True,
    )

    class Meta:
        abstract = True

    def clean(self):
        if self.shape:
            vt_geom = self.shape.clone()
            vt_geom.transform(3857)
            self.computed_tile_shape = vt_geom
        # Check Geometry/Lat/Long are in BC.
        # Check radius is shape is point. No radius is shape is not point.
        super().clean()

        plant_codes = self.get_invasive_plant_codes()
        self.computed_map_symbol = ", ".join(plant_codes)

    def save(self, *args, **kwargs):
        if self.shape:
            vt_geom = self.shape.clone()
            vt_geom.transform(3857)
            self.computed_tile_shape = vt_geom
        super().save(*args, **kwargs)


class Geometry(GeometryMixin):
    class Meta:
        abstract = True

    def clean(self):
        vt_geom = self.shape.clone()
        vt_geom.transform(3857)
        self.computed_tile_shape = vt_geom
        # Check Geometry/Lat/Long are in BC.
        # Check radius is shape is point. No radius is shape is not point.
        super().clean()

        plant_codes = self.get_invasive_plant_codes()
        self.computed_map_symbol = ", ".join(plant_codes)

    def save(self, *args, **kwargs):
        vt_geom = self.shape.clone()
        vt_geom.transform(3857)
        self.computed_tile_shape = vt_geom
        super().save(*args, **kwargs)

    def get_invasive_plant_codes(self):
        from api.utils.filtered_activity_queryset import FilteredActivityQueryset

        ALL_PLANT_PATHS = FilteredActivityQueryset().ALL_PLANT_PATHS
        codes = set()
        for path in ALL_PLANT_PATHS:
            values = (
                type(self)
                .objects.filter(pk=self.pk)
                .values_list(path + "__code", flat=True)
            )
            for val in values:
                if val:
                    codes.add(val)

        return sorted(codes)


class DraftGeometry(GeometryMixin):
    location_description = models.CharField(max_length=16384, null=True, blank=True)
    area_m = models.PositiveBigIntegerField(null=True, blank=True)
    utm_zone = models.PositiveSmallIntegerField(null=True, blank=True)
    utm_easting = models.PositiveBigIntegerField(null=True, blank=True)
    utm_northing = models.PositiveBigIntegerField(null=True, blank=True)
    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True,
    )
    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True,
    )
    shape = geomodels.GeometryField(
        srid=4326,
        geography=False,
        spatial_index=True,
        null=True,
        blank=True,
    )
    computed_tile_shape = geomodels.GeometryField(
        srid=3857,
        spatial_index=True,
        geography=False,
        null=True,
        blank=True,
        db_comment="Baked spatial reference for vector tiles generation.",
    )

    def get_invasive_plant_codes(self):
        from api.utils.filtered_activity_queryset import FilteredActivityQueryset

        ALL_PLANT_PATHS = FilteredActivityQueryset(draft_override=True).ALL_PLANT_PATHS
        codes = set()
        for path in ALL_PLANT_PATHS:
            values = (
                type(self)
                .objects.filter(pk=self.pk)
                .values_list(path + "__code", flat=True)
            )
            for val in values:
                if val:
                    codes.add(val)

        return sorted(codes)

    class Meta:
        abstract = True

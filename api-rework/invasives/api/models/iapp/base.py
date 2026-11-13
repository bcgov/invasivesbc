"""
Shared pieces for the historical IAPP models.

IAPP data is read-only history, so values from code tables are stored as-is rather than
normalized into code models. Calendar dates (manually entered, local) are DateFields and
must never be timezone-converted. Optional values are `null=True, blank=True` so
`full_clean()` accepts them; non-null text may be empty because legacy data allows it.
"""

from django.db import models


def char(max_length: int, null: bool = False) -> models.CharField:
    return models.CharField(max_length=max_length, null=null, blank=True)


def integer(null: bool = False) -> models.IntegerField:
    return models.IntegerField(null=null, blank=null)


def big_integer(null: bool = False) -> models.BigIntegerField:
    return models.BigIntegerField(null=null, blank=null)


def decimal(
    max_digits: int, decimal_places: int, null: bool = False
) -> models.DecimalField:
    return models.DecimalField(
        max_digits=max_digits, decimal_places=decimal_places, null=null, blank=null
    )


def calendar_date(null: bool = False) -> models.DateField:
    return models.DateField(null=null, blank=null)


def wall_time(null: bool = False) -> models.TimeField:
    return models.TimeField(null=null, blank=null)


class IAPPSiteAttributes(models.Model):
    """Site attributes repeated on every extract row (mirrors LegacyIAPPSiteAttributes)."""

    site_paper_file_id = char(120, null=True)
    district_lot_number = char(6, null=True)
    jurisdictions = char(1000)
    site_created_date = calendar_date(null=True)
    mapsheet = char(10)
    utm_zone = integer()
    utm_easting = integer()
    utm_northing = integer()
    decimal_latitude = decimal(7, 5, null=True)
    decimal_longitude = decimal(8, 5, null=True)
    biogeoclimatic_zone = char(5)
    sub_zone = char(5)
    variant = integer(null=True)
    phase = char(5, null=True)
    site_series = char(5, null=True)
    soil_texture = char(120, null=True)
    site_specific_use = char(120)
    invasive_plant = char(100)
    site_location = char(2000, null=True)
    site_comments = char(2000, null=True)
    entered_by = char(100)
    date_entered = calendar_date()
    updated_by = char(100)
    date_updated = calendar_date()
    regional_district = char(200, null=True)
    regional_invasive_species_organization = char(200, null=True)
    invasive_plant_management_area = char(200, null=True)
    protected = models.BooleanField()

    class Meta:
        abstract = True


class IAPPBioDamageFlags(models.Model):
    foliar_feeding_damage = models.BooleanField()
    rootfeeding_damage = models.BooleanField()
    seedfeeding_damage = models.BooleanField()
    oviposition_marks = models.BooleanField()
    eggs_present = models.BooleanField()
    larvae_present = models.BooleanField()
    pupae_present = models.BooleanField()
    adults_present = models.BooleanField()
    tunnels_present = models.BooleanField()

    class Meta:
        abstract = True

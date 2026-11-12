from django.db import models

from api.models.iapp.base import big_integer, calendar_date, char
from api.models.iapp.site import IAPPSite


class IAPPImportedImage(models.Model):
    id = models.IntegerField(primary_key=True)
    original_iapp_id = big_integer()
    perspective_code = char(1, null=True)
    sample_point_id = big_integer(null=True)
    # Raw legacy site_id: 0 or null when the image is attached via a treatment.
    site_id = big_integer(null=True)
    treatment_id = big_integer(null=True)
    image_date = calendar_date()
    reference_no = char(20)
    comments = models.TextField(null=True, blank=True)
    detected_mime_type = char(255, null=True)
    # Server-generated timestamp, stored naive in the legacy DB and interpreted as UTC.
    imported_at = models.DateTimeField()
    revision_count_at_import_time = big_integer()
    media_key = char(255, null=True)
    # Site resolved through iapp_imported_images_map.
    mapped_site = models.ForeignKey(
        IAPPSite,
        on_delete=models.CASCADE,
        db_column="mapped_site_id",
        related_name="images",
    )

    class Meta:
        db_table = '"iapp"."imported_image"'

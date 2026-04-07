from django.db import models

from api.models.activity import RepeatedFormData


class UploadedImage(RepeatedFormData):
    """
    Details for User Uploaded Photos
    """

    file_name = models.CharField(
        max_length=256, db_comment="Image file name, required for S3 fetching"
    )
    description = models.CharField(
        max_length=256,
        db_comment="User submitted details for an image. Generally an image title",
    )

    class Meta:
        db_table = '"activity"."uploaded_image"'
        db_table_comment = "Image uploads for IBC Records"

import uuid
from django.db import models
from api.utils.fetch_s3_activity_photos import FetchS3MediaFiles

from api.models.activity import RepeatedFormData


class UploadedImageManager(models.Manager):
    def create(self, **kwargs):
        encoded_file = kwargs.pop("encoded_file", None)
        if not encoded_file:
            raise ValueError({"encoded_file": "No Encoded File Provided"})

        instance = self.model(**kwargs)

        instance.file_name = instance._create_file_name(instance.file_name)
        success = FetchS3MediaFiles().upload_b64_encoded_image(
            b64_image=encoded_file, file_name=instance.file_name
        )

        if not success:
            raise ValueError({"encoded_file": "An Error occurred during S3 upload."})

        instance.save(using=self._db)
        return instance


class UploadedImage(RepeatedFormData):
    """
    Details for User Uploaded Photos
    """

    objects = UploadedImageManager()

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

    def _create_file_name(self, provided_name) -> str:
        """Convert users supplied file's name to provided name"""
        ext = provided_name.split(".")[-1]
        id = uuid.uuid4().hex
        prescribed_name = f"IBC-{id}.{ext}"
        return prescribed_name

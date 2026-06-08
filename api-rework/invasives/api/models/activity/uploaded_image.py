import hashlib
from django.db import models
from api.utils.s3_media_files import S3MediaFiles

from api.models.activity import RepeatedFormData


class UploadedImageManager(models.Manager):
    def get_or_create(self, **kwargs):
        """
        Idempotently gets or creates an image record.
        Hashes file content and activity ID to block duplicate S3 uploads.
        """

        # Remove encoded_file, as is not property.
        encoded_file: str = kwargs.pop("encoded_file", None)
        if not encoded_file:
            raise ValueError({"encoded_file": "No Encoded File Provided"})

        instance = self.model(**kwargs)

        # Create a filename based on the hashed activity id + b64 image
        activity_id = str(instance.activity_data_record.activity_id)
        extension = instance.file_name.split(".")[-1]

        hasher = hashlib.md5()
        hasher.update(activity_id.encode("utf-8"))
        hasher.update(encoded_file.encode("utf-8"))
        hashed_string = hasher.hexdigest()

        generated_file_name = f"IBC-{hashed_string}.{extension}"

        # Check if this file already exists
        existing_image = self.filter(file_name=generated_file_name).first()
        if existing_image:
            return existing_image, False

        instance.file_name = generated_file_name

        success = S3MediaFiles().upload_b64_encoded_image(
            b64_image=encoded_file, file_name=instance.file_name
        )

        if not success:
            raise ValueError({"encoded_file": "An Error occurred during S3 upload."})

        instance.save(using=self._db)
        return instance, True

    def create(self, **kwargs):
        """Use Deduplication logic in get_or_create, but only return the instance"""
        instance, created = self.get_or_create(**kwargs)
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

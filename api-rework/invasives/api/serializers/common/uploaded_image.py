from rest_framework import serializers
from api.models.activity import UploadedImage, DraftUploadedImage
from api.utils.s3_media_files import S3MediaFiles


class BaseSerializer(serializers.ModelSerializer):
    file_name = serializers.CharField()
    description = serializers.CharField()
    encoded_file = serializers.CharField(required=True, write_only=True)

    class Meta:
        abstract = True
        fields = (
            "file_name",
            "description",
            "encoded_file",
        )

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Inject the base64 string from S3 into the response
        try:
            ret["encoded_file"] = S3MediaFiles().get_b64_encoded_image(
                instance.file_name
            )
        except Exception:
            ret["encoded_file"] = None
        return ret


class UploadedImageSerializer(BaseSerializer):

    class Meta(BaseSerializer.Meta):
        model = UploadedImage


class DraftUploadedImageSerializer(BaseSerializer):

    class Meta(BaseSerializer.Meta):
        model = DraftUploadedImage

import boto3, base64, io, logging
from botocore.exceptions import ClientError
from invasivesbc.settings import (
    OBJECT_STORE_SECRET_ACCESS_KEY,
    OBJECT_STORE_ACCESS_KEY_ID,
    OBJECT_STORE_ENDPOINT_URL,
    OBJECT_STORE_PHOTO_UPLOAD_BUCKET,
    OBJECT_STORE_REGION,
)

log = logging.getLogger(__name__)


class S3MediaFiles:

    def __init__(self):
        self.s3_client = boto3.client(
            "s3",
            endpoint_url=OBJECT_STORE_ENDPOINT_URL,
            aws_access_key_id=OBJECT_STORE_ACCESS_KEY_ID,
            aws_secret_access_key=OBJECT_STORE_SECRET_ACCESS_KEY,
            region_name=OBJECT_STORE_REGION,
            aws_session_token=None,
            config=boto3.session.Config(
                signature_version="s3v4",
                request_checksum_calculation="when_required",
                response_checksum_validation="when_required",
            ),
        )

    def get_image(self, file_name):
        """
        Fetch Image from S3 bucket
        """
        response = self.s3_client.get_object(
            Key=file_name, Bucket=OBJECT_STORE_PHOTO_UPLOAD_BUCKET
        )
        return response["Body"]

    def get_b64_encoded_image(self, file_name):
        """
        Take Raw image obtained from S3 and convert into Base64 encoded image
        """
        try:

            ext = file_name.split(".")[-1].lower()
            if ext == "jpg":
                ext = "jpeg"

            raw_image = self.get_image(file_name)
            bytes = base64.b64encode(raw_image.read())
            b64_string = bytes.decode("utf-8")

            return f"data:image/{ext};base64,{b64_string}"
        except Exception:
            return None

    def _parse_b64_encoded_image_to_binary(self, b64_string: str) -> str:
        if "base64," in b64_string:
            b64_string = b64_string.split("base64,")[-1]
        return base64.b64decode(b64_string)  # binary

    def upload_b64_encoded_image(self, b64_image: str, file_name: str) -> bool:
        """Take User submitted URI Image and upload to S3"""
        try:
            binary = self._parse_b64_encoded_image_to_binary(b64_string=b64_image)
            image_buffer = io.BytesIO(binary)
            content_type = "image/jpeg"
            if file_name.lower().endswith(".png"):
                content_type = "image/png"
            self.s3_client.upload_fileobj(
                Fileobj=image_buffer,
                Bucket=OBJECT_STORE_PHOTO_UPLOAD_BUCKET,
                Key=file_name,
                ExtraArgs={"ContentType": content_type},
            )
            return True
        except ClientError as e:
            log.error(f"Error Uploading Image to S3: {e}")
            return False
        except Exception as e:
            log.error(e)
            return False

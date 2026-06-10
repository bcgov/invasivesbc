import logging
from datetime import timedelta

import boto3
from botocore.exceptions import ClientError
from celery.backends.base import DisabledBackend
from celery.result import AsyncResult
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from api.models import MapGenerationRecord, RasterMapGenerationRequest
from invasivesbc import celery_app
from invasivesbc.settings import (
    OBJECT_STORE_ENDPOINT_URL,
    OBJECT_STORE_ACCESS_KEY_ID,
    OBJECT_STORE_SECRET_ACCESS_KEY,
    OBJECT_STORE_REGION,
    OBJECT_STORE_MAP_UPLOAD_BUCKET,
)

MAP_EXPIRATION_GRACE_PERIOD = timedelta(hours=6)
MAP_REQUEST_QUEUE_GRACE_PERIOD = timedelta(minutes=2)


@celery_app.task
def flag_stale_requests():
    result = RasterMapGenerationRequest.objects.filter(
        Q(updated__lt=timezone.now() - MAP_REQUEST_QUEUE_GRACE_PERIOD)
        & Q(status="PENDING")
    )

    for record in result:
        logging.info(
            "Map generation request {0} for user {1} has been in state {2} for {3} - task {4} [celery task state {5}]".format(
                record.trip_name,
                record.owner,
                record.status,
                (timezone.now() - record.updated).__str__(),
                record.celery_task_id,
                (
                    AsyncResult(record.celery_task_id, app=celery_app).state
                    if not isinstance(celery_app.backend, DisabledBackend)
                    else "NOT AVAILABLE"
                ),
            )
        )


@celery_app.task
def expire_generated_maps():
    result = MapGenerationRecord.objects.filter(
        expires__lt=timezone.now() + MAP_EXPIRATION_GRACE_PERIOD
    )

    s3_client = boto3.client(
        "s3",
        endpoint_url=OBJECT_STORE_ENDPOINT_URL,
        aws_access_key_id=OBJECT_STORE_ACCESS_KEY_ID,
        aws_secret_access_key=OBJECT_STORE_SECRET_ACCESS_KEY,
        aws_session_token=None,
        region_name=OBJECT_STORE_REGION,
        config=boto3.session.Config(
            signature_version="s3v4",
            request_checksum_calculation="when_required",
            response_checksum_validation="when_required",
        ),
    )

    for record in result:
        logging.info(
            "Expiring stale map {0}, expired for {1}".format(
                record.file_name, (timezone.now() - record.expires).__str__()
            )
        )
        try:
            s3_client.delete_object(
                Bucket=OBJECT_STORE_MAP_UPLOAD_BUCKET, Key=record.file_name
            )
            with transaction.atomic():
                RasterMapGenerationRequest.objects.filter(
                    mapgenerationrecord=record
                ).update(status="EXPIRED")
                record.delete()
        except ClientError as e:
            logging.error("Could not delete map file: {0}".format(e))

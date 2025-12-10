from django.db import models
import uuid, datetime
from ..enums.form_status import FormStatus
from ..enums.activity_type import ActivityType
from ..codes import ActivitySubtypeCode

UUID_SUBSTRING_LENGTH = 8

class ActivityBasic(models.Model):
  activity_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
  short_id = models.CharField(
    max_length=16,
    db_comment="User Readable formatted ID",
    editable=False,
    blank=False
  )
  activity_type = models.CharField(
    choices=ActivityType,
    blank=False
  )
  activity_subtype = models.ForeignKey(
    ActivitySubtypeCode,
    on_delete=models.RESTRICT,
    blank=False
  )
  activity_date = models.DateField(blank=False)
  created_by = models.CharField(max_length=64, blank=False)
  form_status = models.CharField(
    max_length=16,
    choices=FormStatus,
    default=FormStatus.Draft.value
  )
  access_description = models.TextField(max_length=1024, blank=True)
  comment = models.TextField(max_length=1024, blank=True)
  created_timestamp = models.DateTimeField(auto_now_add=True)
  received_timestamp = models.DateTimeField(auto_now_add=True, editable=False)

  def __str__(self):
    return self.short_id

  def save(self, *args, **kwargs):
    if not self.short_id: # Create new ShortID
      try:
        subtype = ActivitySubtypeCode.objects.get(pk=self.activity_subtype).short_id_format
        uuid_substr = str(self.activity_id)[:UUID_SUBSTRING_LENGTH].upper() # 21bAcd -> 21BACD
        year = datetime.datetime.now().strftime('%y')
        ## Assign formatted short_id
        self.short_id = f"{year}{subtype}{uuid_substr}"
      except ActivitySubtypeCode.DoesNotExist:
        print(f"Subtype not found in database: {self.activity_subtype}")
        raise ActivitySubtypeCode.DoesNotExist
    super().save(*args, **kwargs)

  class Meta:
    db_table_comment="Base fields for an activity. All records contain this information"

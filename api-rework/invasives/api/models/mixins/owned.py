from django.db import models


class OptionallyOwned(models.Model):

  owner = models.ForeignKey(
    "User",
    on_delete=models.CASCADE,
    null=True,
    blank=True,
    db_comment="Owner of this record (nullable)",
  )

  class Meta:
    abstract = True

class Owned(models.Model):

  owner = models.ForeignKey(
    "User",
    on_delete=models.CASCADE,
    null=False,
    db_comment="Owner of this record",
  )

  class Meta:
    abstract = True

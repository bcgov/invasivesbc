from django.db import models
from django.core.exceptions import ValidationError
import datetime

class BaseCode(models.Model):
  code = models.CharField(primary_key=True, max_length=64)
  full = models.CharField(max_length=128)
  code_sort_order = models.PositiveSmallIntegerField(default=0)
  valid_from = models.DateField(auto_now_add=True)
  valid_to = models.DateField(null=True)
  created_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return self.code

  def clean(self):
    """
    Model-level validation
    """
    ## Ensure the valid_to date occurs after the valid_from date. a valid_from date is empty on first entry, so check against current time.
    if self.valid_to and self.valid_from and self.valid_to < self.valid_from or \
       self.valid_to and not self.valid_from and self.valid_to < datetime.date.today():
      raise ValidationError({"valid_to": "valid_to must be greater than or equal to valid_from."})
    if self.code_sort_order is not None and self.code_sort_order < 0:
      raise ValidationError({"code_sort_order": "code_sort_order cannot be negative"})

  def valid_for_use(self, at_time=None):
    """
    Determine if code is active at given point in time.
    """
    at_time = at_time or datetime.datetime.now()

    if self.valid_to is None:
      return self.valid_from <= at_time
    return self.valid_from <= at_time <= self.valid_to

  class Meta:
    abstract=True
    ordering=['code_sort_order', 'full']
    unique_together=[['code', 'full']]
    constraints = [
      models.CheckConstraint(
        condition=models.Q(code_sort_order__gte=0),
        name="code_sort_order_non_negative"
      )
    ]

from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.db.models import BooleanField, Case, Q, Value, When
from django.db.models.functions import Now
from django.utils import timezone


class TemporalAssociationQuerySet(models.QuerySet):
    """
    QuerySet helpers shared by temporal association mixins.
    """

    @staticmethod
    def _current_q():
        now = Now()
        return (Q(effective__isnull=True) | Q(effective__lte=now)) & (
            Q(expires__isnull=True) | Q(expires__gte=now)
        )

    def with_is_current(self):
        """
        Annotate the queryset with `is_current`, computed from the
        database's current_timestamp rather than from application time.
        """
        return self.annotate(
            is_current=Case(
                When(self._current_q(), then=Value(True)),
                default=Value(False),
                output_field=BooleanField(),
            )
        )

    def currently_valid(self):
        return self.with_is_current().filter(is_current=True)


class TemporalAssociationManager(
    models.Manager.from_queryset(TemporalAssociationQuerySet)
):
    def get_queryset(self):
        return super().get_queryset().with_is_current()


class TemporalAssociation(models.Model):
    """
    Abstract base reflecting a temporal association between a User and some
    code model. `effective` and `expires` are both nullable:

    - `effective` null means the association has always been effective
      (no lower bound).
    - `expires` null means the association has not yet expired or been
      superseded (no upper bound).
    """

    user = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        null=False,
        related_name="%(class)ss",
        db_comment="User this temporal association applies to",
    )
    effective = models.DateTimeField(
        null=True,
        blank=True,
        db_comment="Start of validity for this association. Null means always effective.",
    )
    expires = models.DateTimeField(
        null=True,
        blank=True,
        db_comment="End of validity for this association. Null means not yet expired.",
    )

    objects = TemporalAssociationManager()

    class Meta:
        abstract = True

    def clean(self):
        super().clean()
        if (
            self.effective is not None
            and self.expires is not None
            and self.expires < self.effective
        ):
            raise ValidationError({"expires": "expires must be on or after effective."})

    def valid_at(self, at_time=None) -> bool:
        """
        Determine whether this association is valid at the given point in
        time (defaults to now). This can be used, for example, to determine
        who a user's employer was on a given historical date.
        """
        at_time = at_time or timezone.now()
        if self.effective is not None and at_time < self.effective:
            return False
        if self.expires is not None and at_time > self.expires:
            return False
        return True

    def overlaps(self, other: "TemporalAssociation") -> bool:
        """
        Determine whether this association's validity period overlaps with
        another's, treating null effective/expires as unbounded.
        """
        if (
            self.expires is not None
            and other.effective is not None
            and self.expires < other.effective
        ):
            return False
        if (
            other.expires is not None
            and self.effective is not None
            and other.expires < self.effective
        ):
            return False
        return True


class NonExclusiveTemporalAssociation(TemporalAssociation):
    """
    Permits multiple concurrently-valid associations for the same user (e.g.
    a user may hold several concurrent applicator license codes).
    """

    class Meta:
        abstract = True


class ExclusiveTemporalAssociation(TemporalAssociation):
    """
    Prevents two instances from being concurrently valid for the same user
    (e.g. a user may have only one primary employer at a time).
    """

    class Meta:
        abstract = True

    def _conflicting_queryset(self):
        qs = type(self).objects.filter(user=self.user)
        if self.pk is not None:
            qs = qs.exclude(pk=self.pk)
        return qs

    def _validate_no_overlap(self):
        for sibling in self._conflicting_queryset():
            if self.overlaps(sibling):
                raise ValidationError(
                    "This association overlaps with an existing, concurrently "
                    "valid association for this user."
                )

    def clean(self):
        super().clean()
        self._validate_no_overlap()

    def save(self, *args, **kwargs):
        with transaction.atomic():
            # Lock any existing rows for this user to guard against
            # concurrent writes creating overlapping associations.
            list(self._conflicting_queryset().select_for_update())
            self._validate_no_overlap()
            super().save(*args, **kwargs)

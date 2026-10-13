import datetime

from api.models.codes import EmployerCode
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.test import TestCase
from django.utils import timezone

from api.models.auth import (
    EmployerAssociation,
    PACNumber,
    User,
)


def dt(*args, **kwargs):
    return timezone.make_aware(datetime.datetime(*args, **kwargs))


class TemporalAssociationValidityTests(TestCase):
    """
    Tests for `valid_at` and the null-handling semantics of `effective` and
    `expires`, exercised via PACNumber (NonExclusiveTemporalAssociation).
    """

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create(subject="temporal-user-1")

    def test_bounded_association_valid_within_range_only(self):
        pac = PACNumber.objects.create(
            user=self.user,
            number="PAC-BOUNDED-1",
            effective=dt(2024, 1, 1),
            expires=dt(2024, 12, 31),
        )
        self.assertTrue(pac.valid_at(dt(2024, 6, 1)))
        self.assertTrue(pac.valid_at(dt(2024, 1, 1)))
        self.assertTrue(pac.valid_at(dt(2024, 12, 31)))
        self.assertFalse(pac.valid_at(dt(2023, 12, 31)))
        self.assertFalse(pac.valid_at(dt(2025, 1, 1)))

    def test_null_effective_means_always_effective(self):
        pac = PACNumber.objects.create(
            user=self.user,
            number="PAC-NO-START",
            effective=None,
            expires=dt(2024, 12, 31),
        )
        self.assertTrue(pac.valid_at(dt(1900, 1, 1)))
        self.assertTrue(pac.valid_at(dt(2024, 12, 31)))
        self.assertFalse(pac.valid_at(dt(2025, 1, 1)))

    def test_null_expires_means_not_yet_expired(self):
        pac = PACNumber.objects.create(
            user=self.user,
            number="PAC-NO-END",
            effective=dt(2024, 1, 1),
            expires=None,
        )
        self.assertFalse(pac.valid_at(dt(2023, 12, 31)))
        self.assertTrue(pac.valid_at(dt(2024, 1, 1)))
        self.assertTrue(pac.valid_at(dt(2100, 1, 1)))

    def test_both_null_means_always_valid(self):
        pac = PACNumber.objects.create(
            user=self.user, number="PAC-ALWAYS", effective=None, expires=None
        )
        self.assertTrue(pac.valid_at(dt(1900, 1, 1)))
        self.assertTrue(pac.valid_at(dt(2100, 1, 1)))

    def test_valid_at_defaults_to_now(self):
        past = timezone.now() - datetime.timedelta(days=1)
        future = timezone.now() + datetime.timedelta(days=1)
        current = PACNumber.objects.create(
            user=self.user, number="PAC-CURRENT", effective=past, expires=future
        )
        expired = PACNumber.objects.create(
            user=self.user,
            number="PAC-EXPIRED",
            effective=past - datetime.timedelta(days=10),
            expires=past,
        )
        self.assertTrue(current.valid_at())
        self.assertFalse(expired.valid_at(timezone.now() + datetime.timedelta(days=2)))

    def test_clean_rejects_expires_before_effective(self):
        pac = PACNumber(
            user=self.user,
            number="PAC-INVALID-RANGE",
            effective=dt(2024, 6, 1),
            expires=dt(2024, 1, 1),
        )
        with self.assertRaises(ValidationError):
            pac.clean()


class TemporalAssociationQuerySetTests(TestCase):
    """
    Tests for the `is_current` queryset annotation, computed from the
    database's current_timestamp.
    """

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create(subject="temporal-user-2")
        now = timezone.now()
        cls.current_unbounded = PACNumber.objects.create(
            user=cls.user, number="PAC-CURRENT-UNBOUNDED", effective=None, expires=None
        )
        cls.current_bounded = PACNumber.objects.create(
            user=cls.user,
            number="PAC-CURRENT-BOUNDED",
            effective=now - datetime.timedelta(days=1),
            expires=now + datetime.timedelta(days=1),
        )
        cls.expired = PACNumber.objects.create(
            user=cls.user,
            number="PAC-EXPIRED",
            effective=now - datetime.timedelta(days=10),
            expires=now - datetime.timedelta(days=1),
        )
        cls.not_yet_effective = PACNumber.objects.create(
            user=cls.user,
            number="PAC-FUTURE",
            effective=now + datetime.timedelta(days=1),
            expires=None,
        )

    def test_default_manager_annotates_is_current(self):
        by_number = {p.number: p.is_current for p in PACNumber.objects.all()}
        self.assertTrue(by_number["PAC-CURRENT-UNBOUNDED"])
        self.assertTrue(by_number["PAC-CURRENT-BOUNDED"])
        self.assertFalse(by_number["PAC-EXPIRED"])
        self.assertFalse(by_number["PAC-FUTURE"])

    def test_currently_valid_filters_to_current_only(self):
        current_numbers = set(
            PACNumber.objects.currently_valid().values_list("number", flat=True)
        )
        self.assertEqual(
            current_numbers, {"PAC-CURRENT-UNBOUNDED", "PAC-CURRENT-BOUNDED"}
        )


class NonExclusiveTemporalAssociationTests(TestCase):
    """
    NonExclusiveTemporalAssociation (PACNumber, EmployerAssociation) must
    permit multiple concurrently-valid associations for the same user.
    """

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create(subject="temporal-user-3")
        cls.employer_a = EmployerCode.objects.create(code="ALTD", full="A Corp")
        cls.employer_b = EmployerCode.objects.create(code="BLTD", full="B Corp")

    def test_user_may_hold_multiple_concurrent_pac_numbers(self):
        PACNumber.objects.create(
            user=self.user, number="PAC-MULTI-1", effective=None, expires=None
        )
        # Should not raise, even though both are unboundedly concurrent.
        PACNumber.objects.create(
            user=self.user, number="PAC-MULTI-2", effective=None, expires=None
        )
        self.assertEqual(PACNumber.objects.filter(user=self.user).count(), 2)

    def test_user_may_hold_multiple_concurrent_employer_associations(self):
        EmployerAssociation.objects.create(
            user=self.user, employer=self.employer_a, effective=None, expires=None
        )
        EmployerAssociation.objects.create(
            user=self.user, employer=self.employer_b, effective=None, expires=None
        )
        self.assertEqual(EmployerAssociation.objects.filter(user=self.user).count(), 2)

from .base import BaseActivitySubtypeTest


class TerrestrialChemicalTreatmentTest(BaseActivitySubtypeTest):

    fixtures = [
        "test/subtypes/treatments/test_terrestrial_chemical_treatment_codes",
        "test/subtypes/treatments/test_terrestrial_chemical_treatment",
    ]

    def test_expect_two_activities(self):
        self.expect_two_activities()

    def test_pac_number_is_present(self):
        self.pac_number_is_present()

    def test_casting_fixture_into_serializer(self):
        self.casting_fixture_into_serializer(expected_subtype_key='well_information')

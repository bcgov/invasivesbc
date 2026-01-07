from django.test import TestCase


class TestSimple(TestCase):
    def test_simple(self):
        """Simple test to prove test suite working"""
        self.assertEqual(1 + 1, 2)

    def test_simple_two(self):
        """Another simple test to prove test suite working"""
        self.assertEqual("hello".upper(), "HELLO")

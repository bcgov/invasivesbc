from django.test import TestCase


class HelloWorld(TestCase):
    def setUp(self):
      print("Hello World")

    def test_hello_world(self):
        self.assertEqual("Hello World", "Hello World")

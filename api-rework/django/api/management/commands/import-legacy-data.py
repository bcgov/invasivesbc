from django.core.management.base import BaseCommand, CommandError

from api.models import

class Command(BaseCommand):
  help = 'A description of what your custom command does.'

  def add_arguments(self, parser):
    pass

  def handle(self, *args, **options):
    pass

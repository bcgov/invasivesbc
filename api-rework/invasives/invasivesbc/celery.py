import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "invasivesbc.settings")

app = Celery("invasivesbc")

app.config_from_object("django.conf:settings", namespace="CELERY")

app.autodiscover_tasks()

app.conf.update(
    {
        "beat_scheduler": "django_celery_beat.schedulers:DatabaseScheduler"
    }  # for scheduled (cron-like) task dispatch
)

app.conf.update(
    {
        "beat_schedule": {
            "scheduler_working_check": {
                "task": "api.tasks.scheduler_working_check.scheduler_working_check",
                "schedule": 10.0,
            }
        }
    }
    # {"cache_cleanup": {"task": "api.tasks.cache_cleanup", "schedule": 3600.0}}
)

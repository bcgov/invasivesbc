import os

from celery import Celery
from kombu import Exchange, Queue

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "invasivesbc.settings")

app = Celery("invasivesbc")

app.config_from_object("django.conf:settings", namespace="CELERY")

# enable task priority. lower priority executes earlier.

app.conf.task_queues = [
  Queue('tasks', Exchange('tasks'), routing_key='tasks',
        queue_arguments={'x-max-priority': 10}),
]

app.conf.task_queue_max_priority = 10
app.conf.task_default_priority = 5
app.conf.task_default_queue = 'tasks'


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
                "schedule": 600.0,
            }
        }
    }
    # {"cache_cleanup": {"task": "api.tasks.cache_cleanup", "schedule": 3600.0}}
)

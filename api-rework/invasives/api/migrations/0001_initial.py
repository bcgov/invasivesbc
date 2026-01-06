from django.db import migrations


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.RunSQL(
            # language=PostgreSQL
            sql="""
            create schema if not exists "codes";
            create schema if not exists "activity";
            """,
            reverse_sql=
            # language=PostgreSQL
            """
            drop schema if exists "activity";
            drop schema if exists "codes";
            """,
        )
    ]

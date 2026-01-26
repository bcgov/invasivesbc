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
            create schema if not exists "etl";
            create schema if not exists "authentication";
            """,
            reverse_sql=
            # language=PostgreSQL
            """
            drop schema if exists "etl";
            drop schema if exists "activity";
            drop schema if exists "codes";
            drop schema if exists "authentication";
            """,
        )
    ]

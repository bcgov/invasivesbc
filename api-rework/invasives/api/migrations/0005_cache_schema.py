from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [("api", "0004_plantswithbiocontrol_and_more")]

    operations = [
        migrations.RunSQL(
            # language=PostgreSQL
            sql="""
            create schema if not exists "cache";
            """,
            reverse_sql=
            # language=PostgreSQL
            """
            drop schema if exists "cache";
            """,
        )
    ]

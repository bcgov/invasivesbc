from django.db import models


class HistoricalUserName(models.Model):
    historical_username = models.CharField(
        blank=False,
        null=False,
        max_length=255,
        unique=True,
        db_index=True,
        primary_key=True,
        default="Unset",
        db_comment="Legacy (imported) username",
    )
    user = models.ForeignKey("User", on_delete=models.CASCADE)

    class Meta:
        db_table = '"authentication"."historical_user_names"'
        db_table_comment = """
          Legacy versions of the application recorded usernames inconsistently.
          During ETL, we attempt to map all the possible names a user may have had during various iterations of the authentication implementation so we can correctly associate imported records with the actual creating user
        """

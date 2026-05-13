from django.contrib.postgres.aggregates import StringAgg


def agg(path, **kwargs):
    """
    Shorthand StringAgg to reduce repeating delimiter and distinct arguments
    """
    return StringAgg(path, delimiter=", ", distinct=True, **kwargs)

from django.contrib.postgres.aggregates import StringAgg


def agg(path):
    """
    Shorthand StringAgg to reduce repeating delimiter and distinct arguments
    """
    return StringAgg(path, delimiter=", ", distinct=True)

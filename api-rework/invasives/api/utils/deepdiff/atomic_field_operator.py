from deepdiff.operator import BaseOperator


class AtomicFieldOperator(BaseOperator):
    """
    Custom Operator for DeepDiff to treat a declared Object as one item, instead of comparing nested properties
    e.g.: GeoJSON objects.
    """

    def give_up_diffing(self, level, diff_instance):
        if level.t1 != level.t2:
            diff_instance.custom_report_result(
                "values_changed",
                level,
                {
                    "old_value": level.t1,
                    "new_value": level.t2,
                },
            )
        return True

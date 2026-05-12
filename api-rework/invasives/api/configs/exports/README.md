# Key Notes for CSV Exports

## CSV Configuration

### `entry_models`

Entry point for a "Row" in the CSV Export. Typically the model that holds the invasive plant record (unless otherwise needed). The entry supports an array of models permitting they are matching parameters.

e.g.

```py
[
  AquaticTreatmentMonitoringEntry,
  TerrestrialTreatmentMonitoringEntry,
],
```

Both Model types have identical schema where the differentiator is Aquatic vs Terrestrial Plant codes, as Treatment Monitoring entries contain both types of codes.

### `annotations`

Arrays of Dictionaries outlying the configuration for the CSV to be built from. Composed of three keys

- `label`: The visible header that will display in the CSV
- `key`: A key to prevent collisions in the namespace, generally just the column name with `_display` appended. If a duplicate key is found a cartesian join may form on the record.
- `annotation` The database path and format for the entry to occur.

If the column belongs to the Model chosen for `entry_models` you can reference the columns annotation path directly, for foreign key relationships add `_full` e.g.: `invasive_plant__full`. _Note the double underscore before full_

As most exports traverse across models, it's recommended to keep the following variable to start off the annotations

```py
ROOT = f"root_activity__activitydatarecord"
```

As the nature of the database relationships are through a composite table, most columns will require using `StringAgg` _or the shorthand `agg()`_ function in order prevent duplicate rows. this will block cartesian joins from occuring.

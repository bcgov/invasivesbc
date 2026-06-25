# Protocol Specifications

## Draft Prococols

All Draft Protocols contain the `Draft*` Prefix. Draft models provide a tolerant boundary for saving incoming records not ready for final submission.

**Naming Convention**: Always Prefixed with `Draft` e.g.: _DraftBaseChemicalDetails_

**Leniency**: Majority of payload fields are declarable as Optional, and default values to `None`.

**State Lockdown**: Explicity required `form_status: "Draft"`. This added rule blocks data degradation by preventing Active/previously submitted records from being resubmitted under a Draft State.

**Code Registry Integrity**: If a user selected code is provided in a draft payload, it is immediately evaluated against the related CodeTable.

## Submission Protocols

Submission Protocols act as the strict quality gate, ensuring data completeness and business-rule alignment prior to final processing (write)

**Inheritance Pattern**: Submission Sub-schemas inherit directly from their respective Draft classes to reuse base Field structures where appropriate. This leaves the Implementing class just needing to implement the strict validation rules without repeating optionals.

**Type Redefinition**: Properties omit the `Optional` wrapper, forcing input requirement. `Field` properties insert boundary restrictions (lt, gt, lte, gte, etc)

**Cross-field interceptors**: Complex business layer-invariants (such as summation of Jurisdiction/Shoreline percent coverage), multi-field conditionals, and date-bound checks are strictly executed using `@model_validator` and `@field_validator`

## Middleware

### `MapToCodeTable`

A special helper (Annotation class) used for fields that look up data from respective code tables. It automatically converts a simple test string sent by the frontend (e.g.: `RAIL`) into the actual Django foreign key model (`{code: 'RAIL', full: 'Other Rail', ...}`)

#### model_dump()

When using model dump with records containing code table representation, you can use the argument `(mode="json")` to get the string code value (`RAIL`)

To get the full model representation you can use no arguments `"()"` or `(mode="python")`

### `CleanSchema` Interceptor

Every (sub-)schema inherits from CleanSchema. The `before` model validator automatically scans the incoming raw request payloads and converts blank string (`""`) into explicit `None` values. This mitigates quirks in frontend serialization prior to validation.

## Union Definition

There are two union definitions: `DraftActivitySchema` and `ActivitySchema`.

Because all activities share the same core data structure, the system uses the `subtype` field to tell them apart and routing the data to the correct validator. Because the system relies entirely on this `subtype` field to know how to process the record, this field is strictly required in both draft and final submission payloads.

## Resources

- [Python Annotation](https://docs.python.org/3/howto/annotations.html)
- [Pydantic](https://pydantic.dev/docs/validation/latest/get-started)
- [Django Ninja API](https://django-ninja.dev/)

## Examples

```py
class Employer(CleanSchema): # <-- Clean schema ensures an incoming {employer: ''} becomes {employer: None}
    employer: EmployerCodeType #: Annotation that checks value belong to the Employer code table (performs conversion).

#: Strictly typed item, no optionals permitted
class LinkedActivity(CleanSchema):
    label: str
    full: str

#: Example Mapping keys to proper DB Tables (Used for ease of creating write serializers when values mismatch)
class FundingAgency(CleanSchema):
    agency: FundingAgencyCodeType = Field(..., alias="invasive_species_agency_code")

class ExampleSchema(CleanSchema):
    date: date # Converts to Date object
    id: str
    created_by: str
    form_status: Literal[FormStatus.Draft] # Ensures match with FormStatus enum
    linked_activities: List[LinkedActivity] = Field(..., min_length=2) # No default value set, Required at least 2 entries
    employer: List[Employer] # List of 0--n entries containing "Employer" objects

    utm_easting: Optional[int] # Value may be None, but key should exist in payload
    utm_northing: Optional[int] = None # Value may be None or an int, but does not need to be in payload.
    utm_zone: int # Value must exist

    # Top-level Comments
    access_description: Optional[str]
    comment: Optional[str]
    location_description: Optional[str]

    class Meta:
        abstract = True

```

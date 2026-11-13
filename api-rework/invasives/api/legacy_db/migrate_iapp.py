"""
Mapping utilities from the legacy IAPP pydantic models to Django models.

Calendar dates (DateField) and wall-clock times (TimeField) are copied untouched: they
were entered as local values and carry no timezone, so they are never converted.
The only true timestamp is `imported_at`, which is a naive server timestamp assumed to be UTC.
"""

import json
import logging
from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Any

from django.contrib.gis.geos import GEOSGeometry
from django.db import models, transaction
from pydantic import BaseModel

from api.legacy_db.iapp_serializer import (
    LegacyIAPPBiologicalDispersal,
    LegacyIAPPBiologicalMonitoring,
    LegacyIAPPBiologicalTreatment,
    LegacyIAPPChemicalMonitoring,
    LegacyIAPPChemicalTreatment,
    LegacyIAPPImportedImage,
    LegacyIAPPMechanicalMonitoring,
    LegacyIAPPMechanicalTreatment,
    LegacyIAPPSite,
    LegacyIAPPSiteSelection,
    LegacyIAPPSurvey,
)
from api.models.iapp import (
    IAPPBiologicalDispersal,
    IAPPBiologicalMonitoring,
    IAPPBiologicalTreatment,
    IAPPChemicalMonitoring,
    IAPPChemicalTreatment,
    IAPPImportedImage,
    IAPPMechanicalMonitoring,
    IAPPMechanicalTreatment,
    IAPPSite,
    IAPPSiteSelection,
    IAPPSurvey,
)

log = logging.getLogger("legacy-import")

GEOMETRY_SRID = 4326

# pydantic child class -> django model
CHILD_MODELS: dict[type[BaseModel], type[models.Model]] = {
    LegacyIAPPSiteSelection: IAPPSiteSelection,
    LegacyIAPPSurvey: IAPPSurvey,
    LegacyIAPPChemicalTreatment: IAPPChemicalTreatment,
    LegacyIAPPChemicalMonitoring: IAPPChemicalMonitoring,
    LegacyIAPPMechanicalTreatment: IAPPMechanicalTreatment,
    LegacyIAPPMechanicalMonitoring: IAPPMechanicalMonitoring,
    LegacyIAPPBiologicalTreatment: IAPPBiologicalTreatment,
    LegacyIAPPBiologicalMonitoring: IAPPBiologicalMonitoring,
    LegacyIAPPBiologicalDispersal: IAPPBiologicalDispersal,
    LegacyIAPPImportedImage: IAPPImportedImage,
}

# LegacyIAPPSite list attribute -> django model of its rows
SITE_CHILD_LISTS: dict[str, type[models.Model]] = {
    "site_selections": IAPPSiteSelection,
    "surveys": IAPPSurvey,
    "chemical_treatments": IAPPChemicalTreatment,
    "chemical_monitorings": IAPPChemicalMonitoring,
    "mechanical_treatments": IAPPMechanicalTreatment,
    "mechanical_monitorings": IAPPMechanicalMonitoring,
    "biological_treatments": IAPPBiologicalTreatment,
    "biological_monitorings": IAPPBiologicalMonitoring,
    "biological_dispersals": IAPPBiologicalDispersal,
    "images": IAPPImportedImage,
}


def convert_value(field: models.Field, value: Any) -> Any:
    """Coerce a pydantic value into the representation the django field expects."""
    if value is None:
        return None
    if isinstance(field, models.DateTimeField):
        # naive server timestamp; assumed UTC
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value
    if isinstance(field, models.DateField):
        # DateTimeField subclasses DateField, so it is handled above. A datetime here would
        # be silently shifted or truncated, so refuse it.
        if isinstance(value, datetime) or not isinstance(value, date):
            raise TypeError(
                f"{field.name} expects a calendar date, got {type(value).__name__}"
            )
        return value
    if isinstance(field, models.DecimalField):
        # str() avoids binary float noise (e.g. 0.1 -> 0.1000000000000000055...)
        return Decimal(str(value))
    return value


def convert_geometry(geometry: dict | None) -> GEOSGeometry | None:
    if geometry is None:
        return None
    return GEOSGeometry(json.dumps(geometry), srid=GEOMETRY_SRID)


def _geometries_equal(a: GEOSGeometry | None, b: GEOSGeometry | None) -> bool:
    if a is None or b is None:
        return a is None and b is None
    return a.srid == b.srid and a.equals_exact(b)


def _model_for(old: BaseModel) -> type[models.Model]:
    try:
        return CHILD_MODELS[type(old)]
    except KeyError:
        raise TypeError(f"No IAPP django model is mapped for {type(old).__name__}")


def _field_values(model: type[models.Model], old: BaseModel) -> dict[str, Any]:
    """Map pydantic field names onto django attnames (e.g. site_id -> site FK column)."""
    values = {}
    for name in type(old).model_fields:
        # get_field resolves attnames (site_id) as well as names
        field = model._meta.get_field(name)
        values[field.attname] = convert_value(field, getattr(old, name))
    return values


def map_iapp_record_to_django(old: BaseModel) -> models.Model:
    """Create an unsaved django instance for any IAPP child row (selection, survey, ...)."""
    model = _model_for(old)
    return model(**_field_values(model, old))


def update_iapp_record_from_pydantic(
    existing: models.Model, old: BaseModel
) -> list[str]:
    """Refresh `existing` in place from `old`. Returns names of changed attributes; does not save."""
    model = _model_for(old)
    if not isinstance(existing, model):
        raise TypeError(
            f"{type(existing).__name__} cannot be refreshed from {type(old).__name__}"
        )

    changed = []
    for attname, value in _field_values(model, old).items():
        if getattr(existing, attname) != value:
            setattr(existing, attname, value)
            changed.append(attname)
    return changed


def map_iapp_site_to_django(old: LegacyIAPPSite) -> IAPPSite:
    """Create an unsaved IAPPSite (site row only, no children)."""
    new = IAPPSite()
    new.site_id = old.site_id
    new.protected = old.protected
    new.geometry = convert_geometry(old.geometry)
    return new


def update_iapp_site_from_pydantic(
    existing: IAPPSite, old: LegacyIAPPSite
) -> list[str]:
    """Refresh the site row in place from `old`. Returns changed attribute names; does not save."""
    changed = []
    if existing.protected != old.protected:
        existing.protected = old.protected
        changed.append("protected")
    geometry = convert_geometry(old.geometry)
    if not _geometries_equal(existing.geometry, geometry):
        existing.geometry = geometry
        changed.append("geometry")
    return changed


def _save_new(instance: models.Model) -> None:
    instance.full_clean(validate_unique=False)
    instance.save(force_insert=True)


def create_iapp_site(old: LegacyIAPPSite) -> IAPPSite:
    """Insert a site and all its child rows. Raises if the site already exists."""
    with transaction.atomic():
        site = map_iapp_site_to_django(old)
        _save_new(site)
        for attr in SITE_CHILD_LISTS:
            for row in getattr(old, attr):
                _save_new(map_iapp_record_to_django(row))
    return site


def refresh_iapp_site(old: LegacyIAPPSite) -> IAPPSite:
    """
    Bring a site and its child rows in line with `old`: update changed rows, insert new
    ones and delete rows no longer in the source. Creates the site if it does not exist.
    """
    with transaction.atomic():
        site = IAPPSite.objects.select_for_update().filter(pk=old.site_id).first()
        if site is None:
            return create_iapp_site(old)

        if update_iapp_site_from_pydantic(site, old):
            site.full_clean(validate_unique=False)
            site.save()

        for attr, model in SITE_CHILD_LISTS.items():
            rows = getattr(old, attr)
            pk_name = model._meta.pk.attname
            fk_name = "mapped_site_id" if model is IAPPImportedImage else "site_id"
            existing = {
                getattr(obj, pk_name): obj
                for obj in model.objects.filter(**{fk_name: site.pk})
            }

            for row in rows:
                current = existing.get(getattr(row, pk_name))
                if current is None:
                    _save_new(map_iapp_record_to_django(row))
                elif update_iapp_record_from_pydantic(current, row):
                    current.full_clean(validate_unique=False)
                    current.save()

            kept = {getattr(row, pk_name) for row in rows}
            model.objects.filter(**{fk_name: site.pk}).exclude(pk__in=kept).delete()
    return site

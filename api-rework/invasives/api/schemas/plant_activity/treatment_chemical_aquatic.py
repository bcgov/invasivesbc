from . import BaseActivityProcessor, DraftBaseActivityProcessor
import logging
from api.models.activity import (
    Activity,
    ActivityDataRecord,
    WellEntry,
    ChemicalTreatmentContext,
    DraftChemicalTreatmentContext,
    ChemTreatmentContext,
    GranularHerbicideEntry,
    LiquidHerbicideEntry,
    ChemPlantEntryAquatic,
    DraftActivity,
    DraftActivityDataRecord,
    DraftWellEntry,
    DraftChemTreatmentContext,
    DraftGranularHerbicideEntry,
    DraftLiquidHerbicideEntry,
    DraftChemPlantEntryAquatic,
)
from api.models.codes import (
    LiquidHerbicideCode,
    GranularHerbicideCode,
)

log = logging.getLogger(__name__)


class TreatmentChemicalAquaticIn(BaseActivityProcessor):

    @classmethod
    def save_subtype_records(self, subtype_data: dict, parent: Activity):
        adr = ActivityDataRecord.objects.create(activity=parent)
        ChemicalTreatmentContext.objects.create(
            activity_data_record=adr, **subtype_data.get("context")
        )
        WellEntry.objects.bulk_create(
            WellEntry(activity_data_record=adr, **well)
            for well in subtype_data.get("well_entries", [])
        )

        treatment_info = subtype_data.get("treatment_context")
        herb = treatment_info.pop("herbicide", [])
        plant = treatment_info.pop("plants_treated", [])
        calculation_results = treatment_info.pop("results", [])
        # TODO: Add Results Objects

        ChemTreatmentContext.objects.create(activity_data_record=adr, **treatment_info)
        granular = []
        liquid = []
        for h in herb:
            name = h.get("name")

            if isinstance(name, LiquidHerbicideCode):
                liquid.append(h)
            elif isinstance(name, GranularHerbicideCode):
                granular.append(h)

        GranularHerbicideEntry.objects.bulk_create(
            GranularHerbicideEntry(
                activity_data_record=adr,
                product_application_rate=g.pop("application_rate", None),
                **g,
            )
            for g in granular
        )
        LiquidHerbicideEntry.objects.bulk_create(
            LiquidHerbicideEntry(
                activity_data_record=adr,
                product_application_rate=l.pop("application_rate", None),
                **l,
            )
            for l in liquid
        )
        ChemPlantEntryAquatic.objects.bulk_create(
            ChemPlantEntryAquatic(activity_data_record=adr, **p) for p in plant
        )


class DraftTreatmentChemicalAquaticIn(DraftBaseActivityProcessor):

    @classmethod
    def save_subtype_records(self, subtype_data: dict, parent: DraftActivity):
        adr = DraftActivityDataRecord.objects.create(activity=parent)
        DraftChemicalTreatmentContext.objects.create(
            activity_data_record=adr, **subtype_data.get("context")
        )
        DraftWellEntry.objects.bulk_create(
            DraftWellEntry(activity_data_record=adr, **well)
            for well in subtype_data.get("well_entries", [])
        )

        treatment_info = subtype_data.get("treatment_context")
        herb = treatment_info.pop("herbicide", [])
        plant = treatment_info.pop("plants_treated", [])
        calculation_results = treatment_info.pop("results", [])
        # TODO: Add Results Objects

        DraftChemTreatmentContext.objects.create(
            activity_data_record=adr, **treatment_info
        )
        granular = []
        liquid = []
        for h in herb:
            name = h.get("name")

            if isinstance(name, LiquidHerbicideCode):
                liquid.append(h)
            elif isinstance(name, GranularHerbicideCode):
                granular.append(h)

        DraftGranularHerbicideEntry.objects.bulk_create(
            DraftGranularHerbicideEntry(
                activity_data_record=adr,
                product_application_rate=g.pop("application_rate", None),
                **g,
            )
            for g in granular
        )
        DraftLiquidHerbicideEntry.objects.bulk_create(
            DraftLiquidHerbicideEntry(
                activity_data_record=adr,
                product_application_rate=l.pop("application_rate", None),
                **l,
            )
            for l in liquid
        )
        DraftChemPlantEntryAquatic.objects.bulk_create(
            DraftChemPlantEntryAquatic(activity_data_record=adr, **p) for p in plant
        )

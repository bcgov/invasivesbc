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
    ChemPlantEntryTerrestrial,
    DraftActivity,
    DraftActivityDataRecord,
    DraftWellEntry,
    DraftChemTreatmentContext,
    DraftGranularHerbicideEntry,
    DraftLiquidHerbicideEntry,
    DraftChemPlantEntryTerrestrial,
    ChemicalApplicationCalculationEntry,
)
from api.models.codes import (
    LiquidHerbicideCode,
    GranularHerbicideCode,
    PlantCode,
    HerbicideCode,
)

log = logging.getLogger(__name__)


class TreatmentChemicalTerrestrialIn(BaseActivityProcessor):

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
        herbicides = treatment_info.pop("herbicide", [])
        plants = treatment_info.pop("plants_treated", [])
        for r in treatment_info.pop("results", []):
            p_inst = r.pop("invasive_plant")
            h_inst = r.pop("herbicide_name")
            plant = PlantCode.objects.get(code=p_inst.code)
            herb = HerbicideCode.objects.get(code=h_inst.code)
            ChemicalApplicationCalculationEntry.objects.create(
                activity_data_record=adr,
                invasive_plant=plant,
                herbicide_name=herb,
                **r,
            )

        ChemTreatmentContext.objects.create(activity_data_record=adr, **treatment_info)
        granular = []
        liquid = []
        for h in herbicides:
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
        ChemPlantEntryTerrestrial.objects.bulk_create(
            ChemPlantEntryTerrestrial(activity_data_record=adr, **p) for p in plants
        )


class DraftTreatmentChemicalTerrestrialIn(DraftBaseActivityProcessor):

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
        DraftChemPlantEntryTerrestrial.objects.bulk_create(
            DraftChemPlantEntryTerrestrial(activity_data_record=adr, **p) for p in plant
        )

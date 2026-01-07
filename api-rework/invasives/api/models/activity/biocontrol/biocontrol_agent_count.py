from django.core.validators import MinValueValidator
from django.db import models

from api.models.activity.abstract_sub_tables import BaseOneToManyActivityTable
from api.models_public.codes import (
    BiocontrolAgentCode,
    BioAgentLifeStageCode,
    TerrestrialPlantCode,
    AgentLocationFoundCode,
    PlantPositionCode,
)


############
#  For Biocontrol Records using Estimated/Actual Counts
#  Currently Setup For Terrestrial Agents as those are form that are supported. Extended from Base classes to allow for Aquatic specification if/when required.
############


####
# Abstracts
####
class BiocontrolAgentCountSimple(BaseOneToManyActivityTable):
    """
    Base Class for Biocontrol Agent Counts.

    :invasive_plant: Relates to the Dispersal Biocontrol Agent Record
    :biocontrol_agent: Relates to the Dispersal Biocontrol Agent Record
    :is_estimate: separates the "Actual Biological Agents" from the "Estimated Biological Agents"
    """

    invasive_plant = models.ForeignKey("PlantCodes", on_delete=models.PROTECT)
    biocontrol_agent = models.ForeignKey(BiocontrolAgentCode, on_delete=models.PROTECT)
    stage = models.ForeignKey(BioAgentLifeStageCode, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    is_estimate = models.BooleanField()

    class Meta:
        abstract = True
        db_table = '"activity"."biocontrol_agent_count_simple"'
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "activity_id",
                    "invasive_plant",
                    "biocontrol_agent",
                    "stage",
                    "is_estimate",
                ],
                name="unique_simple_agent_count",
            )
        ]


class BiocontrolAgentCountComplex(BiocontrolAgentCountSimple):
    """
    Base Complex Agent Count Forms.

    Contains additional details for agent and plant locations.
    """

    agent_location = models.ForeignKey(AgentLocationFoundCode, on_delete=models.PROTECT)
    plant_position = models.ForeignKey(PlantPositionCode, on_delete=models.PROTECT)

    class Meta:
        abstract = True
        db_table = '"activity"."biocontrol_agent_count_complex"'
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "activity_id",
                    "invasive_plant",
                    "biocontrol_agent",
                    "stage",
                    "is_estimate",
                    "agent_location",
                    "plant_location",
                ],
                name="unique_complex_agent_count",
            )
        ]


####
# Implemented
####


class TerrestrialBiocontrolAgentCountSimple(BiocontrolAgentCountSimple):
    """
    consumed by:
      - Biocontrol Collection
      - Biocontrol Release
    """

    invasive_plant = models.ForeignKey(TerrestrialPlantCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."terrestrial_biocontrol_agent_count_simple"'
        pass


class TerrestrialBiocontrolAgentCountComplex(BiocontrolAgentCountComplex):
    """
    consumed by:
      - Biocontrol Dispersal Monitoring
    """

    invasive_plant = models.ForeignKey(TerrestrialPlantCode, on_delete=models.PROTECT)

    class Meta:
        db_table = '"activity"."terrestrial_biocontrol_agent_count_complex"'
        pass

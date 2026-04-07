from django.core.validators import MinValueValidator
from django.db import models

from api.models.activity import RepeatedFormData
from api.models.codes.code_tables import (
    AgentLocationFoundCode,
    BioAgentLifeStageCode,
    BiocontrolAgentCode,
    PlantPositionCode,
    TerrestrialPlantCode,
)


############
#  For Biocontrol Records using Estimated/Actual Counts
#  Currently Setup For Terrestrial Agents as those are form that are supported. Extended from Base classes to allow for Aquatic specification if/when required.
############


####
# Abstracts
####
class BiocontrolAgentCountSimple(RepeatedFormData):
    """
    Base Class for Biocontrol Agent Counts.

    :invasive_plant: Relates to the Dispersal Biocontrol Agent Record
    :biocontrol_agent: Relates to the Dispersal Biocontrol Agent Record
    :is_estimate: separates the "Actual Biological Agents" from the "Estimated Biological Agents"
    """

    stage = models.ForeignKey(BioAgentLifeStageCode, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    is_estimate = models.BooleanField()

    class Meta:
        abstract = True
        db_table = '"activity"."biocontrol_agent_count_simple"'


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


####
# Implemented
####


class TerrestrialBiocontrolAgentCount(BiocontrolAgentCountSimple):
    """
    consumed by:
      - Biocontrol Collection
      - Biocontrol Release
    """

    class Meta:
        db_table = '"activity"."biocontrol_agent_count_pt"'
        pass


class TerrestrialBiocontrolAgentCountExtended(BiocontrolAgentCountComplex):
    """
    consumed by:
      - Biocontrol Dispersal Monitoring
    """

    class Meta:
        db_table = '"activity"."biocontrol_agent_count_extended_pt"'
        pass

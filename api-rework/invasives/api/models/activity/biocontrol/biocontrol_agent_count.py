from django.core.validators import MinValueValidator
from django.db import models

from api.models.activity import RepeatedFormData, DraftRepeatedFormData
from api.models.codes.code_tables import (
    AgentLocationFoundCode,
    BioAgentLifeStageCode,
    PlantPositionCode,
)

############
#  For Biocontrol Records using Estimated/Actual Counts
#  Currently Setup For Terrestrial Agents as those are form that are supported. Extended from Base classes to allow for Aquatic specification if/when required.
############


class BaseSimpleModel(models.Model):
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


class BaseComplexModel(BaseSimpleModel):
    agent_location = models.ForeignKey(AgentLocationFoundCode, on_delete=models.PROTECT)
    plant_position = models.ForeignKey(PlantPositionCode, on_delete=models.PROTECT)

    class Meta(BaseSimpleModel.Meta):
        abstract = True


####
# Implemented
####


class TerrestrialBiocontrolAgentCount(BaseSimpleModel, RepeatedFormData):
    """
    consumed by:
      - Biocontrol Collection
      - Biocontrol Release
    """

    class Meta:
        db_table = '"activity"."biocontrol_agent_count_pt"'
        pass


class TerrestrialBiocontrolAgentCountExtended(BaseComplexModel, RepeatedFormData):
    """
    consumed by:
      - Biocontrol Dispersal Monitoring
    """

    class Meta:
        db_table = '"activity"."biocontrol_agent_count_extended_pt"'
        pass


class DraftBiocontrolAgentCountSimple(BaseSimpleModel, DraftRepeatedFormData):
    """
    Base Class for Biocontrol Agent Counts.

    :invasive_plant: Relates to the Dispersal Biocontrol Agent Record
    :biocontrol_agent: Relates to the Dispersal Biocontrol Agent Record
    :is_estimate: separates the "Actual Biological Agents" from the "Estimated Biological Agents"
    """

    stage = models.ForeignKey(
        BioAgentLifeStageCode,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )
    quantity = models.PositiveIntegerField(
        blank=True,
        null=True,
    )
    is_estimate = models.BooleanField(
        blank=True,
        null=True,
    )

    class Meta:
        abstract = True


class DraftBiocontrolAgentCountComplex(
    BaseComplexModel, DraftBiocontrolAgentCountSimple
):
    quantity = models.PositiveIntegerField(
        blank=True,
        null=True,
    )
    stage = models.ForeignKey(
        BioAgentLifeStageCode,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )
    agent_location = models.ForeignKey(
        AgentLocationFoundCode,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )
    plant_position = models.ForeignKey(
        PlantPositionCode,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )

    class Meta:
        abstract = True


class DraftTerrestrialBiocontrolAgentCount(
    DraftBiocontrolAgentCountSimple, DraftRepeatedFormData
):
    class Meta:
        db_table = '"draft_activity"."biocontrol_agent_count_pt"'


class DraftTerrestrialBiocontrolAgentCountExtended(
    DraftBiocontrolAgentCountComplex, DraftRepeatedFormData
):
    class Meta:
        db_table = '"draft_activity"."biocontrol_agent_count_extended_pt"'

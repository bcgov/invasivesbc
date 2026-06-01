import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import { useSelector } from 'utils/use_selector';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';

const MicrositeConditions = () => {
  const codes = useSelector((state) => state.ActivityPage.formCodes);
  return (
    <Fieldset label={'Microsite Condition'}>
      <SingleSelect
        label={'Mesoslope Position'}
        name={'subtype_data.microsite_conditions.mesoslope_position'}
        options={codes?.MesoslopePositionCode}
        required
        width={Width.Half}
        rules={{ required: true }}
        tooltip={tooltips.plant.biocontrol.microsite.mesoslope_position}
      />
      <SingleSelect
        label={'Site Surface Shape'}
        name={'subtype_data.microsite_conditions.site_surface_shape'}
        options={codes?.SiteSurfaceShapeCode}
        required
        width={Width.Half}
        rules={{ required: true }}
        tooltip={tooltips.plant.biocontrol.microsite.site_surface_shape}
      />
    </Fieldset>
  );
};
export default MicrositeConditions;

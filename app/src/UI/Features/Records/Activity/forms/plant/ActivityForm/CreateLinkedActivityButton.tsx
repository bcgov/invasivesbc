import { ActivitySubtypes } from 'sharedAPI';
import FormActions from 'state/actions/activity/FormActions';
import Button from 'UI/Reusable/Button/Button';
import { useDispatch, useSelector } from 'utils/use_selector';
import { FormSchema } from '../interfaces';

/**
  @desc Component for adding Form Control buttons to create related records. 
        Results in New form of declared type, with current form as Linked Activity
 */
const CreateLinkedActivityButton = () => {
  const CONFIG = {
    [ActivitySubtypes.Observation_Plant_Aquatic]: [
      {
        label: 'Chemical Treatment',
        links_to: ActivitySubtypes.Treatment_Chemical_Plant_Aquatic
      },
      {
        label: 'Mechanical Treatment',
        links_to: ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic
      }
    ],
    [ActivitySubtypes.Observation_Plant_Terrestrial]: [
      {
        label: 'Chemical Treatment',
        links_to: ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial
      },
      {
        label: 'Mechanical Treatment',
        links_to: ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial
      }
    ],
    [ActivitySubtypes.Treatment_Chemical_Plant_Aquatic]: [
      {
        label: 'Chemical Treatment Monitoring',
        links_to: ActivitySubtypes.Monitoring_Chemical_Plant_Terrestrial_Aquatic
      }
    ],
    [ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial]: [
      {
        label: 'Chemical Treatment Monitoring',
        links_to: ActivitySubtypes.Monitoring_Chemical_Plant_Terrestrial_Aquatic
      }
    ],
    [ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic]: [
      {
        label: 'Mechanical Treatment Monitoring',
        links_to: ActivitySubtypes.Monitoring_Mechanical_Plant_Terrestrial_Aquatic
      }
    ],
    [ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial]: [
      {
        label: 'Mechanical Treatment Monitoring',
        links_to: ActivitySubtypes.Monitoring_Mechanical_Plant_Terrestrial_Aquatic
      }
    ],
    [ActivitySubtypes.Biocontrol_Release]: [
      {
        label: 'Biocontrol Collection',
        links_to: ActivitySubtypes.Biocontrol_Collection
      },
      {
        label: 'Dispersal Monitoring',
        links_to: ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial
      },
      {
        label: 'Release Monitoring',
        links_to: ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial
      }
    ]
  };
  const handleClick = (links_to: ActivitySubtypes) => {
    if (!formState) return;
    dispatch(
      FormActions.duplicateForm({
        subtype: links_to,
        extraFields: {
          shape: formState?.shape,
          linked_activities: [
            {
              label: `${formState.short_id} | ${formState.date} | ${formState.created_by}`,
              full: formState.id
            }
          ]
        } as Partial<FormSchema>
      })
    );
  };
  const dispatch = useDispatch();
  const currentSubtype = useSelector((state) => state.ActivityPage.formType);
  const isRecordSubmitted = useSelector((state) => state.ActivityPage.formState?.form_status === 'Submitted');
  const formActions = useSelector((state) => state.ActivityPage.recordActions);
  const formState = useSelector((state) => state.ActivityPage?.formState);
  const shouldHideFields =
    !isRecordSubmitted || !currentSubtype || !CONFIG?.[currentSubtype] || !formActions?.includes('SUBMIT');

  if (shouldHideFields) return;
  return (
    <>
      {CONFIG[currentSubtype].map((o) => (
        <Button onClick={() => handleClick(o.links_to)} className="control-button" key={o.links_to}>
          Create {o.label} Entry
        </Button>
      ))}
    </>
  );
};
export default CreateLinkedActivityButton;

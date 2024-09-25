import DateModal from './DateModal';
import ManualUtmModal from './ManualUtmModal';
import NumberModal from './NumberModal';
import RadioModal from './RadioModal';
import TextModal from './TextModal';
import ConfirmationModal from './ConfirmationModal';
import { useSelector } from 'utils/use_selector';
import { PromptTypes } from 'constants/promptEnums';
import {
  ConfirmationModalInterface,
  DateModalInterface,
  ManualUtmModalInterface,
  NumberModalInterface,
  RadioModalInterface,
  TextModalInterface
} from 'interfaces/prompt-interfaces';

/**
 * @desc Handler for all User Input Modals, Uses Redux store as a queue to display prompts to user when input is needed
 * @external {@link https://github.com/bcgov/invasivesbc/wiki/User-Prompt-System }
 */
const UserInputModalController = () => {
  const prompts = useSelector((state) => state.AlertsAndPrompts.prompts);
  if (prompts.length === 0) {
    return;
  }
  let prompt: Record<string, any>;
  switch (prompts[0].type) {
    case PromptTypes.Confirmation:
      prompt = prompts[0] as ConfirmationModalInterface;
      return (
        <ConfirmationModal
          callback={prompt.callback}
          disableCancel={prompt?.disableCancel}
          id={prompt.id}
          title={prompt.title}
          prompt={prompt.prompt}
          cancelText={prompt?.cancelText}
          confirmText={prompt?.confirmText}
        />
      );
    case PromptTypes.Date:
      prompt = prompts[0] as DateModalInterface;
      return (
        <DateModal
          callback={prompt.callback}
          cancelText={prompt?.cancelText}
          confirmText={prompt?.confirmText}
          disableCancel={prompt?.disableCancel}
          id={prompt.id}
          label={prompt?.label}
          max={prompt?.max}
          min={prompt?.min}
          prompt={prompt?.prompt}
          title={prompt?.title}
        />
      );
    case PromptTypes.ManualUtm:
      prompt = prompts[0] as ManualUtmModalInterface;
      return (
        <ManualUtmModal
          cancelText={prompt?.cancelText}
          callback={prompt.callback}
          confirmText={prompt?.confirmText}
          disableCancel={prompt?.disableCancel}
          id={prompt.id}
          prompt={prompt.prompt}
          title={prompt.title}
        />
      );
    case PromptTypes.Number:
      prompt = prompts[0] as NumberModalInterface;
      return (
        <NumberModal
          acceptFloats={prompt?.acceptFloats}
          callback={prompt?.callback}
          cancelText={prompt.cancelText}
          confirmText={prompt.confirmText}
          disableCancel={prompt?.disableCancel}
          id={prompt.id}
          label={prompt.label}
          max={prompt.max}
          min={prompt.min}
          prompt={prompt.prompt}
          selectOptions={prompt.selectOptions}
          title={prompt.title}
        />
      );
    case PromptTypes.Radio:
      prompt = prompts[0] as RadioModalInterface;
      return (
        <RadioModal
          callback={prompt.callback}
          cancelText={prompt?.cancelText}
          confirmText={prompt?.confirmText}
          disableCancel={prompt?.disableCancel}
          id={prompt.id}
          label={prompt?.label}
          options={prompt.options}
          prompt={prompt.prompt}
          title={prompt.title}
        />
      );
    case PromptTypes.Text:
      prompt = prompts[0] as TextModalInterface;
      return (
        <TextModal
          callback={prompt?.callback}
          cancelText={prompt?.cancelText}
          disableCancel={prompt?.disableCancel}
          confirmText={prompt?.confirmText}
          label={prompt?.label}
          id={prompt.id}
          max={prompt?.max}
          min={prompt?.min}
          prompt={prompt?.prompt}
          regex={prompt?.regex}
          regexErrorText={prompt?.regexErrorText}
          selectOptions={prompt?.selectOptions}
          title={prompt?.title}
        />
      );
    default:
      return;
  }
};

export default UserInputModalController;

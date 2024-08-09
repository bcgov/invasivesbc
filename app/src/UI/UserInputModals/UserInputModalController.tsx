import DateModal from './DateModal';
import NumberModal from './NumberModal';
import TextModal from './TextModal';
import ConfirmationModal from './ConfirmationModal';
import { Fragment } from 'react/jsx-runtime';
import { useSelector } from 'utils/use_selector';
import { PromptTypes } from 'constants/promptEnums';
import {
  ConfirmationModalInterface,
  DateModalInterface,
  NumberModalInterface,
  TextModalInterface
} from 'interfaces/prompt-interfaces';
/**
 * @desc Handler for all User Input Modals, Uses Redux store as a queue to display prompts to user when input is needed
 */
const UserInputModalController = () => {
  const prompts = useSelector((state) => state.AlertsAndPrompts.prompts) || [];
  if (prompts.length === 0) {
    return <Fragment />;
  }
  let prompt: Record<string, any>;
  switch (prompts[0].type) {
    case PromptTypes.Confirmation:
      prompt = prompts[0] as ConfirmationModalInterface;
      return (
        <ConfirmationModal
          callback={prompt.callback}
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
          id={prompt.id}
          label={prompt?.label}
          max={prompt?.max}
          min={prompt?.min}
          prompt={prompt?.prompt}
          title={prompt?.title}
        />
      );
    case PromptTypes.Number:
      prompt = prompts[0] as NumberModalInterface;
      return (
        <NumberModal
          callback={prompt?.callback}
          cancelText={prompt.cancelText}
          confirmText={prompt.confirmText}
          id={prompt.id}
          label={prompt.label}
          max={prompt.max}
          min={prompt.min}
          prompt={prompt.prompt}
          selectOptions={prompt.selectOptions}
          title={prompt.title}
        />
      );
    case PromptTypes.Text:
      prompt = prompts[0] as TextModalInterface;
      return (
        <TextModal
          callback={prompt?.callback}
          cancelText={prompt?.cancelText}
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
      return <Fragment />;
  }
};

export default UserInputModalController;

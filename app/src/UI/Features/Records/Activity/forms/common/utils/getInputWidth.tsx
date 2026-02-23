import Width from './Width';

const getInputWidth = (val?: Width) => {
  return (() => {
    switch (val) {
      case Width.Full:
        return 'full-width';
      case Width.Half:
        return 'half-width';
      case Width.Third:
        return 'third-width';
      case Width.Quarter:
        return 'fourth-width';
      default:
        return 'full-width';
    }
  })();
};

export default getInputWidth;

/*
  Utility function to generate a custom error message for our app based on the status code
  and also where this function is being called from (ie; what action is being performed)
*/
export function getErrorMessages(errorCode: number, action: string): string {
  let errorMessage = 'There has been an error. Please try again.';

  if (action === 'formSync') {
    switch (errorCode) {
      case 400:
        errorMessage = 'There seems to be an issue with your form, please check your form for errors and try again.';
        break;
      case 500:
        errorMessage = 'Our system experienced an issue. Please try again.';
        break;
    }
  }

  return errorMessage;
}

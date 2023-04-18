/**
 * ErrorPostRequestBody 
 *
 * @export
 * @class ErrorPostRequestBody
 */
export class ErrorPostRequestBody {

    error: Object;
    clientState: Object;
    created_by: string
    created_by_with_guid: string
  
    /**
     * Creates an instance of ErrorPostRequestBody.
     *
     * @param {*} [obj]
     * @memberof ErrorPostRequestBody
     */
    //NOSONAR
    constructor(object?: any) {
      // eslint-disable-next-line no-unused-vars
      const { ...obj } = object; // remove payload from obj to prevent infinite recursion
  
      this.error = {
        ...obj.error,
      };
      this.clientState = {
        ...obj.clientState,
      };

      this.created_by = {
        ...obj.created_by,
      };
      this.created_by_with_guid = {
        ...obj.created_by_with_guid,
      };

  
    }
  }
  
  
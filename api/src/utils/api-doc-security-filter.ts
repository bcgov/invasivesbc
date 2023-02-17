import jsonpatch from 'fast-json-patch';
import traverse from 'json-schema-traverse';
import { X_API_DOC_KEYS, X_ENUM_CODE } from '../constants/misc';
import { getAllCodeEntities, IAllCodeEntities } from './code-utils';
// import { getLogger } from './logger';
import { authenticate, InvasivesRequest } from './auth-utils';

// const defaultLog = getLogger('api-doc-security-filter');

/**
 * Apply updates/filters to req.apiDoc.
 *
 * @export
 * @param {*} req
 * @return {*} req
 */
export async function applyApiDocSecurityFilters(req: InvasivesRequest, res) {
  try {
    await authenticate(<InvasivesRequest>req);
    let user = req.authContext.user;
    const roles = req.authContext.roles;

    let allCodeEntities: IAllCodeEntities;
    if (user) {
      if (roles.length > 0) {
        user = { ...user, roles };
      }
      const isApiDocCall = req.originalUrl.includes('api-docs')
      let shouldFilter = true;
      if(isApiDocCall && !req.authContext.filterForSelectable)
      {
        shouldFilter = false
      }
      allCodeEntities = await getAllCodeEntities(user,shouldFilter);
    } else {
      allCodeEntities = await getAllCodeEntities();
    }

    if (!allCodeEntities) {
      return req;
    }

    // the apiDoc that updates will be applied to
    const apiDoc = req['apiDoc'];

    let initialPass = true;

    // traverses the apiDoc object, calling the `cb` function for each level of the schema, the first being the entire
    // (root) schema.
    traverse(apiDoc, {
      allKeys: true,
      cb: (schema, jsonPtr) => {
        if (initialPass) {
          // first pass is always the entire (root) schema, which we can skip (for a minor efficiency improvement)
          initialPass = false;
          return;
        }

        // apply code enum filters, if a matching `x-...` field exists
        if (Object.keys(schema).includes(X_API_DOC_KEYS.X_ENUM_CODE)) {
          // apply code enum filtering to this piece of schema
          const updatedSchema = applyCodeEnumFilter(schema, allCodeEntities);

          // update apiDoc, replacing the old schema part with the updated schema part
          jsonpatch.applyPatch(apiDoc, [{ op: 'replace', path: jsonPtr, value: updatedSchema }]);
        }
      }
    });

    // re-assign the updated apiDoc to the req
    req['apiDoc'] = apiDoc;
  } catch (error) {
    // defaultLog.debug({ label: 'applyApiDocSecurityFilters', message: 'error', error });
    throw error;
  }

  return res.status(200).json(req['apiDoc']);;
}

/**
 * Updates an object to include code enum json spec.
 *
 * @export
 * @param {object} obj the schema object to apply updates to
 * @param {IAllCodeEntities} allCodeEntities an object containing all of the code categories, headers, and codes
 * @return {*}  {object} the updated object
 */
export function applyCodeEnumFilter(obj: object, allCodeEntities: IAllCodeEntities): object {
  // prase the `x-enum-code` object
  const xEnumCodeObj = obj[X_API_DOC_KEYS.X_ENUM_CODE];

  const codeCategoryName = xEnumCodeObj[X_ENUM_CODE.CATEGORY_NAME];
  const codeHeaderName = xEnumCodeObj[X_ENUM_CODE.HEADER_NAME];
  const codeName = xEnumCodeObj[X_ENUM_CODE.CODE_NAME];
  const codeText = xEnumCodeObj[X_ENUM_CODE.CODE_TEXT];
  const codeSortOrder = xEnumCodeObj[X_ENUM_CODE.CODE_SORT_ORDER] || [];

  if (!codeCategoryName || !codeHeaderName || !codeName || !codeText) {
    return obj;
  }

  // Get the matching code category row
  const codeCategoryRow = allCodeEntities.categories.find((item) => {
    return item['code_category_name'] === codeCategoryName;
  });

  if (!codeCategoryRow) {
    return obj;
  }

  // Get the matching code header row
  const codeHeaderRow = allCodeEntities.headers.find((item) => {
    return (
      item['code_category_id'] === codeCategoryRow['code_category_id'] && item['code_header_name'] === codeHeaderName
    );
  });

  if (!codeHeaderRow) {
    return obj;
  }

  // Get all of the matching code rows
  const codeRows = allCodeEntities.codes.filter((item) => {
    return item['code_header_id'] === codeHeaderRow['code_header_id'];
  });

  if (!codeRows || !codeRows.length) {
    return obj;
  }

  // update the object, adding an `options` field whose value is an array of enum objects
  obj = {
    ...obj,
    options: codeRows
      .map((codeRow) => {
        return {
          // the `type` specified by the parent object that contains this enum object (their types must match)
          // type: obj['type'],
          // the column that contains the unique value for this code
          value: codeRow[codeName],
          // the column that contains the human readable name of this code
          label: codeRow[codeText],
          // the column that contains the sort order
          'x-code_sort_order': codeRow[codeSortOrder]
        };
      })
      // sort by code sort order, and secondarily by title
      .sort(getAscObjectSorter([`x-${codeSortOrder}`, 'label']))
  };

  return obj;
}

/**
 * Returns a comparator function that sorts objects in ascending order.
 *
 * @param {string[]} fields An array of ordered field names to sort on.
 * If the the fields[0] comparison results in a tie, then the fields[1] comparison will run, etc.
 * @return {*}
 */
function getAscObjectSorter(fields: string[]) {
  return (a: object, b: object) => {
    for (const field of fields) {
      if (a[field] < b[field]) {
        return -1;
      }

      if (a[field] > b[field]) {
        return 1;
      }
    }

    return 0;
  };
}

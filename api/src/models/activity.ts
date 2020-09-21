import { parseBase64DataURLString } from './../utils/file-utils';

/**
 * A single media item.
 *
 * @export
 * @interface IMediaItem
 */
export interface IMediaItem {
  fileName: string;
  encodedFile: string;
}

/**
 * Media object for Data URL base64 encoded files.
 *
 * @export
 * @class MediaBase64
 */
export class MediaBase64 {
  fileName: string;
  contentType: string;
  contentString: string;
  fileBuffer: Buffer;

  /**
   * Creates an instance of MediaBase64.
   *
   * @param {IMediaItem} obj
   * @memberof MediaBase64
   */
  constructor(obj: IMediaItem) {
    const base64StringParts = parseBase64DataURLString(obj.encodedFile);

    if (!base64StringParts) {
      throw new Error('encodedFile could not be parsed');
    }

    this.contentType = base64StringParts.contentType;
    this.contentString = base64StringParts.contentType;
    this.fileName = obj.fileName;
    this.fileBuffer = Buffer.from(base64StringParts.contentString, 'base64');
  }
}

/**
 * Activity post request body.
 *
 * @export
 * @class ActivityPostRequestBody
 */
export class ActivityPostRequestBody {
  activityPostBody: object;
  activityResponseBody: object;

  activity_type: string;
  activityTypeData: object;

  activity_sub_type: string;
  activitySubTypeData: object;

  date: string;

  locationAndGeometry: object;

  mediaKeys: string[];

  /**
   * Creates an instance of ActivityPostRequestBody.
   *
   * @param {*} [obj]
   * @memberof ActivityPostRequestBody
   */
  constructor(obj?: any) {
    // Add whole original object for auditing
    this.activityPostBody = {
      ...obj,
      // Strip out any media base64 strings which would convolute the record
      media: (obj.media && obj.media.map((item: MediaBase64) => item.fileName)) || []
    };

    this.activity_type = (obj && obj.activity_type) || null;
    this.activityTypeData = (obj && obj.activityTypeData) || null;

    this.activity_sub_type = (obj && obj.activity_sub_type) || null;
    this.activitySubTypeData = (obj && obj.activitySubTypeData) || null;

    this.date = (obj && obj.date) || null;

    this.locationAndGeometry = (obj && obj.locationAndGeometry) || null;

    this.mediaKeys = (obj && obj.mediaKeys) || null;
  }
}

/**
 * Activity get search criteria object.
 *
 * @export
 * @class ActivitySearchCriteria
 */
export class ActivitySearchCriteria {
  activity_type: string;
  activity_sub_type: string;

  page: number;
  limit: number;

  date_range_start: Date;
  date_range_end: Date;

  includeMedia: boolean;

  /**
   * Creates an instance of ActivitySearchCriteria.
   *
   * @param {*} [obj]
   * @memberof ActivitySearchCriteria
   */
  constructor(obj?: any) {
    this.activity_type = (obj && obj.activity_type) || null;
    this.activity_sub_type = (obj && obj.activity_sub_type) || null;

    this.page = (obj && obj.page) || 0;
    this.limit = (obj && obj.limit) || 50;

    this.date_range_start = (obj && obj.date_range_start) || null;
    this.date_range_end = (obj && obj.date_range_end) || null;

    this.includeMedia = (obj && obj.includeMedia) || false;
  }
}

import { S3Client } from '@aws-sdk/client-s3';

const OBJECT_STORE_URL = process.env.OBJECT_STORE_URL || 'nrs.objectstore.gov.bc.ca';

const getS3Client = (): S3Client =>
  new S3Client({
    region: 'custom', // value needed to avoid errors, value not used by API
    endpoint: `https://${OBJECT_STORE_URL}`,
    credentials: async () => {
      return {
        accessKeyId: process.env.OBJECT_STORE_ACCESS_KEY_ID,
        secretAccessKey: process.env.OBJECT_STORE_SECRET_KEY_ID
      };
    },
    forcePathStyle: true,
    defaultsMode: 'standard'
  });

export default getS3Client;

'use strict';

import { GetObjectOutput, ManagedUpload } from 'aws-sdk/clients/s3';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { IMediaItem, MediaBase64 } from '../models/media';
import { getFileFromS3, uploadFileToS3 } from '../utils/file-utils';
import { logEndpoint, logData, logErr, getStartTime, logMetrics } from '../utils/logger';
import { retrieveGetDoc } from '../docs/getDoc';

const namespace = 'media';

/**
 * GET api/media?key=123;key=456;key=789
 */
export const GET: Operation = [getMedia()];

GET.apiDoc = {
  tags: [namespace],
  description: 'Fetches one or more media items based on their keys.',
  ...retrieveGetDoc('Array of media objects')
};

function getMedia(): RequestHandler {
  return async (req, res, next) => {
    logEndpoint()(req,res);
    const startTime = getStartTime(namespace);  
    const keys = req.query.key as string[];

    if (!keys || !keys.length) {
      // No media keys found, skipping get media step
      logErr()(namespace,'No media keys found, skipping get media step');
      return next();
    }

    const s3GetPromises: Promise<GetObjectOutput>[] = [];

    keys.forEach((key: string) => {
      s3GetPromises.push(getFileFromS3(key));
    });
    logData()(namespace,logMetrics.SQL_QUERY_SOURCE,s3GetPromises);
    logData()(namespace,logMetrics.SQL_PARAMS,keys);

    const response = await Promise.all(s3GetPromises);
    logData()(namespace,logMetrics.SQL_RESULTS,response);
    logData()(namespace,logMetrics.SQL_RESPONSE_TIME,startTime);

    return res.status(200).json({
      message: 'Successfully got media',
      request: req.query,
      result: getMediaItemsList(response, keys),
      namespace,
      code: 200
    });
  };
}

/**
 * Uploads any media in the request to S3, adding their keys to the request, and calling next().
 *
 * Does nothing if no media is present in the request.
 *
 * TODO: make media handling an extension that can be added to different endpoints/record types
 *
 * @returns {RequestHandler}
 */
export function uploadMedia(): RequestHandler {
  return async (req, res, next) => {
    logEndpoint()(req,res);
    const startTime = getStartTime(namespace);

    if (!req.body.media || !req.body.media.length) {
      // no media objects included, skipping media upload step
      logErr()(namespace,'No media objects included, skipping media upload step');
      return next();
    }

    const rawMediaArray: IMediaItem[] = req.body.media;
    
    const s3UploadPromises: Promise<ManagedUpload.SendData>[] = [];

    rawMediaArray.forEach((rawMedia: IMediaItem) => {
      if (!rawMedia) {
        return;
      }

      let media: MediaBase64;
      try {
        media = new MediaBase64(rawMedia);
      } catch (error) {
        logErr()(namespace,`Included media was invalid/encoded incorrectly\n${req?.query}\n${error}`);
        return res.status(400).json({
          message: 'Included media was invalid/encoded incorrectly',
          request: req.query,
          error: error,
          namespace,
          code: 400
        });
      }

      const metadata = {
        file_name: media.mediaName || '',
        description: media.mediaDescription || '',
        date: media.mediaDate || '',
        username: (req['auth_payload'] && req['auth_payload'].preferred_username) || '',
        email: (req['auth_payload'] && req['auth_payload'].email) || ''
      };

      s3UploadPromises.push(uploadFileToS3(media, metadata));
    });
    logData()(namespace,logMetrics.SQL_QUERY_SOURCE,s3UploadPromises);
    logData()(namespace,logMetrics.SQL_PARAMS,rawMediaArray);
    const results = await Promise.all(s3UploadPromises);

    logData()(namespace,logMetrics.SQL_RESULTS,results);
    req['media_keys'] = results.map((result) => result.Key);
    logData()(namespace,logMetrics.SQL_RESPONSE_TIME,startTime);
    next();
  };
}

/*
  Function to get list of media items from s3 object list
*/
export function getMediaItemsList(s3ObjectList: GetObjectOutput[], keys: string[]) {
  const mediaItems: IMediaItem[] = s3ObjectList.map((s3Object: GetObjectOutput, index) => {
    // Encode image buffer as base64
    const contentString = Buffer.from(s3Object.Body as Buffer).toString('base64');

    // Append DATA Url string
    const encodedFile = `data:${s3Object.ContentType};base64,${contentString}`;

    const mediaItem: IMediaItem = {
      file_name: (s3Object && s3Object.Metadata && s3Object.Metadata.file_name) || null,
      encoded_file: encodedFile,
      description: (s3Object && s3Object.Metadata && s3Object.Metadata.description) || null,
      media_date: (s3Object && s3Object.Metadata && s3Object.Metadata.date) || null,
      media_key: keys[index]
    };

    return mediaItem;
  });

  return mediaItems;
}

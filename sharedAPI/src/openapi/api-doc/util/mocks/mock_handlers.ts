//Will move all these mocks to shared API to be used for test on both ends

import { api_doc } from '../../api-doc';
import { AdminDefinedShapeResponse } from '../../Paths/AdminDefinedShapes';
import { activitiesDraftsResponseStub, LeanActivityStub, s3_activitiesResponseStub } from './activities';
import { example_s3_iapp } from './example_s3_iapp';
import { exportConfigStub } from './export-config';
var OpenAPISampler = require('openapi-sampler');

export const getAPIDoc = () => {
  return JSON.stringify(api_doc);
};

export const AdminDefinedShapeResponse_Mock = () => {
  return OpenAPISampler.sample(AdminDefinedShapeResponse, {}, api_doc);
};

export const ActivitiesResponse_Mock = (req) => {
  return activitiesDraftsResponseStub;
};
export const IAPPSitesResponse_Mock = (req) => {
  return activitiesDraftsResponseStub;
};

export const ExportConfigResponse_Mock = (req) => {
  return exportConfigStub;
};

export const IAPPS3Repsonse_Mock = (req) => {
  return example_s3_iapp;
};

export const ActivitiesS3Repsonse_Mock = (req) => {
  return s3_activitiesResponseStub;
};

export const ActivitiesLeanResponse_Mock = (req) => {
  return LeanActivityStub;
};

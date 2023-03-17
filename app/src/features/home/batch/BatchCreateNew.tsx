import React, {useEffect, useState} from 'react';
import {Button, Container, Grid, Stack, Typography} from '@mui/material';
import TemplateDownloadList from "../../../components/batch-upload/TemplateDownloadList";
import BatchUploadList from "../../../components/batch-upload/BatchUploadList";
import BatchOverview from '../../../components/batch-upload/BatchOverview';
import BatchCreate from "../../../components/batch-upload/BatchCreate";
import {useInvasivesApi} from "../../../hooks/useInvasivesApi";
import Spinner from "../../../components/spinner/Spinner";
import BatchNav from "../../../components/batch-upload/BatchNav";
import BatchLayout from "./BatchLayout";

const BatchCreateNew = () => {

  return (
    <BatchLayout>
      <BatchCreate/>
    </BatchLayout>
  );
};

export default BatchCreateNew;

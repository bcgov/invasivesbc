import React, {useEffect, useState} from 'react';
import TemplateDownloadList from "../../../components/batch-upload/TemplateDownloadList";
import {useInvasivesApi} from "../../../hooks/useInvasivesApi";
import Spinner from "../../../components/spinner/Spinner";
import BatchLayout from "./BatchLayout";

const BatchTemplates = () => {

  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const api = useInvasivesApi();

  useEffect(async () => {
    setLoading(true);
    const data = await api.getTemplateList();
    setTemplates(data);
    setLoading(false);
  }, []);

  if (loading) {
    return (<Spinner/>);
  }

  return (
    <BatchLayout>
      <TemplateDownloadList templates={templates}/>
    </BatchLayout>

  );
};

export default BatchTemplates;

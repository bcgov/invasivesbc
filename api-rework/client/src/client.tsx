import React from 'react';
import ActivitiesList from 'activities/list';
import { BrowserRouter, Route, Routes } from 'react-router';
import ActivitiesDetail from 'activities/detail';

const Client: React.FC = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ActivitiesList />} />
          <Route path="/activities" element={<ActivitiesList />} />
          <Route path="/activities/:id" element={<ActivitiesDetail />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default Client;

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { Sites } from './pages/Sites';
import { NewSite } from './pages/NewSite';
import { EditSite } from './pages/EditSite';
import { SiteDetail } from './pages/SiteDetail';
import { Settings } from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="projekty" element={<Projects />} />
          <Route path="projekty/:id" element={<ProjectDetail />} />
          <Route path="sites" element={<Sites />} />
          <Route path="sites/new" element={<NewSite />} />
          <Route path="sites/:id" element={<SiteDetail />} />
          <Route path="sites/:id/edit" element={<EditSite />} />
          <Route path="nastaveni" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
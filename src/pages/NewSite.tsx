import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createSite } from '../lib/api/sites';
import { SiteForm } from '../components/SiteForm';

export function NewSite() {
  const navigate = useNavigate();

  const handleSubmit = async (data: Parameters<typeof createSite>[0]) => {
    try {
      const newSite = await createSite(data);
      navigate(`/sites/${newSite.id}`);
    } catch (error) {
      console.error('Chyba při vytváření situ:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Nový site</h1>
      
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="p-6">
          <SiteForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/sites')}
            submitLabel="Vytvořit site"
          />
        </div>
      </div>
    </div>
  );
}

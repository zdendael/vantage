import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSite, updateSite } from '../lib/api/sites';
import { SiteForm } from '../components/SiteForm';
import type { Site } from '../types';

export function EditSite() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [site, setSite] = useState<Site | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSite = async () => {
      if (!id) return;
      
      try {
        const data = await getSite(id);
        setSite(data);
      } catch (error) {
        console.error('Chyba při načítání situ:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSite();
  }, [id]);

  const handleSubmit = async (data: Parameters<typeof updateSite>[1]) => {
    if (!id) return;

    try {
      await updateSite(id, data);
      navigate(`/sites/${id}`);
    } catch (error) {
      console.error('Chyba při aktualizaci situ:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Site nebyl nalezen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Upravit site</h1>
      
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="p-6">
          <SiteForm
            initialData={site}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/sites/${id}`)}
            submitLabel="Uložit změny"
          />
        </div>
      </div>
    </div>
  );
}
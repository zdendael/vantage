import React, { useState } from 'react';
import { FileText, Calendar, Info, MapPin, Radio } from 'lucide-react';
import { validateGpsFormat, normalizeGpsCoordinates } from '../../lib/utils/coordinates';
import type { Project } from '../../types';
import { searchAddress } from '../../lib/utils/geocoding';

interface ProjectEditTabsProps {
  project: Project;
  onSubmit: (data: Partial<Project>) => void;
  onClose: () => void;
}

type Tab = {
  id: string;
  name: string;
  icon: React.ReactNode;
};

const TABS: Tab[] = [
  { id: 'basic', name: 'Základní informace', icon: <Info className="h-5 w-5" /> },
  { id: 'location', name: 'Lokalita', icon: <MapPin className="h-5 w-5" /> },
  { id: 'dates', name: 'Termíny', icon: <Calendar className="h-5 w-5" /> },
  { id: 'documents', name: 'Dokumenty', icon: <FileText className="h-5 w-5" /> }
];

export function ProjectEditTabs({ project, onSubmit, onClose }: ProjectEditTabsProps) {
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || '',
    address: project.address || '',
    gpsCoordinates: project.gpsCoordinates || '',
    microwaveBand: project.microwaveBand || '',
    startDate: project.startDate.split('T')[0],
    endDate: project.endDate ? project.endDate.split('T')[0] : ''
  });
  const [addressSuggestions, setAddressSuggestions] = useState<Array<{
    address: string;
    coordinates: string;
  }>>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [gpsError, setGpsError] = useState('');

  const handleGpsChange = (value: string) => {
    const normalized = normalizeGpsCoordinates(value);
    setFormData({ ...formData, gpsCoordinates: normalized });
    if (!validateGpsFormat(normalized) && normalized.trim()) {
      setGpsError('GPS souřadnice musí být ve formátu: 50°41\'14.388"N 13°58\'40.115"E');
    } else {
      setGpsError('');
    }
  };

  const handleAddressSearch = async (query: string) => {
    if (!query) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }

    try {
      const suggestions = await searchAddress(query);
      setAddressSuggestions(suggestions);
      setShowAddressSuggestions(true);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
    }
  };

  const handleAddressSelect = (suggestion: { address: string; coordinates: string }) => {
    setFormData(prev => ({
      ...prev,
      address: suggestion.address,
      gpsCoordinates: suggestion.coordinates
    }));
    setShowAddressSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.gpsCoordinates && !validateGpsFormat(formData.gpsCoordinates)) {
      return;
    }
    const updatedData = {
      ...formData,
      endDate: formData.endDate || null,
      gpsCoordinates: formData.gpsCoordinates,
      microwaveBand: formData.microwaveBand || null
    };
    onSubmit(updatedData);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Název projektu
              </label>
              <input
                type="text"
                id="name"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Popis
              </label>
              <textarea
                id="description"
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-4">
            <div className="relative">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Adresa
              </label>
              <input
                type="text"
                id="address"
                autoComplete="off"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.address}
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value });
                  handleAddressSearch(e.target.value);
                }}
                onFocus={() => {
                  if (formData.address) {
                    handleAddressSearch(formData.address);
                  }
                }}
              />
              {showAddressSuggestions && addressSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
                  <ul className="max-h-60 overflow-auto py-1">
                    {addressSuggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => handleAddressSelect(suggestion)}
                      >
                        {suggestion.address}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="gpsCoordinates" className="block text-sm font-medium text-gray-700">
                GPS Souřadnice
              </label>
              <input
                type="text"
                id="gpsCoordinates"
                placeholder="50°41'14.388&quot;N 13°58'40.115&quot;E"
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 ${
                  gpsError ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                }`}
                value={formData.gpsCoordinates}
                onChange={(e) => handleGpsChange(e.target.value)}
              />
              {gpsError && (
                <p className="mt-1 text-sm text-red-600">{gpsError}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Formát: 50°41'14.388"N 13°58'40.115"E
              </p>

              <div>
                <label htmlFor="microwaveBand" className="block text-sm font-medium text-gray-700">
                  Frekvenční pásmo spoje
                </label>
                <select
                  id="microwaveBand"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.microwaveBand || ''}
                  onChange={(e) => setFormData({ ...formData, microwaveBand: e.target.value })}
                >
                  <option value="">Vyberte pásmo</option>
                  <optgroup label="Bezlicenční pásma">
                    <option value="2.4 GHz (bezlicenční)">2.4 GHz</option>
                    <option value="5 GHz (bezlicenční)">5 GHz</option>
                    <option value="10.5 GHz (bezlicenční)">10.5 GHz</option>
                    <option value="17 GHz (bezlicenční)">17 GHz</option>
                    <option value="24 GHz (bezlicenční)">24 GHz</option>
                    <option value="57-66 GHz (bezlicenční)">57-66 GHz</option>
                  </optgroup>
                  <optgroup label="Licencovaná pásma">
                    <option value="11 GHz (licencované)">11 GHz</option>
                    <option value="13 GHz (licencované)">13 GHz</option>
                    <option value="18 GHz (licencované)">18 GHz</option>
                    <option value="23 GHz (licencované)">23 GHz</option>
                    <option value="26 GHz (licencované)">26 GHz</option>
                    <option value="32 GHz (licencované)">32 GHz</option>
                    <option value="38 GHz (licencované)">38 GHz</option>
                    <option value="42 GHz (licencované)">42 GHz</option>
                  </optgroup>
                  <optgroup label="Speciální pásma">
                    <option value="71-76 / 81-86 GHz (E-Band)">71-76 / 81-86 GHz (E-Band)</option>
                  </optgroup>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Volitelné - můžete specifikovat později během realizace projektu
                </p>
              </div>
            </div>
          </div>
        );

      case 'dates':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Datum zahájení
              </label>
              <input
                type="date"
                id="startDate"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                Datum dokončení
              </label>
              <input
                type="date"
                id="endDate"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="text-center py-8 text-gray-500">
            Správa dokumentů bude implementována v další verzi.
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full">
        <div className="flex h-full">
          {/* Sidebar with tabs */}
          <div className="w-64 border-r border-gray-200 p-4">
            <nav className="space-y-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {tab.icon}
                  <span className="ml-3">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1">
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  {TABS.find(tab => tab.id === activeTab)?.name}
                </h2>
                {renderTabContent()}
              </div>

              <div className="border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Uložit změny
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

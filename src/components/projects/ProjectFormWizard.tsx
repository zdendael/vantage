import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { searchAddress } from '../../lib/utils/geocoding';
import type { Project, Site } from '../../types';

interface ProjectFormWizardProps {
  initialData?: Partial<Project>;
  sites: Site[];
  onSubmit: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  onClose: () => void;
  submitLabel: string;
}

type Step = {
  title: string;
  description: string;
};

const STEPS: Step[] = [
  {
    title: 'Základní informace',
    description: 'Název a popis projektu'
  },
  {
    title: 'Lokalita',
    description: 'Výběr situ a umístění'
  },
  {
    title: 'Časový plán',
    description: 'Termíny realizace'
  }
];

export function ProjectFormWizard({ initialData, sites, onSubmit, onClose, submitLabel }: ProjectFormWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    siteId: initialData?.siteId || '',
    microwaveBand: initialData?.microwaveBand || '',
    address: initialData?.address || '',
    gpsCoordinates: initialData?.gpsCoordinates || '',
    startDate: initialData?.startDate ? initialData.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: initialData?.endDate ? initialData.endDate.split('T')[0] : ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<Array<{
    address: string;
    coordinates: string;
  }>>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);

  const filteredSites = sites
    .filter(site => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return site.siteId.toLowerCase().includes(query) ||
             site.location.toLowerCase().includes(query);
    })
    .sort((a, b) => a.siteId.localeCompare(b.siteId));

  const selectedSite = sites.find(site => site.id === formData.siteId);

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

  const handleAddressSelect = (suggestion: any) => {
    setFormData(prev => ({
      ...prev,
      address: suggestion.address || '',
      gpsCoordinates: suggestion.coordinates || ''
    }));
    setShowAddressSuggestions(false);
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      if (!isStepComplete(currentStep)) {
        return;
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStepComplete(currentStep)) {
      return;
    }
    const submissionData = {
      name: formData.name,
      siteId: formData.siteId,
      startDate: formData.startDate,
      description: formData.description || undefined,
      address: formData.address || undefined,
      gpsCoordinates: formData.gpsCoordinates || undefined,
      microwaveBand: formData.microwaveBand || undefined
    };
    onSubmit(submissionData);
  };

  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!formData.name;
      case 1:
        return !!formData.siteId;
      case 2:
        return !!formData.startDate;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Název projektu *
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

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="site-search" className="block text-sm font-medium text-gray-700">
                Site *
              </label>
              <div className="mt-1 space-y-2">
                <input
                  type="text"
                  id="site-search"
                  placeholder="Vyhledat site podle ID..."
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select
                  id="site"
                  required
                  size={5}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.siteId}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      siteId: e.target.value
                    });
                  }}
                >
                  <option value="">Vyberte site</option>
                  {filteredSites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.siteId} - {site.location}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="microwaveBand" className="block text-sm font-medium text-gray-700">
                Frekvenční pásmo
                <span className="text-sm font-normal text-gray-500 ml-1">
                  (volitelné)
                </span>
              </label>
              <select
                id="microwaveBand"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.microwaveBand}
                onChange={(e) => setFormData({ ...formData, microwaveBand: e.target.value })}
              >
                <option value="">Bude specifikováno později</option>
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
            </div>

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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.gpsCoordinates}
                onChange={(e) => setFormData(prev => ({ ...prev, gpsCoordinates: e.target.value }))}
              />
              {selectedSite?.gpsCoordinates && (
                <button
                  type="button"
                  className="mt-1 text-sm text-indigo-600 hover:text-indigo-800"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    gpsCoordinates: selectedSite.gpsCoordinates || ''
                  }))}
                >
                  Použít GPS souřadnice ze situ
                </button>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Formát: 50°41'14.388"N 13°58'40.115"E
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Datum zahájení *
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

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full">
        <div className="border-b border-gray-200 w-full">
          <nav className="p-4">
            <ol className="flex items-center justify-between w-full">
              {STEPS.map((step, index) => (
                <li key={step.title} className="relative flex-1">
                  {index > 0 && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-full -translate-x-1/2 h-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="group relative flex items-center w-full">
                    <span className="flex items-center">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          index < currentStep 
                            ? 'bg-indigo-600'
                            : index === currentStep
                            ? 'border-2 border-indigo-600 bg-white'
                            : 'border-2 border-gray-300 bg-white'
                        }`}
                      >
                        {index < currentStep ? (
                          <Check className="h-5 w-5 text-white" />
                        ) : (
                          <span className={`text-sm font-medium ${
                            index === currentStep ? 'text-indigo-600' : 'text-gray-500'
                          }`}>
                            {index + 1}
                          </span>
                        )}
                      </span>
                    </span>
                    <div className="ml-4 min-w-0 flex-1">
                      <span className={`text-sm font-medium ${
                        index <= currentStep ? 'text-indigo-600' : 'text-gray-500' 
                      }`}>
                        {step.title}
                      </span>
                      <p className="text-sm text-gray-500">{step.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-8">
            {renderStepContent()}
          </div>

          <div className="border-t border-gray-200 px-6 py-4 flex justify-between">
            <div>
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                >
                  Zpět
                </button>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
              >
                Zrušit
              </button>
              {currentStep < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStepComplete(currentStep)}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
                >
                  Další
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isStepComplete(currentStep)}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
                >
                  {submitLabel}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

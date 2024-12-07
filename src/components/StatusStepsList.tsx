import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Plus, Save, X } from 'lucide-react';
import type { ProjectStatusStep } from '../types';

interface StatusStepsListProps {
  steps: ProjectStatusStep[];
  onAddStep: (step: Omit<ProjectStatusStep, 'id' | 'statusId'>) => Promise<void>;
  onUpdateStep: (id: string, data: Partial<ProjectStatusStep>) => Promise<void>;
  onDeleteStep: (id: string) => Promise<void>;
  onReorderSteps: (steps: ProjectStatusStep[]) => Promise<void>;
}

interface StepFormData {
  name: string;
  description: string;
}

function StepForm({ initialData, onSubmit, onCancel }: {
  initialData: StepFormData;
  onSubmit: (data: StepFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<StepFormData>(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Název kroku
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
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <X className="h-4 w-4 mr-1" />
          Zrušit
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Save className="h-4 w-4 mr-1" />
          Uložit
        </button>
      </div>
    </form>
  );
}

export function StatusStepsList({
  steps,
  onAddStep,
  onUpdateStep,
  onDeleteStep,
  onReorderSteps
}: StatusStepsListProps) {
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [isAddingStep, setIsAddingStep] = useState(false);

  const handleSubmit = async (data: StepFormData) => {
    if (editingStep) {
      await onUpdateStep(editingStep, data);
      setEditingStep(null);
    } else {
      await onAddStep({
        ...data,
        position: steps.length
      });
      setIsAddingStep(false);
    }
  };

  const handleEdit = (step: ProjectStatusStep) => {
    setEditingStep(step.id);
    setIsAddingStep(false);
  };

  const handleCancel = () => {
    setEditingStep(null);
    setIsAddingStep(false);
  };

  const moveStep = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === steps.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newSteps = [...steps];
    const [movedStep] = newSteps.splice(index, 1);
    newSteps.splice(newIndex, 0, movedStep);

    const updatedSteps = newSteps.map((step, i) => ({
      ...step,
      position: i
    }));

    await onReorderSteps(updatedSteps);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {steps.map((step, index) => (
          editingStep === step.id ? (
            <div key={step.id} className="p-3 bg-gray-50 rounded-lg">
              <StepForm
                initialData={{
                  name: step.name,
                  description: step.description || ''
                }}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </div>
          ) : (
            <div
              key={step.id}
              className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg"
            >
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => moveStep(index, 'up')}
                  disabled={index === 0}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    index === 0 ? 'text-gray-300' : 'text-gray-500'
                  }`}
                  title="Posunout nahoru"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => moveStep(index, 'down')}
                  disabled={index === steps.length - 1}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    index === steps.length - 1 ? 'text-gray-300' : 'text-gray-500'
                  }`}
                  title="Posunout dolů"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">{step.name}</h4>
                {step.description && (
                  <p className="mt-1 text-sm text-gray-500">{step.description}</p>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(step)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Upravit
                </button>
                <button
                  onClick={() => onDeleteStep(step.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Smazat
                </button>
              </div>
            </div>
          )
        ))}
      </div>

      {!editingStep && !isAddingStep ? (
        <button
          onClick={() => setIsAddingStep(true)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Plus className="h-4 w-4 mr-1" />
          Přidat krok
        </button>
      ) : isAddingStep && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <StepForm
            initialData={{ name: '', description: '' }}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      )}
    </div>
  );
}
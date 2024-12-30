import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { getProjectStatuses, updateProjectStatus, createProjectStatus, deleteProjectStatus, reorderProjectStatuses } from '../lib/api/projectStatuses';
import { createProjectStatusStep, updateProjectStatusStep, deleteProjectStatusStep } from '../lib/api/projectStatusSteps';
import { StatusSettingsForm } from '../components/StatusSettingsForm';
import { StatusStepsList } from '../components/StatusStepsList';
import { StatusList } from '../components/StatusList';
import { NewStatusDialog } from '../components/NewStatusDialog';
import { StatusSection } from '../components/settings/StatusSection';
import type { ProjectStatusSettings, ProjectStatusStep } from '../types';

export function Settings() {
  const [statuses, setStatuses] = useState<ProjectStatusSettings[]>([]);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [editingSteps, setEditingSteps] = useState<string | null>(null);
  const [isNewStatusDialogOpen, setIsNewStatusDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const data = await getProjectStatuses();
        setStatuses(data);
      } catch (error) {
        console.error('Chyba při načítání stavů:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStatuses();
  }, []);

  const handleStatusUpdate = async (status: ProjectStatusSettings, data: Partial<ProjectStatusSettings>) => {
    try {
      const updatedStatus = await updateProjectStatus(status.id, data);
      setStatuses(statuses.map(s => s.id === status.id ? updatedStatus : s));
      setEditingStatus(null);
    } catch (error) {
      console.error('Chyba při aktualizaci stavu:', error);
    }
  };

  const handleStatusCreate = async (data: Partial<ProjectStatusSettings>) => {
    try {
      const newStatus = await createProjectStatus(data as any);
      setStatuses([...statuses, newStatus]);
      setIsNewStatusDialogOpen(false);
    } catch (error) {
      console.error('Chyba při vytváření stavu:', error);
    }
  };

  const handleStatusDelete = async (statusId: string) => {
    if (!confirm('Opravdu chcete smazat tento stav? Budou smazány i všechny jeho kroky.')) {
      return;
    }

    try {
      await deleteProjectStatus(statusId);
      setStatuses(statuses.filter(s => s.id !== statusId));
    } catch (error) {
      console.error('Chyba při mazání stavu:', error);
    }
  };

  const handleStatusReorder = async (reorderedStatuses: ProjectStatusSettings[]) => {
    try {
      await reorderProjectStatuses(reorderedStatuses);
      setStatuses(reorderedStatuses);
    } catch (error) {
      console.error('Chyba při změně pořadí stavů:', error);
    }
  };

  const handleAddStep = async (statusId: string, data: Omit<ProjectStatusStep, 'id' | 'statusId'>) => {
    try {
      const newStep = await createProjectStatusStep(statusId, data);
      setStatuses(statuses.map(status => 
        status.id === statusId 
          ? { ...status, steps: [...status.steps, newStep] }
          : status
      ));
    } catch (error) {
      console.error('Chyba při přidávání kroku:', error);
    }
  };

  const handleUpdateStep = async (stepId: string, data: Partial<ProjectStatusStep>) => {
    try {
      const updatedStep = await updateProjectStatusStep(stepId, data);
      setStatuses(statuses.map(status => ({
        ...status,
        steps: status.steps.map(step => 
          step.id === stepId ? updatedStep : step
        )
      })));
    } catch (error) {
      console.error('Chyba při aktualizaci kroku:', error);
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    try {
      await deleteProjectStatusStep(stepId);
      setStatuses(statuses.map(status => ({
        ...status,
        steps: status.steps.filter(step => step.id !== stepId)
      })));
    } catch (error) {
      console.error('Chyba při mazání kroku:', error);
    }
  };

  const handleReorderSteps = async (statusId: string, steps: ProjectStatusStep[]) => {
    try {
      await Promise.all(
        steps.map(step => updateProjectStatusStep(step.id, { position: step.position }))
      );
      setStatuses(statuses.map(status => 
        status.id === statusId ? { ...status, steps } : status
      ));
    } catch (error) {
      console.error('Chyba při změně pořadí kroků:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const initialStatus = statuses.find(s => s.type === 'initial');
  const regularStatuses = statuses.filter(s => s.type === 'regular');
  const finalStatus = statuses.find(s => s.type === 'final');

  const currentEditingStatus = editingStatus ? statuses.find(s => s.id === editingStatus) : null;
  const currentEditingStepsStatus = editingSteps ? statuses.find(s => s.id === editingSteps) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Nastavení</h1>
      
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Stavy projektů</h2>
            <button
              onClick={() => setIsNewStatusDialogOpen(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Nový stav
            </button>
          </div>
          
          <div className="space-y-8">
            {/* Počáteční stav */}
            {initialStatus && (
              <StatusSection
                title="Počáteční stav"
                status={initialStatus}
                disabled
              />
            )}

            {/* Průběžné stavy */}
            <div className="space-y-6">
              <h3 className="text-sm font-medium text-gray-500">Průběžné stavy</h3>
              <StatusList
                statuses={regularStatuses}
                onEdit={(status) => setEditingStatus(status.id)}
                onDelete={handleStatusDelete}
                onReorder={handleStatusReorder}
                onEditSteps={(statusId) => setEditingSteps(statusId)}
              />
            </div>

            {/* Koncový stav */}
            {finalStatus && (
              <StatusSection
                title="Koncový stav"
                status={finalStatus}
                disabled
              />
            )}
          </div>

          {/* Editace stavu */}
          {currentEditingStatus && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-lg w-full p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Upravit stav</h2>
                <StatusSettingsForm
                  status={currentEditingStatus}
                  onSave={(data) => handleStatusUpdate(currentEditingStatus, data)}
                  onCancel={() => setEditingStatus(null)}
                />
              </div>
            </div>
          )}

          {/* Editace kroků */}
          {currentEditingStepsStatus && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-lg w-full p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Kroky stavu: {currentEditingStepsStatus.name}
                </h2>
                <StatusStepsList
                  steps={currentEditingStepsStatus.steps}
                  onAddStep={(data) => handleAddStep(currentEditingStepsStatus.id, data)}
                  onUpdateStep={handleUpdateStep}
                  onDeleteStep={handleDeleteStep}
                  onReorderSteps={(steps) => handleReorderSteps(currentEditingStepsStatus.id, steps)}
                />
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setEditingSteps(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Zavřít
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isNewStatusDialogOpen && (
        <NewStatusDialog
          onSubmit={handleStatusCreate}
          onClose={() => setIsNewStatusDialogOpen(false)}
        />
      )}
    </div>
  );
}

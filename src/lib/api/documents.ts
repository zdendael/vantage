import { supabase } from '../supabase';
import type { Database } from '../database.types';
import type { Document, DocumentType } from '../../types';

type DocumentRow = Database['public']['Tables']['documents']['Row'];

const mapDocumentFromDb = (document: DocumentRow): Document => ({
  id: document.id,
  projectId: document.project_id,
  name: document.name,
  type: document.type as DocumentType,
  url: document.url,
  version: document.version,
  createdAt: document.created_at
});

export const getProjectDocuments = async (projectId: string): Promise<Document[]> => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Chyba při načítání dokumentů: ' + error.message);
  }

  return (data || []).map(mapDocumentFromDb);
};

export const createDocument = async (document: Omit<Document, 'id' | 'createdAt'>): Promise<Document> => {
  const { data, error } = await supabase
    .from('documents')
    .insert([{
      project_id: document.projectId,
      name: document.name,
      type: document.type,
      url: document.url,
      version: document.version
    }])
    .select()
    .single();

  if (error) {
    throw new Error('Chyba při vytváření dokumentu: ' + error.message);
  }

  return mapDocumentFromDb(data);
};
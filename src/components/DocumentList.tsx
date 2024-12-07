import React from 'react';
import { FileText } from 'lucide-react';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import type { Document } from '../types';

interface DocumentListProps {
  documents: Document[];
}

const getDocumentTypeText = (type: string) => {
  const types = {
    technical_approval: 'Technický souhlas',
    installation_protocol: 'Instalační protokol',
    lease_agreement: 'Nájemní smlouva',
    other: 'Ostatní'
  };
  return types[type as keyof typeof types] || type;
};

export function DocumentList({ documents }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">Zatím nebyly přidány žádné dokumenty.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
        >
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">{doc.name}</p>
              <p className="text-xs text-gray-500">
                {getDocumentTypeText(doc.type)} • v{doc.version} • 
                {format(new Date(doc.createdAt), 'd. MMMM yyyy', { locale: cs })}
              </p>
            </div>
          </div>
          
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Zobrazit
          </a>
        </div>
      ))}
    </div>
  );
}
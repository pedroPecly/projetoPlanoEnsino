import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { VisitaTecnica } from '../tipos';

interface Props {
  visitas: VisitaTecnica[];
  onChange: (visitas: VisitaTecnica[]) => void;
}

export function VisitasTecnicas({ visitas = [], onChange }: Props) {
  const addVisita = () => {
    onChange([
      ...visitas,
      {
        id: crypto.randomUUID(),
        local: '',
        data_prevista: '',
        materiais_necessarios: ['']
      }
    ]);
  };

  const removeVisita = (id: string) => {
    onChange(visitas.filter(visita => visita.id !== id));
  };

  const updateVisita = (id: string, field: keyof VisitaTecnica, value: any) => {
    onChange(visitas.map(visita => 
      visita.id === id ? { ...visita, [field]: value } : visita
    ));
  };

  const addMaterial = (id: string) => {
    onChange(visitas.map(visita => 
      visita.id === id ? {
        ...visita,
        materiais_necessarios: [...visita.materiais_necessarios, '']
      } : visita
    ));
  };

  const removeMaterial = (id: string, index: number) => {
    onChange(visitas.map(visita => 
      visita.id === id ? {
        ...visita,
        materiais_necessarios: visita.materiais_necessarios.filter((_, i) => i !== index)
      } : visita
    ));
  };

  const updateMaterial = (id: string, index: number, value: string) => {
    onChange(visitas.map(visita => 
      visita.id === id ? {
        ...visita,
        materiais_necessarios: visita.materiais_necessarios.map((mat, i) => i === index ? value : mat)
      } : visita
    ));
  };

  return (
    <div className="space-y-6">
      {visitas.map((visita) => (
        <div key={visita.id} className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Visita Técnica</h3>
            <button
              type="button"
              onClick={() => removeVisita(visita.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Local</label>
              <input
                type="text"
                value={visita.local}
                onChange={(e) => updateVisita(visita.id, 'local', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Local da visita"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Data Prevista</label>
              <input
                type="date"
                value={visita.data_prevista}
                onChange={(e) => updateVisita(visita.id, 'data_prevista', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Materiais Necessários</label>
            {visita.materiais_necessarios.map((material, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={material}
                  onChange={(e) => updateMaterial(visita.id, index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Descreva o material necessário"
                />
                <button
                  type="button"
                  onClick={() => removeMaterial(visita.id, index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addMaterial(visita.id)}
              className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Material
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addVisita}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2b9f3f] hover:bg-[#248a35]"
      >
        <Plus className="h-5 w-5 mr-2" />
        Adicionar Visita Técnica
      </button>
    </div>
  );
}
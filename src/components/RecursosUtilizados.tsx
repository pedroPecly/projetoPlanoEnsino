import React, { useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { RecursoUtilizado } from '../tipos';

interface Props {
  recursos: RecursoUtilizado[];
  onChange: (recursos: RecursoUtilizado[]) => void;
}

export function RecursosUtilizados({ recursos = [], onChange }: Props) {
  useEffect(() => {
    // Adiciona um recurso inicial se o array estiver vazio
    if (recursos.length === 0) {
      onChange([
        {
          id: crypto.randomUUID(),
          tipo: 'fisico',
          descricao: '',
          quantidade: 1
        }
      ]);
    }
  }, [recursos, onChange]);

  const addRecurso = () => {
    onChange([
      ...recursos,
      {
        id: crypto.randomUUID(),
        tipo: 'fisico',
        descricao: '',
        quantidade: 1
      }
    ]);
  };

  const removeRecurso = (id: string) => {
    onChange(recursos.filter(recurso => recurso.id !== id));
  };

  const updateRecurso = (id: string, field: keyof RecursoUtilizado, value: any) => {
    onChange(recursos.map(recurso => 
      recurso.id === id ? { ...recurso, [field]: value } : recurso
    ));
  };

  return (
    <div className="space-y-4">
      {recursos.map((recurso) => (
        <div key={recurso.id} className="flex flex-wrap gap-4 items-start p-4 border rounded-lg bg-white">
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <select
              value={recurso.tipo}
              onChange={(e) => updateRecurso(recurso.id, 'tipo', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none hover:bg-gray-50"
            >
              <option value="fisico">Físico</option>
              <option value="material">Material</option>
              <option value="tecnologia">Tecnologia</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Descrição</label>
            <input
              type="text"
              value={recurso.descricao}
              onChange={(e) => updateRecurso(recurso.id, 'descricao', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none hover:bg-gray-50"
              placeholder="Descreva o recurso"
            />
          </div>

          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700">Quantidade</label>
            <input
              type="number"
              value={recurso.quantidade}
              onChange={(e) => updateRecurso(recurso.id, 'quantidade', parseInt(e.target.value))}
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none hover:bg-gray-50"
            />
          </div>

          <button
            type="button"
            onClick={() => removeRecurso(recurso.id)}
            className="mt-6 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addRecurso}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2b9f3f] hover:bg-[#248a35]"
      >
        <Plus className="h-5 w-5 mr-2" />
        Adicionar Recurso
      </button>
    </div>
  );
}
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { CriterioAvaliacao } from '../tipos';

interface Props {
  criterios: CriterioAvaliacao[];
  onChange: (criterios: CriterioAvaliacao[]) => void;
}

export function CriteriosAvaliacao({ criterios, onChange }: Props) {
  const addCriterio = () => {
    onChange([...criterios, { descricao: '', peso: 0 }]);
  };

  const removeCriterio = (index: number) => {
    onChange(criterios.filter((_, i) => i !== index));
  };

  const updateCriterio = (index: number, field: keyof CriterioAvaliacao, value: string | number) => {
    const newCriterios = criterios.map((criterio, i) => {
      if (i === index) {
        return { ...criterio, [field]: value };
      }
      return criterio;
    });
    onChange(newCriterios);
  };

  const totalPeso = criterios.reduce((sum, criterio) => sum + criterio.peso, 0);

  return (
    <div className="space-y-4">
      {criterios.map((criterio, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={criterio.descricao}
              onChange={(e) => updateCriterio(index, 'descricao', e.target.value)}
              placeholder="Descrição do critério"
              className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="w-32">
            <div className="relative rounded-md shadow-sm">
              <input
                type="number"
                value={criterio.peso}
                onChange={(e) => updateCriterio(index, 'peso', parseFloat(e.target.value) || 0)}
                className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => removeCriterio(index)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      ))}

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={addCriterio}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2b9f3f] hover:bg-[#248a35]"
        >
          <Plus className="h-5 w-5 mr-2" />
          Adicionar Critério
        </button>

        <div className={`text-sm font-medium ${totalPeso === 100 ? 'text-green-600' : 'text-red-600'}`}>
          Total: {totalPeso}%
        </div>
      </div>
    </div>
  );
}
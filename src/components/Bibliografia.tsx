import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  basica: string[];
  complementar: string[];
  onChange: (tipo: 'basica' | 'complementar', referencias: string[]) => void;
}

export function Bibliografia({ basica, complementar, onChange }: Props) {
  const addReferencia = (tipo: 'basica' | 'complementar') => {
    const referencias = tipo === 'basica' ? basica : complementar;
    onChange(tipo, [...referencias, '']);
  };

  const removeReferencia = (tipo: 'basica' | 'complementar', index: number) => {
    const referencias = tipo === 'basica' ? basica : complementar;
    onChange(tipo, referencias.filter((_, i) => i !== index));
  };

  const updateReferencia = (tipo: 'basica' | 'complementar', index: number, value: string) => {
    const referencias = tipo === 'basica' ? basica : complementar;
    const newReferencias = referencias.map((ref, i) => i === index ? value : ref);
    onChange(tipo, newReferencias);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Bibliografia Básica</h3>
        <div className="space-y-2">
          {basica.map((referencia, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={referencia}
                onChange={(e) => updateReferencia('basica', index, e.target.value)}
                className="flex-1 rounded-md border-gray-300 focus:outline-none hover:bg-gray-50"
                placeholder="Digite a referência bibliográfica"
              />
              <button
                type="button"
                onClick={() => removeReferencia('basica', index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addReferencia('basica')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2b9f3f] hover:bg-[#248a35]"
          >
            <Plus className="h-5 w-5 mr-2" />
            Adicionar Referência Básica
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Bibliografia Complementar</h3>
        <div className="space-y-2">
          {complementar.map((referencia, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={referencia}
                onChange={(e) => updateReferencia('complementar', index, e.target.value)}
                className="flex-1 rounded-md border-gray-300 focus:outline-none hover:bg-gray-50"
                placeholder="Digite a referência bibliográfica"
              />
              <button
                type="button"
                onClick={() => removeReferencia('complementar', index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addReferencia('complementar')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2b9f3f] hover:bg-[#248a35]"
          >
            <Plus className="h-5 w-5 mr-2" />
            Adicionar Referência Complementar
          </button>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { CronogramaItem } from '../tipos';

interface Props {
  cronograma: CronogramaItem[];
  onChange: (cronograma: CronogramaItem[]) => void;
}

export function Cronograma({ cronograma = [], onChange }: Props) {
  const addItem = () => {
    onChange([
      ...cronograma,
      {
        id: crypto.randomUUID(),
        semana: cronograma.length + 1,
        data_inicio: '',
        data_fim: '',
        atividades: [''],
        recursos: [''],
        avaliacao: ''
      }
    ]);
  };

  const removeItem = (id: string) => {
    onChange(cronograma.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof CronogramaItem, value: any) => {
    onChange(cronograma.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const addAtividade = (id: string) => {
    onChange(cronograma.map(item => 
      item.id === id ? { ...item, atividades: [...item.atividades, ''] } : item
    ));
  };

  const removeAtividade = (id: string, index: number) => {
    onChange(cronograma.map(item => 
      item.id === id ? { ...item, atividades: item.atividades.filter((_, i) => i !== index) } : item
    ));
  };

  const updateAtividade = (id: string, index: number, value: string) => {
    onChange(cronograma.map(item => 
      item.id === id ? {
        ...item,
        atividades: item.atividades.map((atv, i) => i === index ? value : atv)
      } : item
    ));
  };

  const addRecurso = (id: string) => {
    onChange(cronograma.map(item => 
      item.id === id ? { ...item, recursos: [...item.recursos, ''] } : item
    ));
  };

  const removeRecurso = (id: string, index: number) => {
    onChange(cronograma.map(item => 
      item.id === id ? { ...item, recursos: item.recursos.filter((_, i) => i !== index) } : item
    ));
  };

  const updateRecurso = (id: string, index: number, value: string) => {
    onChange(cronograma.map(item => 
      item.id === id ? {
        ...item,
        recursos: item.recursos.map((rec, i) => i === index ? value : rec)
      } : item
    ));
  };

  return (
    <div className="space-y-6">
      {cronograma.map((item) => (
        <div key={item.id} className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Semana {item.semana}</h3>
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Data Início</label>
              <input
                type="date"
                value={item.data_inicio}
                onChange={(e) => updateItem(item.id, 'data_inicio', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none hover:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Data Fim</label>
              <input
                type="date"
                value={item.data_fim}
                onChange={(e) => updateItem(item.id, 'data_fim', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none hover:bg-gray-50"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Atividades</label>
            {item.atividades.map((atividade, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={atividade}
                  onChange={(e) => updateAtividade(item.id, index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:outline-none hover:bg-gray-50"
                  placeholder="Descreva a atividade"
                />
                <button
                  type="button"
                  onClick={() => removeAtividade(item.id, index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addAtividade(item.id)}
              className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Atividade
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Recursos Necessários</label>
            {item.recursos.map((recurso, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={recurso}
                  onChange={(e) => updateRecurso(item.id, index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:outline-none hover:bg-gray-50"
                  placeholder="Descreva o recurso necessário"
                />
                <button
                  type="button"
                  onClick={() => removeRecurso(item.id, index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addRecurso(item.id)}
              className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Recurso
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Avaliação</label>
            <textarea
              value={item.avaliacao}
              onChange={(e) => updateItem(item.id, 'avaliacao', e.target.value)}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none hover:bg-gray-50"
              placeholder="Descreva a avaliação para esta semana (opcional)"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2b9f3f] hover:bg-[#248a35]"
      >
        <Plus className="h-5 w-5 mr-2" />
        Adicionar Semana
      </button>
    </div>
  );
}
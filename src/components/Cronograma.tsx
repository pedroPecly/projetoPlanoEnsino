import React, { useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { CronogramaItem, CronogramaTopico } from '../tipos';

interface Props {
  cronograma: CronogramaItem[];
  onChange: (cronograma: CronogramaItem[]) => void;
}

export function Cronograma({ cronograma = [], onChange }: Props) {
  useEffect(() => {
    // Adiciona um item inicial ao cronograma se estiver vazio
    if (cronograma.length === 0) {
      onChange([
        {
          id: crypto.randomUUID(),
          semana: 1,
          data_inicio: '',
          data_fim: '',
          atividades: [
            {
              id: crypto.randomUUID(),
              titulo: '',
              subtopicos: [],
              ordem: 0
            }
          ],
          avaliacao: [
            {
              id: crypto.randomUUID(),
              titulo: '',
              subtopicos: [],
              ordem: 0
            }
          ]
        }
      ]);
    }
  }, [cronograma, onChange]);

  {/*const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };*/}

  const addItem = () => {
    onChange([
      ...cronograma,
      {
        id: crypto.randomUUID(),
        semana: cronograma.length + 1,
        data_inicio: '',
        data_fim: '',
        atividades: [],
        avaliacao: []
      }
    ]);
  };

  const removeItem = (id: string) => {
    onChange(cronograma.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof CronogramaItem, value: any) => {
    onChange(
      cronograma.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addTopico = (itemId: string, tipo: 'atividades' | 'avaliacao') => {
    onChange(
      cronograma.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            [tipo]: [
              ...item[tipo],
              {
                id: crypto.randomUUID(),
                titulo: '',
                subtopicos: [],
                ordem: item[tipo].length
              }
            ]
          };
        }
        return item;
      })
    );
  };

  const addSubtopico = (itemId: string, topicoId: string, tipo: 'atividades' | 'avaliacao') => {
    onChange(
      cronograma.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            [tipo]: item[tipo].map(topico => {
              if (topico.id === topicoId) {
                return {
                  ...topico,
                  subtopicos: [
                    ...topico.subtopicos,
                    {
                      id: crypto.randomUUID(),
                      titulo: '',
                      subtopicos: [],
                      ordem: topico.subtopicos.length
                    }
                  ]
                };
              }
              return topico;
            })
          };
        }
        return item;
      })
    );
  };

  const updateTopico = (itemId: string, topicoId: string, titulo: string, tipo: 'atividades' | 'avaliacao') => {
    onChange(
      cronograma.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            [tipo]: item[tipo].map(topico => {
              if (topico.id === topicoId) {
                return { ...topico, titulo };
              }
              return topico;
            })
          };
        }
        return item;
      })
    );
  };

  const removeTopico = (itemId: string, topicoId: string, tipo: 'atividades' | 'avaliacao') => {
    onChange(
      cronograma.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            [tipo]: item[tipo].filter(topico => topico.id !== topicoId)
          };
        }
        return item;
      })
    );
  };

  const updateSubtopico = (itemId: string, topicoId: string, subtopicId: string, titulo: string, tipo: 'atividades' | 'avaliacao') => {
    onChange(
      cronograma.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            [tipo]: item[tipo].map(topico => {
              if (topico.id === topicoId) {
                return {
                  ...topico,
                  subtopicos: topico.subtopicos.map(sub =>
                    sub.id === subtopicId ? { ...sub, titulo } : sub
                  )
                };
              }
              return topico;
            })
          };
        }
        return item;
      })
    );
  };

  const removeSubtopico = (itemId: string, topicoId: string, subtopicId: string, tipo: 'atividades' | 'avaliacao') => {
    onChange(
      cronograma.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            [tipo]: item[tipo].map(topico => {
              if (topico.id === topicoId) {
                return {
                  ...topico,
                  subtopicos: topico.subtopicos.filter(sub => sub.id !== subtopicId)
                };
              }
              return topico;
            })
          };
        }
        return item;
      })
    );
  };

  const renderTopicos = (itemId: string, topicos: CronogramaTopico[], tipo: 'atividades' | 'avaliacao') => {
    return topicos.map((topico, index) => (
      <div key={topico.id} className="mb-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={topico.titulo}
            onChange={(e) => updateTopico(itemId, topico.id, e.target.value, tipo)}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:outline-none hover:bg-gray-50"
            placeholder={`Digite o ${tipo === 'atividades' ? 'tópico da atividade' : 'tópico da avaliação'}`}
          />
          <button
            type="button"
            onClick={() => addSubtopico(itemId, topico.id, tipo)}
            className="text-indigo-600 hover:text-indigo-700"
          >
            <Plus className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => removeTopico(itemId, topico.id, tipo)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        {topico.subtopicos.length > 0 && (
          <div className="ml-8 mt-2 space-y-2">
            {topico.subtopicos.map((subtopico, subIndex) => (
              <div key={subtopico.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={subtopico.titulo}
                  onChange={(e) => updateSubtopico(itemId, topico.id, subtopico.id, e.target.value, tipo)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:outline-none hover:bg-gray-50"
                  placeholder={`Digite o subtópico ${index + 1}.${subIndex + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeSubtopico(itemId, topico.id, subtopico.id, tipo)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
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
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Atividades</label>
              <button
                type="button"
                onClick={() => addTopico(item.id, 'atividades')}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Atividade
              </button>
            </div>
            {renderTopicos(item.id, item.atividades, 'atividades')}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Avaliação</label>
              <button
                type="button"
                onClick={() => addTopico(item.id, 'avaliacao')}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Avaliação
              </button>
            </div>
            {renderTopicos(item.id, item.avaliacao, 'avaliacao')}
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
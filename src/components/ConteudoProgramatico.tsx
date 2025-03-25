import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Grip, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import type { ConteudoProgramatico as IConteudoProgramatico } from '../tipos';

interface Props {
  conteudos: IConteudoProgramatico[];
  onChange: (conteudos: IConteudoProgramatico[]) => void;
}

export function ConteudoProgramatico({ conteudos = [], onChange }: Props) {
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(conteudos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      ordem: index
    }));

    onChange(updatedItems);
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const addTopico = () => {
    const newId = crypto.randomUUID();
    onChange([
      ...conteudos,
      {
        id: newId,
        titulo: '',
        data_prevista: '',
        carga_horaria: '',
        subtopicos: [],
        ordem: conteudos.length
      }
    ]);
  };

  const addSubtopico = (parentId: string) => {
    const newConteudos = conteudos.map(topico => {
      if (topico.id === parentId) {
        return {
          ...topico,
          subtopicos: [
            ...topico.subtopicos,
            {
              id: crypto.randomUUID(),
              titulo: '',
              ordem: topico.subtopicos.length,
              data_prevista: '',
              carga_horaria: '',
              subtopicos: []
            }
          ]
        };
      }
      return topico;
    });
    onChange(newConteudos);
  };

  const updateTopico = (id: string, field: string, value: string) => {
    const newConteudos = conteudos.map(topico => {
      if (topico.id === id) {
        return { ...topico, [field]: value };
      }
      return topico;
    });
    onChange(newConteudos);
  };

  const removeTopico = (id: string) => {
    onChange(conteudos.filter(topico => topico.id !== id));
  };

  return (
    <div className="space-y-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="conteudos">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {conteudos.map((topico, index) => (
                <Draggable key={topico.id} draggableId={topico.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <div {...provided.dragHandleProps}>
                          <Grip className="h-5 w-5 text-gray-400" />
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleExpand(topico.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {expandedItems.has(topico.id) ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                        </button>
                        <input
                          type="date"
                          value={topico.data_prevista || ''}
                          onChange={(e) => updateTopico(topico.id, 'data_prevista', e.target.value)}
                          className="w-40 border-gray-300 rounded-md shadow-sm focus:outline-none hover:bg-gray-50"
                        />
                        <input
                          type="text"
                          value={topico.carga_horaria || ''}
                          onChange={(e) => updateTopico(topico.id, 'carga_horaria', e.target.value)}
                          placeholder="Carga horária (ex: 2h/a)"
                          className="w-32 border-gray-300 rounded-md shadow-sm focus:outline-none hover:bg-gray-50"
                        />
                        <input
                          type="text"
                          value={topico.titulo || ''}
                          onChange={(e) => updateTopico(topico.id, 'titulo', e.target.value)}
                          className="flex-1 border-gray-300 rounded-md shadow-sm focus:outline-none hover:bg-gray-50"
                          placeholder="Digite o tópico"
                        />
                        <button
                          type="button"
                          onClick={() => addSubtopico(topico.id)}
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeTopico(topico.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      
                      {expandedItems.has(topico.id) && topico.subtopicos.length > 0 && (
                        <div className="ml-8 mt-2 space-y-2">
                          {topico.subtopicos.map((subtopico, index) => (
                            <div key={subtopico.id} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={subtopico.titulo || ''}
                                onChange={(e) => {
                                  const newConteudos = conteudos.map(t => {
                                    if (t.id === topico.id) {
                                      return {
                                        ...t,
                                        subtopicos: t.subtopicos.map(s => 
                                          s.id === subtopico.id 
                                            ? { ...s, titulo: e.target.value }
                                            : s
                                        )
                                      };
                                    }
                                    return t;
                                  });
                                  onChange(newConteudos);
                                }}
                                className="flex-1 border-gray-300 rounded-md shadow-sm focus:outline-none hover:bg-gray-50"
                                placeholder="Digite o subtópico"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newConteudos = conteudos.map(t => {
                                    if (t.id === topico.id) {
                                      return {
                                        ...t,
                                        subtopicos: t.subtopicos.filter(s => s.id !== subtopico.id)
                                      };
                                    }
                                    return t;
                                  });
                                  onChange(newConteudos);
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <button
        type="button"
        onClick={addTopico}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2b9f3f] hover:bg-[#248a35]"
      >
        <Plus className="h-5 w-5 mr-2" />
        Adicionar Tópico
      </button>
    </div>
  );
}
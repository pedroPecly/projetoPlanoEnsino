import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, X, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Curso } from '../tipos';

interface Props {
  cursos: Curso[];
  onClose: () => void;
  onUpdate: () => void;
}

export function GerenciarCursos({ cursos, onClose, onUpdate }: Props) {
  const [novoCurso, setNovoCurso] = useState('');
  const [editandoCurso, setEditandoCurso] = useState<{ id: string, nome: string } | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleAdicionarCurso(e: React.FormEvent) {
    e.preventDefault();
    if (!novoCurso.trim()) return;

    setCarregando(true);
    try {
      const { error } = await supabase
        .from('cursos')
        .insert([{ nome: novoCurso.trim() }]);

      if (error) throw error;

      setNovoCurso('');
      toast.success('Curso adicionado com sucesso!');
      onUpdate();
    } catch (error) {
      console.error('Erro ao adicionar curso:', error);
      toast.error('Erro ao adicionar curso');
    } finally {
      setCarregando(false);
    }
  }

  async function handleEditarCurso(e: React.FormEvent) {
    e.preventDefault();
    if (!editandoCurso || !editandoCurso.nome.trim()) return;

    setCarregando(true);
    try {
      const { error } = await supabase
        .from('cursos')
        .update({ nome: editandoCurso.nome.trim() })
        .eq('id', editandoCurso.id);

      if (error) throw error;

      setEditandoCurso(null);
      toast.success('Curso atualizado com sucesso!');
      onUpdate();
    } catch (error) {
      console.error('Erro ao atualizar curso:', error);
      toast.error('Erro ao atualizar curso');
    } finally {
      setCarregando(false);
    }
  }

  async function handleExcluirCurso(id: string) {
    setCarregando(true);
    try {
      const { error } = await supabase
        .from('cursos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Curso excluído com sucesso!');
      onUpdate();
    } catch (error) {
      console.error('Erro ao excluir curso:', error);
      toast.error('Erro ao excluir curso');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-lg sm:max-w-xl lg:max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Gerenciar Cursos
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleAdicionarCurso} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={novoCurso}
              onChange={(e) => setNovoCurso(e.target.value)}
              placeholder="Nome do novo curso"
              className="flex-1 rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-[#2b9f3f] focus:border-[#2b9f3f]"
            />
            <button
              type="submit"
              disabled={carregando || !novoCurso.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2b9f3f] hover:bg-[#248a35] focus:outline-none disabled:opacity-50"
            >
              <Plus className="h-5 w-5 mr-2" />
              Adicionar
            </button>
          </div>
        </form>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {cursos.map((curso) => (
            <div key={curso.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg">
              {editandoCurso?.id === curso.id ? (
                <form onSubmit={handleEditarCurso} className="flex-1 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={editandoCurso.nome}
                    onChange={(e) => setEditandoCurso({ ...editandoCurso, nome: e.target.value })}
                    className="flex-1 rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-[#2b9f3f] focus:border-[#2b9f3f]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={carregando || !editandoCurso.nome.trim()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2b9f3f] hover:bg-[#248a35] focus:outline-none disabled:opacity-50"
                    >
                      Salvar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditandoCurso(null)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <span className="text-gray-900">{curso.nome}</span>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => setEditandoCurso({ id: curso.id, nome: curso.nome })}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleExcluirCurso(curso.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
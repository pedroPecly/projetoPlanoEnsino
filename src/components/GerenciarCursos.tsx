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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg sm:max-w-xl lg:max-w-2xl w-full mx-4 overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Gerenciar Cursos</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
        <form onSubmit={handleAdicionarCurso} className="mb-5">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={novoCurso}
              onChange={(e) => setNovoCurso(e.target.value)}
              placeholder="Nome do novo curso..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b9f3f] focus:border-[#2b9f3f] transition"
            />
            <button
              type="submit"
              disabled={carregando || !novoCurso.trim()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#2b9f3f] hover:bg-[#248a35] transition shadow-sm disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </button>
          </div>
        </form>

        <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
          {cursos.map((curso) => (
            <div key={curso.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
              {editandoCurso?.id === curso.id ? (
                <form onSubmit={handleEditarCurso} className="flex-1 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={editandoCurso.nome}
                    onChange={(e) => setEditandoCurso({ ...editandoCurso, nome: e.target.value })}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b9f3f] focus:border-[#2b9f3f] transition"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={carregando || !editandoCurso.nome.trim()}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white bg-[#2b9f3f] hover:bg-[#248a35] transition disabled:opacity-50"
                    >
                      Salvar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditandoCurso(null)}
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <span className="text-sm font-medium text-gray-800">{curso.nome}</span>
                  <div className="flex gap-1.5 mt-2 sm:mt-0">
                    <button
                      onClick={() => setEditandoCurso({ id: curso.id, nome: curso.nome })}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-[#2b9f3f] hover:bg-[#2b9f3f]/10 transition"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleExcluirCurso(curso.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
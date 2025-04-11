import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Edit2, Trash2, Save, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Professor } from '../tipos';

interface Props {
  usuarios: Professor[];
  onClose: () => void;
  onUpdate: () => void;
}

export function GerenciarUsuarios({ usuarios, onClose, onUpdate }: Props) {
  const [editandoUsuario, setEditandoUsuario] = useState<{
    id: string;
    nome: string;
    email: string;
    matricula_siape: string;
    admin: boolean;
    senha?: string;
  } | null>(null);
  const [novoUsuario, setNovoUsuario] = useState<{
    nome: string;
    email: string;
    matricula_siape: string;
    admin: boolean;
    senha: string;
  } | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [filtro, setFiltro] = useState('');

  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    usuario.email.toLowerCase().includes(filtro.toLowerCase())
  );

  async function handleEditarUsuario(e: React.FormEvent) {
    e.preventDefault();
    if (!editandoUsuario) return;

    setCarregando(true);
    try {
      const { error: updateError } = await supabase
        .from('professores')
        .update({
          nome: editandoUsuario.nome,
          email: editandoUsuario.email,
          matricula_siape: editandoUsuario.matricula_siape,
          admin: editandoUsuario.admin,
        })
        .eq('id', editandoUsuario.id);

      if (updateError) throw updateError;

      if (editandoUsuario.senha) {
        const { error: passwordError } = await supabase.auth.updateUser({ password: editandoUsuario.senha });
        if (passwordError) throw passwordError;
      }

      setEditandoUsuario(null);
      toast.success('Usuário atualizado com sucesso!');
      onUpdate();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Erro ao atualizar usuário');
    } finally {
      setCarregando(false);
    }
  }

  async function handleCriarUsuario(e: React.FormEvent) {
    e.preventDefault();
    if (!novoUsuario) return;

    setCarregando(true);
    try {
      // Salva o token do usuário atual
      const { data: sessionData } = await supabase.auth.getSession();
      const currentSession = sessionData?.session;

      if (!currentSession) {
        throw new Error('Sessão atual não encontrada.');
      }

      // 1. Criar usuário na autenticação
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: novoUsuario.email,
        password: novoUsuario.senha,
        options: {
          data: {
            nome: novoUsuario.nome,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Erro ao criar usuário');

      // 2. Inserir registro na tabela de professores
      const { error: insertError } = await supabase
        .from('professores')
        .insert([
          {
            id: authData.user.id,
            nome: novoUsuario.nome,
            email: novoUsuario.email,
            matricula_siape: novoUsuario.matricula_siape,
            admin: novoUsuario.admin,
          },
        ]);

      if (insertError) throw insertError;

      // 3. Restaura a sessão do usuário atual
      const { error: restoreSessionError } = await supabase.auth.setSession({
        access_token: currentSession.access_token,
        refresh_token: currentSession.refresh_token,
      });

      if (restoreSessionError) throw restoreSessionError;

      setNovoUsuario(null);
      toast.success('Usuário criado com sucesso!');
      onUpdate();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast.error('Erro ao criar usuário');
    } finally {
      setCarregando(false);
    }
  }

  async function handleExcluirUsuario(id: string) {
    setCarregando(true);
    try {
      const { error } = await supabase
        .from('professores')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Usuário excluído com sucesso!');
      onUpdate();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Erro ao excluir usuário');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-lg sm:max-w-xl lg:max-w-4xl w-full mx-4 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Gerenciar Usuários
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Botão Novo Usuário */}
        <button
          onClick={() => setNovoUsuario({
            nome: '',
            email: '',
            matricula_siape: '',
            admin: false,
            senha: ''
          })}
          className="mb-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2b9f3f] hover:bg-[#248a35]"
        >
          <Plus className="h-5 w-5 mr-2" />
          Novo Usuário
        </button>

        {/* Formulário de Novo Usuário */}
        {novoUsuario && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="text-lg font-medium mb-4">Novo Usuário</h4>
            <form onSubmit={handleCriarUsuario} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <input
                    type="text"
                    value={novoUsuario.nome}
                    onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-[#2b9f3f] focus:border-[#2b9f3f]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={novoUsuario.email}
                    onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-[#2b9f3f] focus:border-[#2b9f3f]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Matrícula SIAPE</label>
                  <input
                    type="text"
                    value={novoUsuario.matricula_siape}
                    onChange={(e) => setNovoUsuario({ ...novoUsuario, matricula_siape: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-[#2b9f3f] focus:border-[#2b9f3f]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Usuário</label>
                  <select
                    value={novoUsuario.admin ? "admin" : "professor"}
                    onChange={(e) => setNovoUsuario({ ...novoUsuario, admin: e.target.value === "admin" })}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-[#2b9f3f] focus:border-[#2b9f3f]"
                  >
                    <option value="professor">Professor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Senha</label>
                  <input
                    type="password"
                    value={novoUsuario.senha}
                    onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-[#2b9f3f] focus:border-[#2b9f3f]"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setNovoUsuario(null)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={carregando}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2b9f3f] hover:bg-[#248a35]"
                >
                  Criar Usuário
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Barra de pesquisa */}
        <div className="mb-4">
          <input
            type="text"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Pesquisar por nome ou email"
            className="block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-[#2b9f3f] focus:border-[#2b9f3f]"
          />
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {usuariosFiltrados.map((usuario) => (
            <div key={usuario.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg">
              {editandoUsuario?.id === usuario.id ? (
                <form onSubmit={handleEditarUsuario} className="w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nome</label>
                      <input
                        type="text"
                        value={editandoUsuario.nome}
                        onChange={(e) => setEditandoUsuario({ ...editandoUsuario, nome: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-[#2b9f3f] focus:border-[#2b9f3f]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={editandoUsuario.email}
                        onChange={(e) => setEditandoUsuario({ ...editandoUsuario, email: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-[#2b9f3f] focus:border-[#2b9f3f]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Matrícula SIAPE</label>
                      <input
                        type="text"
                        value={editandoUsuario.matricula_siape}
                        onChange={(e) => setEditandoUsuario({ ...editandoUsuario, matricula_siape: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-[#2b9f3f] focus:border-[#2b9f3f]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
                      <input
                        type="password"
                        value={editandoUsuario.senha || ''}
                        onChange={(e) => setEditandoUsuario({ ...editandoUsuario, senha: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-[#2b9f3f] focus:border-[#2b9f3f]"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditandoUsuario(null)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={carregando}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2b9f3f] hover:bg-[#248a35]"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex-1">
                    <h4 className="text-lg font-medium">{usuario.nome}</h4>
                    <div className="text-sm text-gray-500">
                      <p>Email: {usuario.email}</p>
                      <p>Matrícula SIAPE: {usuario.matricula_siape || 'Não informada'}</p>
                      <p>Tipo: {usuario.admin ? 'Administrador' : 'Professor'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => setEditandoUsuario({
                        id: usuario.id,
                        nome: usuario.nome,
                        email: usuario.email,
                        matricula_siape: usuario.matricula_siape || '',
                        admin: usuario.admin
                      })}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleExcluirUsuario(usuario.id)}
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
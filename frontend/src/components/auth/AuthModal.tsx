import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import { Flame, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await login('demo@lesskcals.com', 'demo123456');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com conta demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isRegister ? 'Criar Conta' : 'Acessar Conta'}
      subtitle={
        isRegister
          ? 'Comece seu controle alimentar inteligente hoje'
          : 'Entre para sincronizar seus alimentos e metas'
      }
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {isRegister && (
          <Input
            label="Seu Nome"
            placeholder="Ex: Leonardo Souza"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}

        <Input
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Senha"
          type="password"
          placeholder="Mínimo de 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" loading={loading} className="w-full mt-1">
          {isRegister ? 'Criar Conta' : 'Entrar no LESS-Kcal'}
        </Button>

        {/* Botão de Demonstração Rápida */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-zinc-800" />
          <span className="flex-shrink mx-2 text-[10px] text-zinc-500 uppercase">
            ou teste com 1 clique
          </span>
          <div className="flex-grow border-t border-zinc-800" />
        </div>

        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          Entrar com Usuário Demo (Leonardo)
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-zinc-400 hover:text-brand-300 transition-colors"
          >
            {isRegister
              ? 'Já tem uma conta? Clique para entrar'
              : 'Não tem conta? Cadastre-se gratuitamente'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

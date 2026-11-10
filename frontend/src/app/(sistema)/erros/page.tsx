'use client';

import React, { useState } from 'react';
import { ErrorView } from '../../../components/ui/ErrorView';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export default function ErrosPreviewPage() {
  const [tipoSelecionado, setTipoSelecionado] = useState<'404' | '403' | '500' | 'conexao'>('404');
  const [comDetalhes, setComDetalhes] = useState(true);

  const exemploLogs = {
    '404': 'Error: Rota "/manifestacoes/protocolo-inexistente" não localizada.\nStack: at Page (src/app/manifestacoes/[id]/page.tsx:45:10)',
    '403': 'AcessoNegadoError: Usuário coord.sul@cedro.com.br tentou acessar manifestações da unidade Matriz Central sem privilégios.\nStack: at rbacMiddleware (src/presentation/middlewares/rbacMiddleware.ts:18:7)',
    '500': 'DatabaseError: connection timeout to PostgreSQL at 72.61.24.140:5432 after 5000ms.\nQuery: SELECT * FROM manifestacoes WHERE status = $1\nDigest: 8492049182',
    conexao: 'ApiError: Network request to http://localhost:3001/api/dashboard/indicadores failed: Failed to fetch (ECONNREFUSED)',
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Central de Telas de Erro do Sistema
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Demonstração dos layouts de erro personalizados com a identidade visual do Laboratório Cedro
        </p>
      </div>

      {/* Seletor de Tipo de Erro */}
      <Card title="Selecione o Cenário de Erro para Visualização">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={tipoSelecionado === '404' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTipoSelecionado('404')}
            >
              Erro 404 (Não Encontrado)
            </Button>

            <Button
              variant={tipoSelecionado === '403' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTipoSelecionado('403')}
            >
              Erro 403 (Acesso Negado)
            </Button>

            <Button
              variant={tipoSelecionado === '500' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTipoSelecionado('500')}
            >
              Erro 500 (Falha de Servidor)
            </Button>

            <Button
              variant={tipoSelecionado === 'conexao' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTipoSelecionado('conexao')}
            >
              Falha de Conexão (API Offline)
            </Button>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={comDetalhes}
              onChange={(e) => setComDetalhes(e.target.checked)}
              className="rounded text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
            />
            <span>Simular log técnico detalhado</span>
          </label>
        </div>
      </Card>

      {/* Preview da Tela de Erro */}
      <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-2 sm:p-6">
        <ErrorView
          tipo={tipoSelecionado}
          detalhesTecnicos={comDetalhes ? exemploLogs[tipoSelecionado] : undefined}
          onReset={() => alert('Ação "Tentar Novamente" disparada!')}
          showBack={true}
          showHome={true}
        />
      </div>
    </div>
  );
}

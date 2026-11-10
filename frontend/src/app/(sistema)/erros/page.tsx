'use client';

import React, { useState } from 'react';
import { ErrorView } from '../../../components/ui/ErrorView';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export default function ErrosPreviewPage() {
  const [tipoSelecionado, setTipoSelecionado] = useState<'404' | '403' | '500' | 'conexao'>('404');
  const [comDetalhes, setComDetalhes] = useState(false);

  const exemploLogs = {
    '404': 'Error: Rota "/manifestacoes/protocolo-inexistente" não localizada.\nStack: at Page (src/app/manifestacoes/[id]/page.tsx:45:10)',
    '403': 'AcessoNegadoError: Usuário coord.sul@cedro.com.br tentou acessar manifestações da unidade Matriz Central sem privilégios.\nStack: at rbacMiddleware (src/presentation/middlewares/rbacMiddleware.ts:18:7)',
    '500': 'DatabaseError: connection timeout to PostgreSQL at 72.61.24.140:5432 after 5000ms.\nQuery: SELECT * FROM manifestacoes WHERE status = $1\nDigest: 8492049182',
    conexao: 'ApiError: Network request to http://localhost:3001/api/dashboard/indicadores failed: Failed to fetch (ECONNREFUSED)',
  };

  return (
    <div className="space-y-6 animate-rise max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-black text-[#075618] tracking-tight">
          Telas de Erro do Sistema
        </h1>
        <p className="text-xs text-[#5E5E5E] mt-1">
          Visualização das páginas de erro alinhadas ao padrão editorial da tela de avaliação do Laboratório Cedro
        </p>
      </div>

      {/* Seletor de Tipo de Erro */}
      <Card title="Cenário de Erro">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={tipoSelecionado === '404' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTipoSelecionado('404')}
            >
              404 (Não encontrado)
            </Button>

            <Button
              variant={tipoSelecionado === '403' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTipoSelecionado('403')}
            >
              403 (Acesso restrito)
            </Button>

            <Button
              variant={tipoSelecionado === '500' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTipoSelecionado('500')}
            >
              500 (Falha no servidor)
            </Button>

            <Button
              variant={tipoSelecionado === 'conexao' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTipoSelecionado('conexao')}
            >
              503 (Sem conexão)
            </Button>
          </div>

          <label className="flex items-center gap-2 text-xs text-[#323232] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={comDetalhes}
              onChange={(e) => setComDetalhes(e.target.checked)}
              className="rounded accent-[#02A562]"
            />
            <span>Exibir detalhes técnicos</span>
          </label>
        </div>
      </Card>

      {/* Preview da Tela de Erro no mesmo padrão limpo da Avaliação */}
      <div className="rounded-xl border border-[#E3E3E3] bg-white overflow-hidden shadow-cedro-card">
        <ErrorView
          embedded
          tipo={tipoSelecionado}
          detalhesTecnicos={comDetalhes ? exemploLogs[tipoSelecionado] : undefined}
          onReset={tipoSelecionado === '500' || tipoSelecionado === 'conexao' ? () => {} : undefined}
          showBack={true}
          showHome={true}
        />
      </div>
    </div>
  );
}

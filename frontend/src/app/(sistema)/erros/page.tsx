'use client';

import React, { useState } from 'react';
import { ErrorView } from '../../../components/ui/ErrorView';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export default function ErrosPreviewPage() {
  const [tipoSelecionado, setTipoSelecionado] = useState<'404' | '403' | '500' | 'conexao'>('404');

  return (
    <div className="space-y-6 animate-rise max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-black text-[#075618] tracking-tight">
          Telas de Erro do Sistema
        </h1>
        <p className="text-xs text-[#5E5E5E] mt-1">
          Visualização minimalista das páginas de erro do Laboratório Cedro
        </p>
      </div>

      {/* Seletor de Tipo de Erro */}
      <Card title="Cenário de Erro">
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
            503 (Serviço indisponível)
          </Button>
        </div>
      </Card>

      {/* Preview da Tela de Erro */}
      <div className="rounded-xl border border-[#E3E3E3] bg-white overflow-hidden shadow-cedro-card">
        <ErrorView embedded tipo={tipoSelecionado} />
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { FileText, Download } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

export default function RelatoriosPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Relatórios Gerenciais & Exportação de Dados
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Exportação de auditoria, tempos médios de resposta e dados consolidados
        </p>
      </div>

      <Card title="Exportação de Manifestações e Auditoria">
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Gera arquivo CSV completo com os 14 campos mínimos da Seção 9, histórico de notas e tempos de resposta por unidade.
          </p>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => alert('Exportação CSV será gerada pelo endpoint /api/relatorios/exportar.')}>
              <Download className="w-4 h-4" />
              Exportar Manifestações (.CSV)
            </Button>
            <Button variant="outline" onClick={() => alert('Exportação JSON será gerada pelo endpoint /api/relatorios/exportar.')}>
              <FileText className="w-4 h-4" />
              Exportar Auditoria (.JSON)
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

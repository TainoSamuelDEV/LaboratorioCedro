'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Download, Filter, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { useAuth } from '../../../contexts/AuthContext';
import { relatorioService } from '../../../services/relatorio.service';
import { unidadeService } from '../../../services/unidade.service';
import { PrioridadeManifestacao, StatusManifestacao, UnidadeDTO } from '../../../types/api';

export default function RelatoriosPage() {
  const { usuario, ehAdmin, ehOuvidoria } = useAuth();

  const [unidades, setUnidades] = useState<UnidadeDTO[]>([]);
  const [unidadeId, setUnidadeId] = useState('');
  const [status, setStatus] = useState<StatusManifestacao | ''>('');
  const [prioridade, setPrioridade] = useState<PrioridadeManifestacao | ''>('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const [exportandoCsv, setExportandoCsv] = useState(false);
  const [exportandoJson, setExportandoJson] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  useEffect(() => {
    unidadeService.listar().then(setUnidades).catch(() => []);
  }, []);

  const handleExportarCsv = async () => {
    setExportandoCsv(true);
    setMensagemSucesso(null);
    setMensagemErro(null);

    try {
      await relatorioService.exportarCsv({
        unidadeId: unidadeId || undefined,
        status: status ? (status as StatusManifestacao) : undefined,
        prioridade: prioridade ? (prioridade as PrioridadeManifestacao) : undefined,
        dataInicio: dataInicio || undefined,
        dataFim: dataFim || undefined,
      });
      setMensagemSucesso('Arquivo CSV gerado e baixado com sucesso!');
    } catch (err: any) {
      setMensagemErro(err.message || 'Falha ao exportar relatório CSV.');
    } finally {
      setExportandoCsv(false);
    }
  };

  const handleExportarJson = async () => {
    setExportandoJson(true);
    setMensagemSucesso(null);
    setMensagemErro(null);

    try {
      const dados = await relatorioService.exportarJson({
        unidadeId: unidadeId || undefined,
        status: status ? (status as StatusManifestacao) : undefined,
        prioridade: prioridade ? (prioridade as PrioridadeManifestacao) : undefined,
        dataInicio: dataInicio || undefined,
        dataFim: dataFim || undefined,
      });

      // Baixar arquivo JSON diretamente
      const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-manifestacoes-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setMensagemSucesso(`Arquivo JSON com ${dados.length} registros exportado com sucesso!`);
    } catch (err: any) {
      setMensagemErro(err.message || 'Falha ao exportar relatório JSON.');
    } finally {
      setExportandoJson(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Relatórios Gerenciais & Exportação de Dados (Tela 9)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Exportação de auditoria com os 14 campos mínimos, prazos de SLA e histórico imutável
        </p>
      </div>

      {mensagemSucesso && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {mensagemErro && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{mensagemErro}</span>
        </div>
      )}

      {/* Card de Filtros */}
      <Card title="Filtros de Extração">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Select
            label="Unidade"
            value={unidadeId}
            onChange={(e) => setUnidadeId(e.target.value)}
            options={[
              { value: '', label: 'Todas as Unidades' },
              ...unidades.map((u) => ({ value: u.id, label: u.nome })),
            ]}
          />

          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusManifestacao)}
            options={[
              { value: '', label: 'Todos os Status' },
              { value: 'NAO_RESPONDIDA', label: 'Não Respondida' },
              { value: 'EM_TRATAMENTO', label: 'Em Tratamento' },
              { value: 'ESCALONADA', label: 'Escalonada' },
              { value: 'RESPONDIDA', label: 'Respondida' },
              { value: 'CONCLUIDA', label: 'Concluída' },
            ]}
          />

          <Select
            label="Prioridade"
            value={prioridade}
            onChange={(e) => setPrioridade(e.target.value as PrioridadeManifestacao)}
            options={[
              { value: '', label: 'Todas as Prioridades' },
              { value: 'BAIXA', label: 'Baixa' },
              { value: 'MEDIA', label: 'Média' },
              { value: 'ALTA', label: 'Alta' },
              { value: 'CRITICA', label: 'Crítica' },
            ]}
          />

          <Input
            label="Data Início"
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />

          <Input
            label="Data Fim"
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>
      </Card>

      {/* Card de Ações de Exportação */}
      <Card title="Formato de Exportação">
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            O arquivo gerado conterá protocolo, unidade, status, prioridade, prazos, datas de abertura e conclusão,
            além da contagem de interações de auditoria e tempos de resposta em horas.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={handleExportarCsv}
              disabled={exportandoCsv || exportandoJson}
            >
              <Download className="w-4 h-4 mr-1.5" />
              {exportandoCsv ? 'Gerando CSV...' : 'Baixar Relatório (.CSV)'}
            </Button>

            <Button
              variant="outline"
              onClick={handleExportarJson}
              disabled={exportandoCsv || exportandoJson}
            >
              <FileText className="w-4 h-4 mr-1.5" />
              {exportandoJson ? 'Gerando JSON...' : 'Baixar Dados (.JSON)'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

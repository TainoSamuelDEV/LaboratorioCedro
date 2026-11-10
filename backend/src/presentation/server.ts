import dotenv from 'dotenv';
import { criarApp } from './app';
import { InMemoryManifestacaoRepository } from '../../tests/fakes/InMemoryManifestacaoRepository';
import { InMemoryPesquisaRepository } from '../../tests/fakes/InMemoryPesquisaRepository';
import { InMemoryRespostaPesquisaRepository } from '../../tests/fakes/InMemoryRespostaPesquisaRepository';
import { InMemoryUnidadeRepository } from '../../tests/fakes/InMemoryUnidadeRepository';
import { InMemoryUsuarioRepository } from '../../tests/fakes/InMemoryUsuarioRepository';
import { SupabaseManifestacaoRepository } from '../infrastructure/repositories/SupabaseManifestacaoRepository';
import { SupabasePesquisaRepository } from '../infrastructure/repositories/SupabasePesquisaRepository';
import { SupabaseRespostaPesquisaRepository } from '../infrastructure/repositories/SupabaseRespostaPesquisaRepository';
import { SupabaseUnidadeRepository } from '../infrastructure/repositories/SupabaseUnidadeRepository';
import { SupabaseUsuarioRepository } from '../infrastructure/repositories/SupabaseUsuarioRepository';
import { Administrador, CoordenadorUnidade, OperadorOuvidoria } from '../domain/entities/Usuario';
import { Unidade } from '../domain/entities/Unidade';
import { Pesquisa } from '../domain/entities/Pesquisa';
import { RespostaPesquisa } from '../domain/entities/RespostaPesquisa';
import { Manifestacao } from '../domain/entities/Manifestacao';
import { CanalPesquisa } from '../domain/enums';
import { BcryptPasswordHasher } from '../application/services/BcryptPasswordHasher';

dotenv.config();

const PORT = process.env.PORT || 3001;

async function bootstrap() {
  const usarSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

  let usuarioRepo;
  let unidadeRepo;
  let pesquisaRepo;
  let respostaRepo;
  let manifestacaoRepo;

  if (usarSupabase) {
    console.log(`[Cedro API] Conectando aos repositórios do Supabase Self-Hosted (${process.env.SUPABASE_URL})...`);
    usuarioRepo = new SupabaseUsuarioRepository();
    unidadeRepo = new SupabaseUnidadeRepository();
    pesquisaRepo = new SupabasePesquisaRepository();
    respostaRepo = new SupabaseRespostaPesquisaRepository();
    manifestacaoRepo = new SupabaseManifestacaoRepository();
  } else {
    console.log('[Cedro API] Credenciais do Supabase não detectadas no .env. Inicializando repositórios em memória...');
    usuarioRepo = new InMemoryUsuarioRepository();
    unidadeRepo = new InMemoryUnidadeRepository();
    pesquisaRepo = new InMemoryPesquisaRepository();
    respostaRepo = new InMemoryRespostaPesquisaRepository();
    manifestacaoRepo = new InMemoryManifestacaoRepository();

    const hasher = new BcryptPasswordHasher(10);
    const senhaPadraoHash = await hasher.hash('cedro123');

    // Seed inicial em memória para desenvolvimento local rápido
    const unidadeMatriz = new Unidade('unid-matriz', 'Cedro Matriz Central', 'Dra. Beatriz', true, 48);
    const unidadeSul = new Unidade('unid-sul', 'Cedro Sul Coletas', 'Dr. Roberto', true, 48);
    await unidadeRepo.salvar(unidadeMatriz);
    await unidadeRepo.salvar(unidadeSul);

    const admin = new Administrador('usr-admin', 'Gabriel Tech Lead', 'admin@cedro.com.br');
    const ouvidor = new OperadorOuvidoria('usr-ouvidor', 'Amanda Ouvidoria', 'ouvidoria@cedro.com.br');
    const coord = new CoordenadorUnidade('usr-coord-sul', 'Dr. Roberto Coordenador', 'coord.sul@cedro.com.br', 'unid-sul');

    await usuarioRepo.salvarComSenha(admin, senhaPadraoHash);
    await usuarioRepo.salvarComSenha(ouvidor, senhaPadraoHash);
    await usuarioRepo.salvarComSenha(coord, senhaPadraoHash);

    // Seed de Pesquisas Mock para teste imediato
    const pesquisaMatriz = new Pesquisa(
      'pesq-matriz-qr',
      'Pesquisa de Satisfação — Unidade Matriz Central',
      'Avaliação da experiência do paciente no atendimento, triagem e coleta de exames laboratoriais.',
      '2026-Q1',
      CanalPesquisa.QR_CODE,
      true,
      'unid-matriz'
    );
    const pesquisaSul = new Pesquisa(
      'pesq-sul-totem',
      'Pesquisa Rápida — Unidade Sul Coletas',
      'Totem de autoavaliação pós-coleta para pacientes da unidade Sul.',
      '2026-Q1',
      CanalPesquisa.TOTEM,
      true,
      'unid-sul'
    );
    await pesquisaRepo.salvar(pesquisaMatriz);
    await pesquisaRepo.salvar(pesquisaSul);

    // Respostas e Manifestações de Exemplo
    const agora = new Date();

    // 1. Caso Crítico / Detrator (Nota 1): Manifestação NÃO RESPONDIDA (SLA de urgência)
    const resp1 = new RespostaPesquisa(
      'resp-001',
      'pesq-sul-totem',
      'unid-sul',
      'Atendimento #8491 - Carlos Alberto',
      1,
      'Demora de mais de 45 minutos para coleta de sangue em jejum. Poucos atendentes na recepção da Unidade Sul.',
      new Date(agora.getTime() - 1000 * 60 * 60 * 12)
    );
    await respostaRepo.salvar(resp1);

    const manif1 = Manifestacao.criar({
      id: 'manif-001',
      resposta: resp1,
      unidade: unidadeSul,
      criadoEm: resp1.dataHora,
    });
    await manifestacaoRepo.salvar(manif1);

    // 2. Caso Detrator (Nota 2): Manifestação já RESPONDIDA pela Unidade (Aguardando conclusão da Ouvidoria)
    const resp2 = new RespostaPesquisa(
      'resp-002',
      'pesq-matriz-qr',
      'unid-matriz',
      'Atendimento #8512 - Mariana Costa',
      2,
      'Ambiente frio e recepção sem orientação adequada sobre fila preferencial.',
      new Date(agora.getTime() - 1000 * 60 * 60 * 24)
    );
    await respostaRepo.salvar(resp2);

    const manif2 = Manifestacao.criar({
      id: 'manif-002',
      resposta: resp2,
      unidade: unidadeMatriz,
      criadoEm: resp2.dataHora,
    });
    manif2.iniciarTratamento(admin);
    manif2.registrarRespostaUnidade(
      admin,
      'Realizamos o alinhamento com a equipe de recepção e ajustamos a climatização da sala de espera central.'
    );
    await manifestacaoRepo.salvar(manif2);

    // 3. Caso Promotor (Nota 5): Avaliação Excelente
    const resp3 = new RespostaPesquisa(
      'resp-003',
      'pesq-matriz-qr',
      'unid-matriz',
      'Atendimento #8530 - Patrícia Lima',
      5,
      'Atendimento excepcional! Coleta rápida, sem dor e profissionais muito atenciosos na recepção.',
      new Date(agora.getTime() - 1000 * 60 * 60 * 4)
    );
    await respostaRepo.salvar(resp3);

    console.log(`[Cedro API] Usuários em memória pré-carregados (senha: cedro123):`);
    console.log(` - Admin: admin@cedro.com.br`);
    console.log(` - Ouvidoria: ouvidoria@cedro.com.br`);
    console.log(` - Coordenador Sul: coord.sul@cedro.com.br`);
    console.log(`\n[Cedro API] Pesquisas Mock disponíveis para avaliação pública (QR Code / Totem):`);
    console.log(` - Matriz (QR Code): http://localhost:3000/pesquisa/pesq-matriz-qr`);
    console.log(` - Sul (Totem):      http://localhost:3000/pesquisa/pesq-sul-totem\n`);
  }

  const app = criarApp({
    usuarioRepo,
    unidadeRepo,
    pesquisaRepo,
    respostaRepo,
    manifestacaoRepo,
  });

  app.listen(PORT, () => {
    console.log(`[Cedro API] Servidor Express rodando com sucesso na porta ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('[ERRO_BOOTSTRAP]:', err);
  process.exit(1);
});

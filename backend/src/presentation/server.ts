import dotenv from 'dotenv';
import path from 'path';
import { criarApp } from './app';
import { SupabaseManifestacaoRepository } from '../infrastructure/repositories/SupabaseManifestacaoRepository';
import { SupabasePesquisaRepository } from '../infrastructure/repositories/SupabasePesquisaRepository';
import { SupabaseRespostaPesquisaRepository } from '../infrastructure/repositories/SupabaseRespostaPesquisaRepository';
import { SupabaseUnidadeRepository } from '../infrastructure/repositories/SupabaseUnidadeRepository';
import { SupabaseUsuarioRepository } from '../infrastructure/repositories/SupabaseUsuarioRepository';

// Garante o carregamento do .env tanto da pasta backend quanto da raiz
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

const PORT = process.env.PORT || 3001;

async function bootstrap() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      '[Cedro API] ERRO DE CONFIGURAÇÃO: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios no arquivo .env do Back-end. ' +
      'Certifique-se de preencher o backend/.env com as credenciais do seu Supabase Self-Hosted.'
    );
  }

  console.log(`[Cedro API] Conectando aos repositórios do Supabase Self-Hosted (${supabaseUrl})...`);

  const usuarioRepo = new SupabaseUsuarioRepository();
  const unidadeRepo = new SupabaseUnidadeRepository();
  const pesquisaRepo = new SupabasePesquisaRepository();
  const respostaRepo = new SupabaseRespostaPesquisaRepository();
  const manifestacaoRepo = new SupabaseManifestacaoRepository();

  const app = criarApp({
    usuarioRepo,
    unidadeRepo,
    pesquisaRepo,
    respostaRepo,
    manifestacaoRepo,
  });

  app.listen(PORT, () => {
    console.log(`[Cedro API] Servidor Express ativo na porta ${PORT}`);
    console.log(`[Cedro API] Operando em modo 100% integrado ao Supabase (Zero Mock).`);
  });
}

bootstrap().catch((err) => {
  console.error('[ERRO_BOOTSTRAP]:', err);
  process.exit(1);
});

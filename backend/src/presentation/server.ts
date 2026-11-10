import dotenv from 'dotenv';
import { criarApp } from './app';
import { InMemoryManifestacaoRepository } from '../../tests/fakes/InMemoryManifestacaoRepository';
import { InMemoryPesquisaRepository } from '../../tests/fakes/InMemoryPesquisaRepository';
import { InMemoryRespostaPesquisaRepository } from '../../tests/fakes/InMemoryRespostaPesquisaRepository';
import { InMemoryUnidadeRepository } from '../../tests/fakes/InMemoryUnidadeRepository';
import { InMemoryUsuarioRepository } from '../../tests/fakes/InMemoryUsuarioRepository';
import { Administrador, CoordenadorUnidade, OperadorOuvidoria } from '../domain/entities/Usuario';
import { Unidade } from '../domain/entities/Unidade';
import { BcryptPasswordHasher } from '../application/services/BcryptPasswordHasher';

dotenv.config();

const PORT = process.env.PORT || 3001;

async function bootstrap() {
  const usuarioRepo = new InMemoryUsuarioRepository();
  const unidadeRepo = new InMemoryUnidadeRepository();
  const pesquisaRepo = new InMemoryPesquisaRepository();
  const respostaRepo = new InMemoryRespostaPesquisaRepository();
  const manifestacaoRepo = new InMemoryManifestacaoRepository();

  const hasher = new BcryptPasswordHasher(10);
  const senhaPadraoHash = await hasher.hash('cedro123');

  // Seed inicial em memória para desenvolvimento rápido
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

  const app = criarApp({
    usuarioRepo,
    unidadeRepo,
    pesquisaRepo,
    respostaRepo,
    manifestacaoRepo,
  });

  app.listen(PORT, () => {
    console.log(`[Cedro API] Servidor Express rodando com sucesso na porta ${PORT}`);
    console.log(`[Cedro API] Usuários de teste pré-carregados (senha: cedro123):`);
    console.log(` - Admin: admin@cedro.com.br`);
    console.log(` - Ouvidoria: ouvidoria@cedro.com.br`);
    console.log(` - Coordenador Sul: coord.sul@cedro.com.br`);
  });
}

bootstrap().catch((err) => {
  console.error('[ERRO_BOOTSTRAP]:', err);
  process.exit(1);
});

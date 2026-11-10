import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { Express } from 'express';
import { criarApp } from '../../src/presentation/app';
import { Administrador, CoordenadorUnidade, OperadorOuvidoria } from '../../src/domain/entities/Usuario';
import { Unidade } from '../../src/domain/entities/Unidade';
import { CanalPesquisa, PerfilUsuario } from '../../src/domain/enums';
import { BcryptPasswordHasher } from '../../src/application/services/BcryptPasswordHasher';
import { JwtTokenService } from '../../src/application/services/JwtTokenService';
import { FakeNotificador } from '../fakes/FakeNotificador';
import { InMemoryManifestacaoRepository } from '../fakes/InMemoryManifestacaoRepository';
import { InMemoryPesquisaRepository } from '../fakes/InMemoryPesquisaRepository';
import { InMemoryRespostaPesquisaRepository } from '../fakes/InMemoryRespostaPesquisaRepository';
import { InMemoryUnidadeRepository } from '../fakes/InMemoryUnidadeRepository';
import { InMemoryUsuarioRepository } from '../fakes/InMemoryUsuarioRepository';

describe('Presentation Layer (Express API): Testes de Integracao End-to-End', () => {
  let app: Express;
  let usuarioRepo: InMemoryUsuarioRepository;
  let unidadeRepo: InMemoryUnidadeRepository;
  let pesquisaRepo: InMemoryPesquisaRepository;
  let respostaRepo: InMemoryRespostaPesquisaRepository;
  let manifestacaoRepo: InMemoryManifestacaoRepository;
  let tokenService: JwtTokenService;
  let passwordHasher: BcryptPasswordHasher;

  let tokenAdmin: string;
  let tokenOuvidoria: string;
  let tokenCoordSul: string;
  let unidadeSulId: string;

  beforeEach(async () => {
    usuarioRepo = new InMemoryUsuarioRepository();
    unidadeRepo = new InMemoryUnidadeRepository();
    pesquisaRepo = new InMemoryPesquisaRepository();
    respostaRepo = new InMemoryRespostaPesquisaRepository();
    manifestacaoRepo = new InMemoryManifestacaoRepository();
    tokenService = new JwtTokenService('segredo-teste-api');
    passwordHasher = new BcryptPasswordHasher(4);

    app = criarApp({
      usuarioRepo,
      unidadeRepo,
      pesquisaRepo,
      respostaRepo,
      manifestacaoRepo,
      tokenService,
      passwordHasher,
      notificador: new FakeNotificador(),
    });

    // Seed de Unidades
    const unidSul = new Unidade('unid-sul', 'Cedro Sul Coletas', 'Dr. Roberto', true, 48);
    await unidadeRepo.salvar(unidSul);
    unidadeSulId = unidSul.id;

    // Seed de Usuários
    const senhaHash = await passwordHasher.hash('senha123');
    const admin = new Administrador('usr-admin', 'Gabriel Tech Lead', 'admin@cedro.com.br');
    const ouvidor = new OperadorOuvidoria('usr-ouvidor', 'Amanda Ouvidoria', 'ouvidor@cedro.com.br');
    const coordSul = new CoordenadorUnidade('usr-coord-sul', 'Dr. Roberto', 'coord@cedro.com.br', unidadeSulId);

    await usuarioRepo.salvarComSenha(admin, senhaHash);
    await usuarioRepo.salvarComSenha(ouvidor, senhaHash);
    await usuarioRepo.salvarComSenha(coordSul, senhaHash);

    // Gerar tokens
    tokenAdmin = tokenService.gerar({
      sub: admin.id,
      nome: admin.nome,
      email: admin.email,
      perfil: PerfilUsuario.ADMINISTRADOR,
      unidadeId: null,
    });

    tokenOuvidoria = tokenService.gerar({
      sub: ouvidor.id,
      nome: ouvidor.nome,
      email: ouvidor.email,
      perfil: PerfilUsuario.OPERADOR_OUVIDORIA,
      unidadeId: null,
    });

    tokenCoordSul = tokenService.gerar({
      sub: coordSul.id,
      nome: coordSul.nome,
      email: coordSul.email,
      perfil: PerfilUsuario.COORDENADOR_UNIDADE,
      unidadeId: unidadeSulId,
    });
  });

  it('GET /api/health - deve responder 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /api/auth/login - deve autenticar usuário com sucesso', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@cedro.com.br', senha: 'senha123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.usuario.nome).toBe('Gabriel Tech Lead');
  });

  it('GET /api/auth/me - deve retornar dados do usuário autenticado e barrar não autenticado', async () => {
    const resAutenticado = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(resAutenticado.status).toBe(200);
    expect(resAutenticado.body.id).toBe('usr-admin');

    const resSemToken = await request(app).get('/api/auth/me');
    expect(resSemToken.status).toBe(401);
  });

  it('RBAC: POST /api/usuarios - apenas Administrador pode criar usuários', async () => {
    // Admin cria com sucesso
    const resAdmin = await request(app)
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nome: 'Novo Coordenador',
        email: 'novo.coord@cedro.com.br',
        senha: 'segredoForte123',
        perfil: PerfilUsuario.COORDENADOR_UNIDADE,
        unidadeId: unidadeSulId,
      });

    expect(resAdmin.status).toBe(201);
    expect(resAdmin.body.nome).toBe('Novo Coordenador');

    // Coordenador tentando criar -> 403 Forbidden
    const resCoord = await request(app)
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${tokenCoordSul}`)
      .send({
        nome: 'Hacker',
        email: 'hack@cedro.com.br',
        senha: '123456',
        perfil: PerfilUsuario.ADMINISTRADOR,
      });

    expect(resCoord.status).toBe(403);
  });

  it('Fluxo Central: Criação de Pesquisa -> Resposta Pública -> Manifestação -> Tratativa -> Conclusão', async () => {
    // 1. Admin cria Pesquisa
    const resPesq = await request(app)
      .post('/api/pesquisas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        titulo: 'Pesquisa Cedro 2026',
        descricao: 'Avalie sua experiência de exames',
        periodo: '2026-Q1',
        canal: CanalPesquisa.QR_CODE,
      });

    expect(resPesq.status).toBe(201);
    const pesquisaId = resPesq.body.id;

    // 2. Cliente acessa rota pública da pesquisa (GET /api/public/pesquisas/:id)
    const resPesqPub = await request(app).get(`/api/public/pesquisas/${pesquisaId}`);
    expect(resPesqPub.status).toBe(200);
    expect(resPesqPub.body.unidadesAtivas).toHaveLength(1);

    // 3. Cliente envia resposta (POST /api/public/pesquisas/:id/respostas) com nota detratora 2
    const resRespPub = await request(app)
      .post(`/api/public/pesquisas/${pesquisaId}/respostas`)
      .send({
        unidadeId: unidadeSulId,
        clienteAtendimento: 'Paciente Mariana Castro',
        nota: 2,
        comentario: 'Demora excessiva na liberação do laudo de ecografia.',
      });

    expect(resRespPub.status).toBe(201);
    expect(resRespPub.body.manifestacao).toBeDefined();
    expect(resRespPub.body.manifestacao.protocolo).toMatch(/^CED-2026-\d{6}$/);
    expect(resRespPub.body.manifestacao.prioridade).toBe('ALTA');

    const manifestacaoId = resRespPub.body.manifestacao.id;

    // 4. Coordenador da Unidade Sul lista suas manifestações (GET /api/manifestacoes)
    const resLista = await request(app)
      .get('/api/manifestacoes')
      .set('Authorization', `Bearer ${tokenCoordSul}`);

    expect(resLista.status).toBe(200);
    expect(resLista.body).toHaveLength(1);
    expect(resLista.body[0].id).toBe(manifestacaoId);

    // 5. Coordenador inicia o tratamento (PATCH /api/manifestacoes/:id/iniciar-tratamento)
    const resInicio = await request(app)
      .patch(`/api/manifestacoes/${manifestacaoId}/iniciar-tratamento`)
      .set('Authorization', `Bearer ${tokenCoordSul}`);

    expect(resInicio.status).toBe(200);

    // 6. Coordenador envia resposta formal da unidade (POST /api/manifestacoes/:id/respostas-unidade)
    const resRespostaUnidade = await request(app)
      .post(`/api/manifestacoes/${manifestacaoId}/respostas-unidade`)
      .set('Authorization', `Bearer ${tokenCoordSul}`)
      .send({
        conteudo: 'Laudo auditado e liberado com prioridade. Paciente avisada por WhatsApp.',
      });

    expect(resRespostaUnidade.status).toBe(201);

    // 7. Ouvidoria conclui a manifestação (PATCH /api/manifestacoes/:id/concluir)
    const resConclusao = await request(app)
      .patch(`/api/manifestacoes/${manifestacaoId}/concluir`)
      .set('Authorization', `Bearer ${tokenOuvidoria}`)
      .send({
        parecerFinal: 'Caso finalizado satisfatoriamente pela Ouvidoria.',
      });

    expect(resConclusao.status).toBe(200);

    // 8. Consulta final detalhada da manifestação com seus 14 campos e histórico
    const resDetalhe = await request(app)
      .get(`/api/manifestacoes/${manifestacaoId}`)
      .set('Authorization', `Bearer ${tokenOuvidoria}`);

    expect(resDetalhe.status).toBe(200);
    expect(resDetalhe.body.status).toBe('CONCLUIDA');
    expect(resDetalhe.body.concluidoEm).not.toBeNull();
    expect(resDetalhe.body.respostasUnidade).toHaveLength(1);
    expect(resDetalhe.body.interacoes.length).toBeGreaterThanOrEqual(4); // ABERTURA + INICIO + RESPOSTA + CONCLUSAO
  });
});

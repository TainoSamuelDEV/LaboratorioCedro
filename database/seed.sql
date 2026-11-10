-- =============================================================================
-- PLATAFORMA DE EXPERIÊNCIA DO CLIENTE (Cedro / NIT)
-- Script de Carga Inicial (Seed Mock) — PostgreSQL / Supabase
-- =============================================================================

-- 1. Unidades de Atendimento
INSERT INTO unidades (id, nome, responsavel_nome, ativa, prazo_padrao_horas) VALUES
('b3d7a100-5232-4821-9b14-111111111111', 'Cedro Matriz Central', 'Dra. Beatriz Santos', TRUE, 48),
('b3d7a100-5232-4821-9b14-222222222222', 'Cedro Sul Coletas', 'Dr. Roberto Coordenador', TRUE, 48)
ON CONFLICT (id) DO NOTHING;

-- 2. Usuários Internos (Senha padrão: cedro123 gerada com crypt/blowfish)
INSERT INTO usuarios (id, nome, email, senha_hash, perfil, unidade_id, ativo) VALUES
(
    'a1b2c3d4-e5f6-4a5b-8c9d-111111111111',
    'Gabriel Tech Lead',
    'admin@cedro.com.br',
    crypt('cedro123', gen_salt('bf', 10)),
    'ADMINISTRADOR',
    NULL,
    TRUE
),
(
    'a1b2c3d4-e5f6-4a5b-8c9d-222222222222',
    'Amanda Ouvidoria',
    'ouvidoria@cedro.com.br',
    crypt('cedro123', gen_salt('bf', 10)),
    'OPERADOR_OUVIDORIA',
    NULL,
    TRUE
),
(
    'a1b2c3d4-e5f6-4a5b-8c9d-333333333333',
    'Dr. Roberto Coordenador',
    'coord.sul@cedro.com.br',
    crypt('cedro123', gen_salt('bf', 10)),
    'COORDENADOR_UNIDADE',
    'b3d7a100-5232-4821-9b14-222222222222',
    TRUE
)
ON CONFLICT (id) DO NOTHING;

-- 3. Pesquisas de Satisfação Mock (Para exibição no QR Code / Link)
INSERT INTO pesquisas (id, titulo, descricao, periodo, ativa, canal, unidade_padrao_id) VALUES
(
    'c1d2e3f4-a5b6-4c7d-8e9f-111111111111',
    'Pesquisa de Satisfação — Unidade Matriz Central',
    'Avaliação da experiência do paciente no atendimento, triagem e coleta de exames laboratoriais.',
    '2026-Q1',
    TRUE,
    'QR_CODE',
    'b3d7a100-5232-4821-9b14-111111111111'
),
(
    'c1d2e3f4-a5b6-4c7d-8e9f-222222222222',
    'Pesquisa Rápida — Unidade Sul Coletas',
    'Totem de autoavaliação pós-coleta para pacientes da unidade Sul.',
    '2026-Q1',
    TRUE,
    'TOTEM',
    'b3d7a100-5232-4821-9b14-222222222222'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Respostas de Teste
-- 4.1. Resposta 1 (Nota 1 Detratora na Unidade Sul)
INSERT INTO respostas_pesquisa (id, pesquisa_id, unidade_id, cliente_atendimento, nota, comentario, data_hora) VALUES
(
    'd1e2f3a4-b5c6-4d7e-8f9a-111111111111',
    'c1d2e3f4-a5b6-4c7d-8e9f-222222222222',
    'b3d7a100-5232-4821-9b14-222222222222',
    'Atendimento #8491 - Carlos Alberto',
    1,
    'Demora de mais de 45 minutos para coleta de sangue em jejum. Poucos atendentes na recepção da Unidade Sul.',
    NOW() - INTERVAL '12 hours'
),
-- 4.2. Resposta 2 (Nota 2 Detratora na Matriz)
(
    'd1e2f3a4-b5c6-4d7e-8f9a-222222222222',
    'c1d2e3f4-a5b6-4c7d-8e9f-111111111111',
    'b3d7a100-5232-4821-9b14-111111111111',
    'Atendimento #8512 - Mariana Costa',
    2,
    'Ambiente frio e recepção sem orientação adequada sobre fila preferencial.',
    NOW() - INTERVAL '24 hours'
),
-- 4.3. Resposta 3 (Nota 5 Promotora)
(
    'd1e2f3a4-b5c6-4d7e-8f9a-333333333333',
    'c1d2e3f4-a5b6-4c7d-8e9f-111111111111',
    'b3d7a100-5232-4821-9b14-111111111111',
    'Atendimento #8530 - Patrícia Lima',
    5,
    'Atendimento excepcional! Coleta rápida, sem dor e profissionais muito atenciosos na recepção.',
    NOW() - INTERVAL '4 hours'
)
ON CONFLICT (id) DO NOTHING;

-- 5. Manifestações Automáticas Geradas pelas Notas Detratoras
-- 5.1. Manifestação 1: NÃO RESPONDIDA (SLA Crítico - Unidade Sul)
INSERT INTO manifestacoes (id, protocolo, resposta_id, unidade_id, status, prioridade, responsavel_id, prazo_resposta, criado_em, concluido_em) VALUES
(
    'e1f2a3b4-c5d6-4e7f-8a9b-111111111111',
    'CED-2026-000101',
    'd1e2f3a4-b5c6-4d7e-8f9a-111111111111',
    'b3d7a100-5232-4821-9b14-222222222222',
    'NAO_RESPONDIDA',
    'ALTA',
    NULL,
    NOW() + INTERVAL '12 hours',
    NOW() - INTERVAL '12 hours',
    NULL
),
-- 5.2. Manifestação 2: RESPONDIDA pela Unidade (Aguardando conclusão pela Ouvidoria)
(
    'e1f2a3b4-c5d6-4e7f-8a9b-222222222222',
    'CED-2026-000102',
    'd1e2f3a4-b5c6-4d7e-8f9a-222222222222',
    'b3d7a100-5232-4821-9b14-111111111111',
    'RESPONDIDA',
    'ALTA',
    'a1b2c3d4-e5f6-4a5b-8c9d-111111111111',
    NOW() + INTERVAL '24 hours',
    NOW() - INTERVAL '24 hours',
    NULL
)
ON CONFLICT (id) DO NOTHING;

-- 6. Histórico de Auditoria Imutável (Interações)
INSERT INTO interacoes (id, manifestacao_id, usuario_id, tipo, texto, status_anterior, status_novo, data_hora) VALUES
(
    gen_random_uuid(),
    'e1f2a3b4-c5d6-4e7f-8a9b-111111111111',
    NULL,
    'ABERTURA_AUTOMATICA',
    'Manifestação gerada automaticamente para Atendimento #8491 - Carlos Alberto com nota 1.',
    NULL,
    'NAO_RESPONDIDA',
    NOW() - INTERVAL '12 hours'
),
(
    gen_random_uuid(),
    'e1f2a3b4-c5d6-4e7f-8a9b-222222222222',
    NULL,
    'ABERTURA_AUTOMATICA',
    'Manifestação gerada automaticamente para Atendimento #8512 - Mariana Costa com nota 2.',
    NULL,
    'NAO_RESPONDIDA',
    NOW() - INTERVAL '24 hours'
),
(
    gen_random_uuid(),
    'e1f2a3b4-c5d6-4e7f-8a9b-222222222222',
    'a1b2c3d4-e5f6-4a5b-8c9d-111111111111',
    'INICIO_TRATAMENTO',
    'Tratamento iniciado pelo gestor responsável.',
    'NAO_RESPONDIDA',
    'EM_TRATAMENTO',
    NOW() - INTERVAL '18 hours'
),
(
    gen_random_uuid(),
    'e1f2a3b4-c5d6-4e7f-8a9b-222222222222',
    'a1b2c3d4-e5f6-4a5b-8c9d-111111111111',
    'RESPOSTA_UNIDADE',
    'Resposta formal registrada: Realizamos o alinhamento com a equipe de recepção e ajustamos a climatização.',
    'EM_TRATAMENTO',
    'RESPONDIDA',
    NOW() - INTERVAL '6 hours'
);

-- 7. Resposta Formal da Unidade (Tabela respostas_unidade)
INSERT INTO respostas_unidade (id, manifestacao_id, usuario_id, conteudo, data_hora) VALUES
(
    gen_random_uuid(),
    'e1f2a3b4-c5d6-4e7f-8a9b-222222222222',
    'a1b2c3d4-e5f6-4a5b-8c9d-111111111111',
    'Realizamos o alinhamento com a equipe de recepção e ajustamos a climatização da sala de espera central.',
    NOW() - INTERVAL '6 hours'
);

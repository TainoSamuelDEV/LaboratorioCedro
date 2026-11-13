-- =============================================================================
-- PLATAFORMA DE EXPERIÊNCIA DO CLIENTE (Cedro / NIT)
-- Script de Limpeza Total e Carga dos Dados Oficiais (Compatível com schema.sql)
-- =============================================================================

-- 1. Limpeza de todas as tabelas em cascata (respeitando chaves estrangeiras)
TRUNCATE TABLE interacoes, manifestacoes, respostas_pesquisa, pesquisas, usuarios, unidades CASCADE;

-- 2. As 2 Unidades Oficiais Solicitadas (Cohama e Renascença)
INSERT INTO unidades (id, nome, responsavel_nome, ativa, prazo_padrao_horas) VALUES
('b3d7a100-5232-4821-9b14-111111111111', 'Cedro Cohama', 'Dr. Marcelo Coordenador', TRUE, 48),
('b3d7a100-5232-4821-9b14-222222222222', 'Cedro Renascença', 'Dra. Camila Coordenadora', TRUE, 48);

-- 3. Os 3 Usuários Oficiais (Senha padrão: cedro123)
-- 3.1 Administrador (Acesso Geral)
-- 3.2 Amanda Ouvidoria (Ouvidoria / Tratativas)
-- 3.3 Coordenador Cohama (Unidade Cohama)
INSERT INTO usuarios (id, nome, email, senha_hash, perfil, unidade_id, ativo) VALUES
(
    'a1b2c3d4-e5f6-4a5b-8c9d-111111111111',
    'Administrador Geral',
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
    'Coordenador Cohama',
    'unidade@cedro.com.br',
    crypt('cedro123', gen_salt('bf', 10)),
    'COORDENADOR_UNIDADE',
    'b3d7a100-5232-4821-9b14-111111111111', -- Vinculado à unidade Cohama
    TRUE
);

-- 4. Pesquisas de Satisfação Ativas Vinculadas às 2 Unidades
INSERT INTO pesquisas (id, titulo, descricao, periodo, ativa, canal, unidade_padrao_id) VALUES
(
    'c1d2e3f4-a5b6-4c7d-8e9f-111111111111',
    'Pesquisa de Satisfação — Unidade Cohama',
    'Avaliação da experiência do paciente no atendimento, triagem e coleta na unidade Cohama.',
    '2026-Q1',
    TRUE,
    'QR_CODE',
    'b3d7a100-5232-4821-9b14-111111111111'
),
(
    'c1d2e3f4-a5b6-4c7d-8e9f-222222222222',
    'Pesquisa de Satisfação — Unidade Renascença',
    'Totem de autoavaliação pós-coleta e agilidade na unidade Renascença.',
    '2026-Q1',
    TRUE,
    'TOTEM',
    'b3d7a100-5232-4821-9b14-222222222222'
);

-- 5. Respostas Iniciais de Exemplo (1 Detratora na Cohama, 1 na Renascença e 1 Promotora)
INSERT INTO respostas_pesquisa (id, pesquisa_id, unidade_id, cliente_atendimento, nota, comentario, data_hora) VALUES
(
    'd1e2f3a4-b5c6-4d7e-8f9a-111111111111',
    'c1d2e3f4-a5b6-4c7d-8e9f-111111111111',
    'b3d7a100-5232-4821-9b14-111111111111',
    'Atendimento #9021 - Carlos Eduardo',
    1,
    'Demora excessiva na triagem em jejum na unidade Cohama. Recepção estava com poucas atendentes.',
    NOW() - INTERVAL '14 hours'
),
(
    'd1e2f3a4-b5c6-4d7e-8f9a-222222222222',
    'c1d2e3f4-a5b6-4c7d-8e9f-222222222222',
    'b3d7a100-5232-4821-9b14-222222222222',
    'Atendimento #9022 - Mariana Souza',
    2,
    'O ar-condicionado da sala de espera da Renascença estava desligado e houve atraso na entrega do laudo.',
    NOW() - INTERVAL '5 hours'
),
(
    'd1e2f3a4-b5c6-4d7e-8f9a-333333333333',
    'c1d2e3f4-a5b6-4c7d-8e9f-111111111111',
    'b3d7a100-5232-4821-9b14-111111111111',
    'Atendimento #9023 - Beatriz Lima',
    5,
    'Atendimento impecável! Coleta muito rápida e sem dor.',
    NOW() - INTERVAL '2 hours'
);

-- 6. Manifestações das notas detratoras (colunas exatas de schema.sql)
INSERT INTO manifestacoes (
    id, protocolo, resposta_id, unidade_id, status, prioridade,
    responsavel_id, prazo_resposta, criado_em, concluido_em
) VALUES
(
    'e1f2a3b4-c5d6-4e7f-8a9b-111111111111',
    'CED-2026-0001',
    'd1e2f3a4-b5c6-4d7e-8f9a-111111111111',
    'b3d7a100-5232-4821-9b14-111111111111',
    'EM_TRATAMENTO',
    'CRITICA',
    'a1b2c3d4-e5f6-4a5b-8c9d-222222222222',
    NOW() + INTERVAL '10 hours',
    NOW() - INTERVAL '14 hours',
    NULL
),
(
    'e1f2a3b4-c5d6-4e7f-8a9b-222222222222',
    'CED-2026-0002',
    'd1e2f3a4-b5c6-4d7e-8f9a-222222222222',
    'b3d7a100-5232-4821-9b14-222222222222',
    'NOVA',
    'ALTA',
    NULL,
    NOW() + INTERVAL '43 hours',
    NOW() - INTERVAL '5 hours',
    NULL
);

-- 7. Linha do Tempo e Interações de Auditoria
INSERT INTO interacoes (id, manifestacao_id, usuario_id, tipo, texto, status_anterior, status_novo, data_hora) VALUES
(
    'f1a2b3c4-d5e6-4f7a-8b9c-111111111111',
    'e1f2a3b4-c5d6-4e7f-8a9b-111111111111',
    NULL,
    'ABERTURA_AUTOMATICA',
    'Manifestação aberta automaticamente pelo sistema (Nota 1 - Detratora na unidade Cohama).',
    'NOVA',
    'NOVA',
    NOW() - INTERVAL '14 hours'
),
(
    'f1a2b3c4-d5e6-4f7a-8b9c-222222222222',
    'e1f2a3b4-c5d6-4e7f-8a9b-111111111111',
    'a1b2c3d4-e5f6-4a5b-8c9d-222222222222',
    'INICIO_TRATAMENTO',
    'Tratativa iniciada pela ouvidoria. Contato realizado com o paciente para acolhimento.',
    'NOVA',
    'EM_TRATAMENTO',
    NOW() - INTERVAL '2 hours'
),
(
    'f1a2b3c4-d5e6-4f7a-8b9c-333333333333',
    'e1f2a3b4-c5d6-4e7f-8a9b-222222222222',
    NULL,
    'ABERTURA_AUTOMATICA',
    'Manifestação aberta automaticamente pelo sistema (Nota 2 - Detratora na unidade Renascença).',
    'NOVA',
    'NOVA',
    NOW() - INTERVAL '5 hours'
);

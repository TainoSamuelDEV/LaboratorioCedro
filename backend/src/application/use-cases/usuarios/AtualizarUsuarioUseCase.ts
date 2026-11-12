import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { IUnidadeRepository } from '../../../domain/repositories/IUnidadeRepository';
import { IPasswordHasher } from '../../services/IPasswordHasher';
import { Usuario, UsuarioFactory } from '../../../domain/entities/Usuario';
import { PerfilUsuario } from '../../../domain/enums';
import {
  AcessoNegadoError,
  RecursoNaoEncontradoError,
  RegraNegocioError,
} from '../../../domain/errors/DomainErrors';

export interface AtualizarUsuarioInput {
  id: string;
  executanteId: string;
  nome?: string;
  email?: string;
  perfil?: PerfilUsuario;
  unidadeId?: string | null;
  senha?: string;
  ativo?: boolean;
}

export class AtualizarUsuarioUseCase {
  constructor(
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly unidadeRepo: IUnidadeRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  public async executar(input: AtualizarUsuarioInput): Promise<Usuario> {
    const executante = await this.usuarioRepo.buscarPorId(input.executanteId);
    if (!executante) {
      throw new RecursoNaoEncontradoError('Usuário executante não encontrado.');
    }

    if (!executante.podeGerenciarSistema()) {
      throw new AcessoNegadoError('Apenas administradores podem atualizar ou desativar usuários.');
    }

    const usuarioExistente = await this.usuarioRepo.buscarPorId(input.id);
    if (!usuarioExistente) {
      throw new RecursoNaoEncontradoError(`Usuário com ID '${input.id}' não encontrado.`);
    }

    const novoNome = input.nome !== undefined ? input.nome.trim() : usuarioExistente.nome;
    const novoEmail =
      input.email !== undefined ? input.email.trim().toLowerCase() : usuarioExistente.email;
    const novoPerfil = input.perfil !== undefined ? input.perfil : usuarioExistente.perfil;
    const novaUnidadeId =
      input.unidadeId !== undefined ? input.unidadeId : usuarioExistente.unidadeId;
    const novoAtivo = input.ativo !== undefined ? input.ativo : usuarioExistente.ativo;

    // Se email mudou, validar unicidade
    if (novoEmail !== usuarioExistente.email) {
      const emailEmUso = await this.usuarioRepo.buscarPorEmail(novoEmail);
      if (emailEmUso && emailEmUso.id !== input.id) {
        throw new RegraNegocioError(`O e-mail '${novoEmail}' já está cadastrado para outro usuário.`);
      }
    }

    // Se perfil for Coordenador, unidadeId é estritamente obrigatório
    if (novoPerfil === PerfilUsuario.COORDENADOR_UNIDADE) {
      if (!novaUnidadeId || !novaUnidadeId.trim()) {
        throw new RegraNegocioError(
          'Coordenador de Unidade deve estar obrigatoriamente vinculado a uma unidade.'
        );
      }
      const unidadeExiste = await this.unidadeRepo.buscarPorId(novaUnidadeId);
      if (!unidadeExiste) {
        throw new RegraNegocioError(`Unidade com ID '${novaUnidadeId}' não encontrada.`);
      }
    }

    // Criar entidade reconstituída com os novos dados
    const usuarioAtualizado = UsuarioFactory.criar({
      id: usuarioExistente.id,
      nome: novoNome,
      email: novoEmail,
      perfil: novoPerfil,
      unidadeId: novoPerfil === PerfilUsuario.COORDENADOR_UNIDADE ? novaUnidadeId : null,
      ativo: novoAtivo,
      criadoEm: usuarioExistente.criadoEm,
    });

    // Se senha foi informada, hashear e persistir com senha
    if (input.senha && input.senha.trim()) {
      if (input.senha.trim().length < 6) {
        throw new RegraNegocioError('A nova senha deve ter no mínimo 6 caracteres.');
      }
      const senhaHash = await this.passwordHasher.hash(input.senha.trim());
      await this.usuarioRepo.salvarComSenha(usuarioAtualizado, senhaHash);
    } else {
      await this.usuarioRepo.salvar(usuarioAtualizado);
    }

    return usuarioAtualizado;
  }
}

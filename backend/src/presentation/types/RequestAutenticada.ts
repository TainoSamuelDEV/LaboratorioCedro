import { Request } from 'express';
import { TokenPayload } from '../../application/services/ITokenService';

export interface RequestAutenticada extends Request {
  usuario?: TokenPayload;
}

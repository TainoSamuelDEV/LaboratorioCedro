import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Carrega .env de forma resiliente tanto da pasta backend quanto da raiz
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

let supabaseClientInstancia: SupabaseClient | null = null;

export function obterSupabaseClient(): SupabaseClient {
  if (supabaseClientInstancia) {
    return supabaseClientInstancia;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Configuração do Supabase ausente! Certifique-se de que SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no arquivo .env.'
    );
  }

  supabaseClientInstancia = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseClientInstancia;
}

// Permite injetar cliente mockado ou customizado em testes se necessário
export function definirSupabaseClient(client: SupabaseClient | null): void {
  supabaseClientInstancia = client;
}

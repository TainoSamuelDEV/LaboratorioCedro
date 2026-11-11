'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export type SweepPhase = 'idle' | 'sweeping-in' | 'covered' | 'sweeping-out';

interface EvaluationTransitionContextType {
  phase: SweepPhase;
  isSweeping: boolean;
  startSweep: <T>(action: () => Promise<T>) => Promise<T>;
}

const EvaluationTransitionContext = createContext<EvaluationTransitionContextType>({
  phase: 'idle',
  isSweeping: false,
  startSweep: async (action) => action(),
});

export const useEvaluationTransition = () => useContext(EvaluationTransitionContext);

export function EvaluationTransitionProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<SweepPhase>('idle');

  const startSweep = useCallback(async <T,>(action: () => Promise<T>): Promise<T> => {
    // 1. Inicia o sweep-in: as escamas avançam da direita para a esquerda preenchendo toda a tela
    setPhase('sweeping-in');

    // Executa a requisição da API em paralelo com a animação de avanço
    const actionPromise = action();
    const sweepInMinDuration = new Promise((resolve) => setTimeout(resolve, 520));

    try {
      // Aguarda a tela estar 100% preenchida pelas camadas verdes e a API ter respondido
      const [result] = await Promise.all([actionPromise, sweepInMinDuration]);

      // 2. Tela totalmente preenchida: breve sustentação para troca visual do DOM
      setPhase('covered');
      await new Promise((resolve) => setTimeout(resolve, 80));

      // 3. Sweep-out: as escamas recolhem de volta para o lado direito, revelando a confirmação
      setPhase('sweeping-out');
      await new Promise((resolve) => setTimeout(resolve, 540));

      setPhase('idle');
      return result;
    } catch (error) {
      // Se a API retornar erro, recolhe suavemente para que o usuário veja a mensagem
      setPhase('sweeping-out');
      await new Promise((resolve) => setTimeout(resolve, 400));
      setPhase('idle');
      throw error;
    }
  }, []);

  return (
    <EvaluationTransitionContext.Provider
      value={{
        phase,
        isSweeping: phase !== 'idle',
        startSweep,
      }}
    >
      {children}
    </EvaluationTransitionContext.Provider>
  );
}

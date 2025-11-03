import { useState } from 'react';
import { monologueActions } from '../utils/monologueActions';
import type { CreateMonologueData } from '../../types/database.types';

export const useMonologueComposer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMonologue = async (monologueData: CreateMonologueData, emotionalTone?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await monologueActions.createMonologue(monologueData, emotionalTone);
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create monologue');
      setIsLoading(false);
      throw err;
    }
  };

  return {
    createMonologue,
    isLoading,
    error
  };
};
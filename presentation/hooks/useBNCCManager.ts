
import { useState, useEffect, useMemo, useCallback } from 'react';
import { BNCCUseCases } from '../../domain/usecases';
import { BNCCRepositoryImpl } from '../../data/repositories';
import { getSupabaseClient } from '../../services/supabaseService';
import { BNCCItem } from '../../types';

/**
 * BNCC somente leitura neste app (lista para vínculo em questões/disciplinas).
 */
export const useBNCCManager = (hasSupabase: boolean) => {
    const [items, setItems] = useState<BNCCItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const supabase = getSupabaseClient();
    const useCase = useMemo(() => (supabase ? new BNCCUseCases(new BNCCRepositoryImpl(supabase)) : null), [supabase]);

    const fetchItems = useCallback(async () => {
        if (!useCase || !supabase) return;
        setLoading(true);
        setError(null);
        try {
            const data = await useCase.getItems(false);
            setItems(data);
        } catch (err: any) {
            console.error('Error fetching BNCC items:', err);
            if (err?.code === '42P01') {
                setError("Tabela 'bncc' não encontrada. Por favor, execute o script SQL no Schema do Banco de Dados.");
            } else {
                setError(err.message || 'Falha ao carregar itens BNCC.');
            }
        } finally {
            setLoading(false);
        }
    }, [useCase, supabase]);

    useEffect(() => {
        if (hasSupabase) fetchItems();
    }, [hasSupabase, fetchItems]);

    return {
        items,
        loading,
        error,
        refresh: fetchItems,
    };
};

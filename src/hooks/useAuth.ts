import { useAuthContext } from '../state/context/AuthContext';

/**
 * Public entry point for auth state/actions.
 * Kept as a thin re-export so feature code imports from `hooks/` per the
 * folder structure, while the implementation stays in `state/context/`.
 */
export const useAuth = useAuthContext;

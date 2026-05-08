"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import type { ComposerDraft } from "@/lib/types";

const STORAGE_KEY = "carta-miranda:immersive-composer";

export type ComposerMode = "idle" | "expanded" | "preview" | "submitting" | "error";

export interface ComposerState {
  mode: ComposerMode;
  draft: ComposerDraft;
  seedDraft: ComposerDraft;
  error: string | null;
  hydrated: boolean;
}

type ComposerAction =
  | { type: "hydrate"; draft: ComposerDraft; mode: ComposerMode }
  | { type: "open" }
  | { type: "close" }
  | { type: "toggle-preview" }
  | { type: "update"; patch: Partial<ComposerDraft> }
  | { type: "submit-start" }
  | { type: "submit-success" }
  | { type: "submit-error"; error: string }
  | { type: "clear-error" };

function reducer(state: ComposerState, action: ComposerAction): ComposerState {
  switch (action.type) {
    case "hydrate":
      return { ...state, draft: action.draft, mode: action.mode, hydrated: true };
    case "open":
      return { ...state, mode: state.mode === "preview" ? "preview" : "expanded", error: null };
    case "close":
      return { ...state, mode: "idle", error: null };
    case "toggle-preview":
      return { ...state, mode: state.mode === "preview" ? "expanded" : "preview", error: null };
    case "update":
      return {
        ...state,
        draft: { ...state.draft, ...action.patch, updatedAt: new Date().toISOString() },
        error: null,
      };
    case "submit-start":
      return { ...state, mode: "submitting", error: null };
    case "submit-success":
      return { ...state, mode: "idle", error: null, draft: state.seedDraft };
    case "submit-error":
      return { ...state, mode: "error", error: action.error };
    case "clear-error":
      return { ...state, error: null, mode: state.mode === "error" ? "expanded" : state.mode };
    default:
      return state;
  }
}

interface ComposerContextValue {
  state: ComposerState;
  open: () => void;
  close: () => void;
  togglePreview: () => void;
  updateDraft: (patch: Partial<ComposerDraft>) => void;
  markSubmitting: () => void;
  markSuccess: () => void;
  markError: (error: string) => void;
  clearError: () => void;
}

const ComposerContext = createContext<ComposerContextValue | null>(null);

export function ImmersiveComposerProvider({ children, initialDraft }: { children: ReactNode; initialDraft: ComposerDraft }) {
  const [state, dispatch] = useReducer(reducer, {
    mode: "idle",
    draft: initialDraft,
    seedDraft: initialDraft,
    error: null,
    hydrated: false,
  });

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
        dispatch({ type: "hydrate", draft: initialDraft, mode: "idle" });
        return;
      }

      const stored = JSON.parse(raw) as Partial<ComposerState> & { draft?: ComposerDraft };
      if (stored.draft) {
        dispatch({
          type: "hydrate",
          draft: stored.draft,
          mode: stored.mode === "error" ? "expanded" : stored.mode ?? "expanded",
        });
        return;
      }
    } catch {
      // Fall back to the server-provided draft.
    }

    dispatch({ type: "hydrate", draft: initialDraft, mode: "idle" });
  }, [initialDraft]);

  useEffect(() => {
    if (!state.hydrated) return;

    try {
      if (state.mode === "idle" && !state.draft.title && !state.draft.body && !state.draft.spotifyTrack) {
        window.sessionStorage.removeItem(STORAGE_KEY);
        return;
      }

      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ mode: state.mode, draft: state.draft }));
    } catch {
      // Ignore storage failures and keep the composer functional.
    }
  }, [state]);

  const value = useMemo<ComposerContextValue>(
    () => ({
      state,
      open: () => dispatch({ type: "open" }),
      close: () => dispatch({ type: "close" }),
      togglePreview: () => dispatch({ type: "toggle-preview" }),
      updateDraft: (patch) => dispatch({ type: "update", patch }),
      markSubmitting: () => dispatch({ type: "submit-start" }),
      markSuccess: () => dispatch({ type: "submit-success" }),
      markError: (error) => dispatch({ type: "submit-error", error }),
      clearError: () => dispatch({ type: "clear-error" }),
    }),
    [state]
  );

  return <ComposerContext.Provider value={value}>{children}</ComposerContext.Provider>;
}

export function useImmersiveComposer() {
  const context = useContext(ComposerContext);
  if (!context) {
    throw new Error("useImmersiveComposer must be used within ImmersiveComposerProvider");
  }
  return context;
}

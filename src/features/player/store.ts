import type { ReactNode } from "react";
import { getPlayerStore as getSession } from "./controller.mjs";

export interface PlayerSnapshot {
  revision: number;
  node: ReactNode;
  modal: { title: string; body: ReactNode; query?: string } | null;
  notice: string;
  history: { canUndo: boolean; canRedo: boolean };
  draft: Record<string, any>;
  catalogue: Record<string, any>;
  calculated: Record<string, any>;
}
export interface PlayerStore {
  getSnapshot(): PlayerSnapshot;
  subscribe(listener: () => void): () => void;
  dispatch(event: string, value: unknown): void;
  persist(): void;
  action(element: HTMLElement): Promise<void>;
  render(): void;
  closeDialog(): void;
  dialogInput(event: unknown): void;
  toggle(event: unknown): void;
  breakGroup(): void;
  cancelPending(): void;
}
export function getPlayerStore(verification = false): Promise<PlayerStore> {
  return getSession(verification) as Promise<PlayerStore>;
}

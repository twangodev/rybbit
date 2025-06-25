import { create } from "zustand";

export const useReplayStore = create<{
  sessionId: string;
  setSessionId: (sessionId: string) => void;
}>((set) => ({
  sessionId: "",
  setSessionId: (sessionId) => set({ sessionId }),
}));

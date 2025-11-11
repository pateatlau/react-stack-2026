import { create } from 'zustand';

type State = {
  count: number;
  increment: () => void;
  reset: () => void;
};

const useCounter = create<State>((set) => ({
  count: 0,
  increment: () => set((s: State) => ({ count: s.count + 1 })),
  reset: () => set({ count: 0 }),
}));

export default useCounter;

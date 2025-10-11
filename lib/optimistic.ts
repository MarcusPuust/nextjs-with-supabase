// lib/optimistic.ts
export type Row = {
  id: number;
  title: string;
  created_at?: string;
  deleted?: boolean;
};

export function optimisticUpdateTitle(list: Row[], id: number, title: string) {
  return list.map((r) => (r.id === id ? { ...r, title } : r));
}

export function optimisticRemove(list: Row[], id: number) {
  return list.filter((r) => r.id !== id);
}

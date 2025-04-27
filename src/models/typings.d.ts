export interface GlobalState {
  [key: string]: any;
}

export interface RootState {
  global: GlobalState;
  loading: Record<string, boolean>;
}

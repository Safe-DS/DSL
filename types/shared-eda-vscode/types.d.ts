export interface State {
  tableIdentifier?: string;
  randomText: string;
  table?: Table;
  defaultState?: boolean;
}

export interface Table {
  columns: Column[];
}

export interface Column {
  name: string;
  values: any;
}

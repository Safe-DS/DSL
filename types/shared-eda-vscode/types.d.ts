export interface State {
  selectedText?: string;
  randomText: string;
  table?: Table;
}

export interface Table {
  columns: Column[];
}

export interface Column {
  name: string;
  values: any;
}

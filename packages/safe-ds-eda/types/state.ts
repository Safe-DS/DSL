export interface State {
    tableIdentifier?: string;
    table?: Table;
    tabs?: Tab[];
    defaultState?: boolean;
    history: HistoryEntry[];
    settings?: UserSettings;
}

type InternalAction = 'reorderColumns' | 'resizeColumn' | 'hideColumn' | 'highlightColumn';
type ExternalManipulatingAction = 'filterColumn' | 'sortColumn' | TableFilterTypes;
type ExternalVisualizingAction = TabType;
type Action = InternalAction | ExternalManipulatingAction | ExternalVisualizingAction;

interface HistoryEntryBase {
    type: 'internal' | 'external-manipulating' | 'external-visualizing';
    alias: string;
    action: Action;
}

interface InternalHistoryEntry extends HistoryEntryBase {
    type: 'internal';
    action: InternalAction;
}

interface ExternalManipulatingHistoryEntry extends HistoryEntryBase {
    type: 'external-manipulating';
    action: ExternalManipulatingAction;
}

interface ExternalVisualizingHistoryEntry extends HistoryEntryBase {
    type: 'external-visualizing';
    action: ExternalVisualizingAction;
}

export interface InternalColumnWithValueHistoryEntry extends InternalHistoryEntry {
    action: 'reorderColumns' | 'resizeColumn';
    columnName: string;
    value: number;
}

export interface InternalColumnHistoryEntry extends InternalHistoryEntry {
    action: 'hideColumn' | 'highlightColumn';
    columnName: string;
}

export interface ExternalManipulatingColumnFilterHistoryEntry extends ExternalManipulatingHistoryEntry {
    action: 'filterColumn';
    columnName: string;
    filter: NumericalFilter | CategoricalFilter;
}

export interface ExternalManipulatingTableFilterHistoryEntry extends ExternalManipulatingHistoryEntry {
    action: TableFilterTypes;
}

export interface ExternalManipulatingColumnSortHistoryEntry extends ExternalManipulatingHistoryEntry {
    action: 'sortColumn';
    columnName: string;
    sort: PossibleSorts;
}

export interface ExternalVisualizingNoColumnHistoryEntry extends ExternalVisualizingHistoryEntry {
    action: NoColumnTabTypes;
}

export interface ExternalVisualizingOneColumnHistoryEntry extends ExternalVisualizingHistoryEntry {
    action: OneColumnTabTypes;
    columnName: string;
}

export interface ExternalVisualizingTwoColumnHistoryEntry extends ExternalVisualizingHistoryEntry {
    action: TwoColumnTabTypes;
    xAxisColumnName: string;
    yAxisColumnName: string;
}

export type HistoryEntry =
    | InternalColumnWithValueHistoryEntry
    | InternalColumnHistoryEntry
    | ExternalManipulatingColumnFilterHistoryEntry
    | ExternalManipulatingTableFilterHistoryEntry
    | ExternalManipulatingColumnSortHistoryEntry
    | ExternalVisualizingNoColumnHistoryEntry
    | ExternalVisualizingOneColumnHistoryEntry
    | ExternalVisualizingTwoColumnHistoryEntry;

// ------------------ Types for the Tabs ------------------
type TwoColumnTabTypes = 'linePlot' | 'barPlot' | 'scatterPlot';
type OneColumnTabTypes = 'histogram' | 'infoPanel';
type NoColumnTabTypes = 'heatmap';
type TabType = TwoColumnTabTypes | OneColumnTabTypes | NoColumnTabTypes;

interface TabObject {
    type: TabType;
    tabComment: string;
    content: Object;
}

export interface OneColumnTab extends TabObject {
    type: Exclude<OneColumnTabTypes, 'infoPanel'>;
    content: {
        columnName: string;
        outdated: boolean;
        encodedImage: string;
    };
}

export interface InfoPanelTab extends TabObject {
    type: 'infoPanel';
    content: {
        correlations: { columnName: string; correlation: number }[];
        outdated: boolean;
        statistics: { statName: string; statValue: number }[];
    };
}

export interface TwoColumnTab extends TabObject {
    type: TwoColumnTabTypes;
    content: {
        xAxisColumnName: string;
        yAxisColumnName: string;
        outdated: boolean;
        encodedImage: string;
    };
}

export interface NoColumnTab extends TabObject {
    type: NoColumnTabTypes;
    content: {
        outdated: boolean;
        encodedImage: string;
    };
}

export type Tab = OneColumnTab | InfoPanelTab | TwoColumnTab | NoColumnTab;

// ------------------ Types for the Table ------------------
export interface Table {
    columns: [number, Column][];
    visibleRows?: number;
    totalRows: number;
    name: string;
    appliedFilters: TableFilter[];
}

// ------------ Types for the Profiling -----------
export interface Profiling {
    validRatio: ProfilingDetailStatistical;
    missingRatio: ProfilingDetailStatistical;
    other: ProfilingDetail[];
}

type BaseInterpretation = 'warn' | 'error' | 'default' | 'important' | 'good';

interface ProfilingDetailBase {
    type: 'numerical' | 'image' | 'text';
    value: string | Base64Image;
}

export interface ProfilingDetailStatistical extends ProfilingDetailBase {
    type: 'numerical';
    name: string;
    value: string;
    interpretation: BaseInterpretation | 'category'; // 'category' needed for filters, to show distinct values
}

export interface ProfilingDetailImage extends ProfilingDetailBase {
    type: 'image';
    value: Base64Image;
}

export interface ProfilingDetailName extends ProfilingDetailBase {
    type: 'text';
    value: string;
    interpretation: BaseInterpretation;
}

export type ProfilingDetail = ProfilingDetailStatistical | ProfilingDetailImage | ProfilingDetailName;

// ------------ Types for the Columns -----------
type PossibleSorts = 'asc' | 'desc' | null;

interface ColumnBase {
    type: 'numerical' | 'categorical';
    name: string;
    values: any;
    hidden: boolean;
    highlighted: boolean;
    appliedSort: PossibleSorts;
    profiling?: Profiling;
}

export interface NumericalColumn extends ColumnBase {
    type: 'numerical';
    appliedFilters: NumericalFilter[];
    coloredHighLow: boolean;
}

export interface CategoricalColumn extends ColumnBase {
    type: 'categorical';
    appliedFilters: CategoricalFilter[];
}

export type Column = NumericalColumn | CategoricalColumn;

// ------------ Types for the Filters -----------
interface FilterBase {
    type: string;
}

interface ColumnFilterBase extends FilterBase {
    type: 'valueRange' | 'specificValue' | 'searchString';
    columnName: string;
}

export interface PossibleSearchStringFilter extends ColumnFilterBase {
    type: 'searchString';
}

export interface SearchStringFilter extends PossibleSearchStringFilter {
    searchString: string;
}

export interface PossibleValueRangeFilter extends ColumnFilterBase {
    type: 'valueRange';
    min: number;
    max: number;
}

export interface ValueRangeFilter extends PossibleValueRangeFilter {
    currentMin: number;
    currentMax: number;
}

export interface PossibleSpecificValueFilter extends ColumnFilterBase {
    type: 'specificValue';
    values: string[];
}

export interface SpecificValueFilter extends ColumnFilterBase {
    type: 'specificValue';
    value: string;
}

export type NumericalFilter = ValueRangeFilter;
export type CategoricalFilter = SearchStringFilter | SpecificValueFilter;

export type PossibleColumnFilter = PossibleValueRangeFilter | PossibleSearchStringFilter | PossibleSpecificValueFilter;

type TableFilterTypes =
    | 'hideMissingValueColumns'
    | 'hideNonNumericalColumns'
    | 'hideDuplicateRows'
    | 'hideRowsWithOutliers';

export interface TableFilter extends FilterBase {
    type: TableFilterTypes;
}

// ------------ Types for the Settings -----------
export interface UserSettings {
    profiling: ProfilingSettings;
}

interface ProfilingSettingsBase {
    [key: string]: boolean;
}

export interface ProfilingSettings extends ProfilingSettingsBase {
    idNess: boolean;
    maximum: boolean;
    minimum: boolean;
    mean: boolean;
    median: boolean;
    mode: boolean;
    stability: boolean;
    standardDeviation: boolean;
    sum: boolean;
    variance: boolean;
}

// ------------ Types for general objects -----------

export interface Base64Image {
    format: string;
    bytes: string;
}

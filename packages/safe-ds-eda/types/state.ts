type InternalAction = 'reorderColumns' | 'resizeColumn' | 'hideColumn' | 'highlightColumn' | 'emptyTab';
type ExternalManipulatingAction = 'filterColumn' | 'sortColumn' | TableFilterTypes;
type ExternalVisualizingAction = TabType | 'refreshTab';
type Action = InternalAction | ExternalManipulatingAction | ExternalVisualizingAction;

interface HistoryEntryBase {
    type: 'internal' | 'external-manipulating' | 'external-visualizing';
    alias: string;
    action: Action;
}

export interface InternalHistoryEntryBase extends HistoryEntryBase {
    type: 'internal';
    action: InternalAction;
}

interface ExternalManipulatingHistoryEntryBase extends HistoryEntryBase {
    type: 'external-manipulating';
    action: ExternalManipulatingAction;
}

interface ExternalVisualizingHistoryEntryBase extends HistoryEntryBase {
    type: 'external-visualizing';
    action: ExternalVisualizingAction;
    columnNumber: 'one' | 'two' | 'none';
    existingTabId?: string;
}

export interface InternalColumnWithValueHistoryEntry extends InternalHistoryEntryBase {
    action: 'reorderColumns' | 'resizeColumn';
    columnName: string;
    value: number;
}

export interface InternalColumnHistoryEntry extends InternalHistoryEntryBase {
    action: 'hideColumn' | 'highlightColumn';
    columnName: string;
}

export interface InteralEmptyTabHistoryEntry extends InternalHistoryEntryBase {
    action: 'emptyTab';
}

export interface ExternalManipulatingColumnFilterHistoryEntry extends ExternalManipulatingHistoryEntryBase {
    action: 'filterColumn';
    columnName: string;
    filter: NumericalFilter | CategoricalFilter;
}

export interface ExternalManipulatingTableFilterHistoryEntry extends ExternalManipulatingHistoryEntryBase {
    action: TableFilterTypes;
}

export interface ExternalManipulatingColumnSortHistoryEntry extends ExternalManipulatingHistoryEntryBase {
    action: 'sortColumn';
    columnName: string;
    sort: PossibleSorts;
}

export interface ExternalVisualizingNoColumnHistoryEntry extends ExternalVisualizingHistoryEntryBase {
    action: NoColumnTabTypes;
    columnNumber: 'none';
}

export interface ExternalVisualizingOneColumnHistoryEntry extends ExternalVisualizingHistoryEntryBase {
    action: OneColumnTabTypes;
    columnName: string;
    columnNumber: 'one';
}

export interface ExternalVisualizingTwoColumnHistoryEntry extends ExternalVisualizingHistoryEntryBase {
    action: TwoColumnTabTypes;
    xAxisColumnName: string;
    yAxisColumnName: string;
    columnNumber: 'two';
}

export interface ExternalVisualizingRefreshHistoryEntry extends ExternalVisualizingHistoryEntryBase {
    action: 'refreshTab';
}

export type TabHistoryEntry =
    | ExternalVisualizingNoColumnHistoryEntry
    | ExternalVisualizingOneColumnHistoryEntry
    | ExternalVisualizingTwoColumnHistoryEntry;
export type InternalHistoryEntry =
    | InternalColumnWithValueHistoryEntry
    | InternalColumnHistoryEntry
    | InteralEmptyTabHistoryEntry;
export type ExternalManipulatingHistoryEntry =
    | ExternalManipulatingColumnFilterHistoryEntry
    | ExternalManipulatingTableFilterHistoryEntry
    | ExternalManipulatingColumnSortHistoryEntry;
export type ExternalVisualizingHistoryEntry =
    | ExternalVisualizingNoColumnHistoryEntry
    | ExternalVisualizingOneColumnHistoryEntry
    | ExternalVisualizingTwoColumnHistoryEntry
    | ExternalVisualizingRefreshHistoryEntry;

export type ExternalHistoryEntry = ExternalManipulatingHistoryEntry | ExternalVisualizingHistoryEntry;

export type HistoryEntry = (InternalHistoryEntry | ExternalHistoryEntry) & {
    id: number;
};

// ------------------ Types for the Tabs ------------------
export type TwoColumnTabTypes = 'linePlot' | 'scatterPlot';
export type OneColumnTabTypes = 'histogram' | 'boxPlot' | 'infoPanel';
export type NoColumnTabTypes = 'heatmap';
type TabType = TwoColumnTabTypes | OneColumnTabTypes | NoColumnTabTypes;

interface TabObject {
    id?: string;
    type: TabType;
    tabComment: string;
    content: Object;
    imageTab: boolean;
    columnNumber: 'one' | 'two' | 'none';
    isInGeneration: boolean;
}

interface ImageTabObject extends TabObject {
    imageTab: true;
    content: {
        outdated: boolean;
        encodedImage: Base64Image;
    };
}

interface OneColumnTabContent {
    columnName: string;
    outdated: boolean;
    encodedImage: Base64Image;
}

export interface OneColumnTab extends ImageTabObject {
    type: Exclude<OneColumnTabTypes, 'infoPanel'>;
    columnNumber: 'one';
    content: OneColumnTabContent;
}

interface InfoPanelTabContent {
    correlations: { columnName: string; correlation: number }[];
    outdated: boolean;
    statistics: { statName: string; statValue: number }[];
}

export interface InfoPanelTab extends TabObject {
    imageTab: false;
    type: 'infoPanel';
    columnNumber: 'none';
    content: InfoPanelTabContent;
}

interface TwoColumnTabContent {
    xAxisColumnName: string;
    yAxisColumnName: string;
    outdated: boolean;
    encodedImage: Base64Image;
}

export interface TwoColumnTab extends ImageTabObject {
    type: TwoColumnTabTypes;
    columnNumber: 'two';
    content: TwoColumnTabContent;
}

interface NoColumnTabContent {
    outdated: boolean;
    encodedImage: Base64Image;
}

export interface NoColumnTab extends ImageTabObject {
    type: NoColumnTabTypes;
    columnNumber: 'none';
    content: NoColumnTabContent;
}

export interface EmptyTab {
    type: 'empty';
    id: string;
    isInGeneration: true;
}

export type Tab = OneColumnTab | InfoPanelTab | TwoColumnTab | NoColumnTab | EmptyTab;
export type RealTab = Exclude<Tab, EmptyTab>;
export type PlotTab = OneColumnTab | TwoColumnTab | NoColumnTab;

// ------------------ Types for the Table ------------------
export interface Table {
    tableIdentifier?: string;
    name: string;
    columns: Column[];
    visibleRows?: number;
    totalRows: number;
    appliedFilters: TableFilter;
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

export type TableFilter = {
    [key in TableFilterTypes]?: boolean;
};

// ------------ Types for the Settings -----------
export interface UserSettings {
    profiling: ProfilingSettings;
    darkMode: boolean;
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

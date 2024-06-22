type InternalAction = 'reorderColumns' | 'resizeColumn' | 'hideColumn' | 'showColumn' | 'highlightColumn' | 'emptyTab';
type ExternalManipulatingAction =
    | 'filterColumn'
    | 'voidFilterColumn'
    | 'sortByColumn'
    | 'voidSortByColumn'
    | TableFilterTypes;
type ExternalVisualizingAction = TabType;
type Action = InternalAction | ExternalManipulatingAction | ExternalVisualizingAction;

interface HistoryEntryBase {
    type: 'internal' | 'external-manipulating' | 'external-visualizing';
    alias: string;
    action: Action;
    loading?: boolean;
}

export interface InternalHistoryEntryBase extends HistoryEntryBase {
    type: 'internal';
    action: InternalAction;
}

interface ExternalManipulatingHistoryEntryBase extends HistoryEntryBase {
    type: 'external-manipulating';
    action: ExternalManipulatingAction;
}

interface ExternalVisualizingHistoryEntryBaseExisting extends HistoryEntryBase {
    type: 'external-visualizing';
    action: ExternalVisualizingAction;
    columnNumber: 'one' | 'two' | 'none';
    existingTabId: string;
    newTabId?: never;
}

interface ExternalVisualizingHistoryEntryBaseNew extends HistoryEntryBase {
    type: 'external-visualizing';
    action: ExternalVisualizingAction;
    columnNumber: 'one' | 'two' | 'none';
    newTabId: string;
    existingTabId?: never;
}

type ExternalVisualizingHistoryEntryBase =
    | ExternalVisualizingHistoryEntryBaseExisting
    | ExternalVisualizingHistoryEntryBaseNew;

export interface InternalColumnWithValueHistoryEntry extends InternalHistoryEntryBase {
    action: 'resizeColumn';
    columnName: string;
    value: number;
}

export interface InternalColumnReoderHistoryEntry extends InternalHistoryEntryBase {
    action: 'reorderColumns';
    columnOrder: string[];
}

export interface InternalColumnHistoryEntry extends InternalHistoryEntryBase {
    action: 'hideColumn' | 'highlightColumn' | 'showColumn';
    columnName: string;
}

export interface InteralEmptyTabHistoryEntry extends InternalHistoryEntryBase {
    action: 'emptyTab';
    newTabId: string;
}

export interface ExternalManipulatingColumnFilterHistoryEntry extends ExternalManipulatingHistoryEntryBase {
    action: 'filterColumn';
    columnName: string;
    filter: NumericalFilter | CategoricalFilter;
}

export interface ExternalManipulatingColumnFilterVoidHistoryEntry extends ExternalManipulatingHistoryEntryBase {
    action: 'voidFilterColumn';
    columnName: string;
    filterType: NumericalFilter['type'] | CategoricalFilter['type'];
}

export interface ExternalManipulatingTableFilterHistoryEntry extends ExternalManipulatingHistoryEntryBase {
    action: TableFilterTypes;
}

export interface ExternalManipulatingColumnSortHistoryEntry extends ExternalManipulatingHistoryEntryBase {
    action: 'sortByColumn';
    columnName: string;
    sort: PossibleSorts;
}

export interface ExternalManipulatingColumnSortVoidHistoryEntry extends ExternalManipulatingHistoryEntryBase {
    action: 'voidSortByColumn';
    columnName: string;
}

export type ExternalVisualizingNoColumnHistoryEntry = {
    action: NoColumnTabTypes;
    columnNumber: 'none';
} & ExternalVisualizingHistoryEntryBase;

export type ExternalVisualizingOneColumnHistoryEntry = {
    action: OneColumnTabTypes;
    columnName: string;
    columnNumber: 'one';
} & ExternalVisualizingHistoryEntryBase;

export type ExternalVisualizingTwoColumnHistoryEntry = {
    action: TwoColumnTabTypes;
    xAxisColumnName: string;
    yAxisColumnName: string;
    columnNumber: 'two';
} & ExternalVisualizingHistoryEntryBase;

export type TabHistoryEntry =
    | ExternalVisualizingNoColumnHistoryEntry
    | ExternalVisualizingOneColumnHistoryEntry
    | ExternalVisualizingTwoColumnHistoryEntry;
export type InternalHistoryEntry =
    | InternalColumnWithValueHistoryEntry
    | InternalColumnHistoryEntry
    | InteralEmptyTabHistoryEntry
    | InternalColumnReoderHistoryEntry;
export type ExternalManipulatingHistoryEntry =
    | ExternalManipulatingColumnFilterHistoryEntry
    | ExternalManipulatingTableFilterHistoryEntry
    | ExternalManipulatingColumnFilterVoidHistoryEntry
    | ExternalManipulatingColumnSortHistoryEntry
    | ExternalManipulatingColumnSortVoidHistoryEntry;
export type ExternalVisualizingHistoryEntry =
    | ExternalVisualizingNoColumnHistoryEntry
    | ExternalVisualizingOneColumnHistoryEntry
    | ExternalVisualizingTwoColumnHistoryEntry;

export type ExternalHistoryEntry = ExternalManipulatingHistoryEntry | ExternalVisualizingHistoryEntry;

interface ExtendedInfo {
    id: number;
    overrideId: string;
    tabOrder: string[];
    profilingState: { columnName: string; profiling: Profiling | undefined }[] | null;
}

export type FullExternalVisualizingHistoryEntry = ExternalVisualizingHistoryEntry & ExtendedInfo;
export type FullExternalManipulatingHistoryEntry = ExternalManipulatingHistoryEntry & ExtendedInfo;
export type FullInternalHistoryEntry = InternalHistoryEntry & ExtendedInfo;
export type HistoryEntry = (InternalHistoryEntry | ExternalHistoryEntry) & ExtendedInfo;

// ------------------ Types for the Tabs ------------------
export type TwoColumnTabTypes = 'linePlot' | 'scatterPlot';
export type OneColumnTabTypes = 'histogram' | 'boxPlot' | 'infoPanel';
export type NoColumnTabTypes = 'heatmap';
type TabType = TwoColumnTabTypes | OneColumnTabTypes | NoColumnTabTypes;

interface TabObject {
    id: string;
    type: TabType;
    tabComment: string;
    content: Object;
    imageTab: boolean;
    columnNumber: 'one' | 'two' | 'none';
    isInGeneration: boolean;
    outdated: boolean;
}

interface ImageTabObject extends TabObject {
    imageTab: true;
    content: {
        encodedImage: Base64Image;
    };
}

interface OneColumnTabContent {
    columnName: string;
    encodedImage: Base64Image;
}

export interface OneColumnTab extends ImageTabObject {
    type: Exclude<OneColumnTabTypes, 'infoPanel'>;
    columnNumber: 'one';
    content: OneColumnTabContent;
}

interface InfoPanelTabContent {
    columnName: string;
    correlations: { columnName: string; correlation: number }[];
    statistics: { statName: string; statValue: number }[];
}

export interface InfoPanelTab extends TabObject {
    imageTab: false;
    type: 'infoPanel';
    columnNumber: 'one';
    content: InfoPanelTabContent;
}

interface TwoColumnTabContent {
    xAxisColumnName: string;
    yAxisColumnName: string;
    encodedImage: Base64Image;
}

export interface TwoColumnTab extends ImageTabObject {
    type: TwoColumnTabTypes;
    columnNumber: 'two';
    content: TwoColumnTabContent;
}

interface NoColumnTabContent {
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
export type PossibleSorts = 'asc' | 'desc';

interface ColumnBase {
    type: 'numerical' | 'categorical';
    name: string;
    values: any;
    hidden: boolean;
    highlighted: boolean;
    appliedSort: PossibleSorts | null;
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
    value: string | number;
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

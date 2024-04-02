export interface State {
    tableIdentifier?: string;
    table?: Table;
    tabs?: Tab[];
    defaultState?: boolean;
    history: HistoryEntry[];
    settings?: UserSettings;
}

export interface HistoryEntry {
    alias?: string;
    action: string;
    executedSdsCode: string;
}

// ------------------ Types for the Tabs ------------------
type TabType = 'linePlot' | 'barPlot' | 'heatmap' | 'scatterPlot' | 'infoPanel';

export interface TabObject {
    type: TabType;
    tabComment: string;
    content: Object;
}

export interface DefaultPlotTab extends TabObject {
    content: {
        xAxis: string;
        yAxis: string;
        outdated: boolean;
        encodedImage: string;
    };
}
export interface LinePlotTab extends DefaultPlotTab {
    type: 'linePlot';
}

export interface BarPlotTab extends DefaultPlotTab {
    type: 'barPlot';
}
export interface ScatterPlotTab extends DefaultPlotTab {
    type: 'scatterPlot';
}

export interface HeatmapTab extends TabObject {
    type: 'heatmap';
    content: {
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

export type Tab = LinePlotTab | BarPlotTab | HeatmapTab | ScatterPlotTab | InfoPanelTab;

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

export interface ProfilingDetailBase {
    type: 'numerical' | 'image' | 'name';
    value: string;
}

interface ProfilingDetailText extends ProfilingDetailBase {
    interpretation: 'warn' | 'error' | 'default' | 'important' | 'good';
}

export interface ProfilingDetailStatistical extends ProfilingDetailText {
    type: 'numerical';
    name: string;
    value: string;
    interpretation: ProfilingDetailText['interpretation'] | 'category'; // 'category' needed for filters, to show distinct values
}

export interface ProfilingDetailImage extends ProfilingDetailBase {
    type: 'image';
    value: Base64Image;
}

export interface ProfilingDetailName extends ProfilingDetailText {
    type: 'text';
    value: string;
}

export type ProfilingDetail = ProfilingDetailStatistical | ProfilingDetailImage | ProfilingDetailName;

// ------------ Types for the Columns -----------
export interface ColumnBase {
    type: 'numerical' | 'categorical';
    name: string;
    values: any;
    hidden: boolean;
    highlighted: boolean;
    appliedSort: 'asc' | 'desc' | null;
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
export interface FilterBase {
    type: string;
}

export interface ColumnFilterBase extends FilterBase {
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

export interface TableFilter extends FilterBase {
    type: 'hideMissingValueColumns' | 'hideNonNumericalColumns' | 'hideDuplicateRows' | 'hideRowsWithOutliers';
}

// ------------ Types for the Settings -----------
export interface UserSettings {
    profiling: ProfilingSettings;
}

export interface ProfilingSettingsBase {
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

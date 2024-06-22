import {
    Base64Image,
    CategoricalFilter,
    Column,
    ExternalHistoryEntry,
    HistoryEntry,
    NumericalFilter,
    PossibleSorts,
    Profiling,
    ProfilingDetailStatistical,
    Table,
} from '@safe-ds/eda/types/state.js';
import { ast, CODEGEN_PREFIX, messages, SafeDsServices } from '@safe-ds/lang';
import { LangiumDocument } from 'langium';
import * as vscode from 'vscode';
import crypto from 'crypto';
import { getPipelineDocument } from '../../mainClient.ts';
import { safeDsLogger } from '../../helpers/logging.js';
import {
    ExecuteRunnerAllEntry,
    MultipleRunnerExecutionResultMessage,
    RunnerExecutionResultMessage,
} from '@safe-ds/eda/types/messaging.ts';

export class RunnerApi {
    services: SafeDsServices;
    pipelinePath: vscode.Uri;
    pipelineName: string;
    pipelineNode: ast.SdsPipeline;
    tablePlaceholder: string;
    baseDocument: LangiumDocument | undefined;
    placeholderCounter = 0;

    constructor(
        services: SafeDsServices,
        pipelinePath: vscode.Uri,
        pipelineName: string,
        pipelineNode: ast.SdsPipeline,
        tablePlaceholder: string,
    ) {
        this.services = services;
        this.pipelinePath = pipelinePath;
        this.pipelineName = pipelineName;
        this.pipelineNode = pipelineNode;
        this.tablePlaceholder = tablePlaceholder;
        getPipelineDocument(this.pipelinePath).then((doc) => {
            // Get here to avoid issues because of chanigng file
            // Make sure to create new instance of RunnerApi if pipeline execution of fresh pipeline is needed
            // (e.g. launching of extension on table with existing state but no current panel)
            this.baseDocument = doc;
        });
    }

    //#region Pipeline execution
    private async addToAndExecutePipeline(
        pipelineExecutionId: string,
        addedLines: string,
        placeholderNames?: string[],
    ): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (!this.baseDocument) {
                reject('Document not found');
                return;
            }

            const documentText = this.baseDocument.textDocument.getText();

            const endOfPipeline = this.pipelineNode.$cstNode?.end;
            if (!endOfPipeline) {
                reject('Pipeline not found');
                return;
            }

            let newDocumentText;

            this.services.shared.workspace.LangiumDocuments.deleteDocument(this.pipelinePath);

            const beforePipelineEnd = documentText.substring(0, endOfPipeline - 1);
            const afterPipelineEnd = documentText.substring(endOfPipeline - 1);
            newDocumentText = beforePipelineEnd + addedLines + afterPipelineEnd;

            const newDoc = this.services.shared.workspace.LangiumDocumentFactory.fromString(
                newDocumentText,
                this.pipelinePath,
            );
            await this.services.shared.workspace.DocumentBuilder.build([newDoc]);

            safeDsLogger.debug(`Executing pipeline ${this.pipelineName} with added lines`);
            await this.services.runtime.Runner.executePipeline(
                pipelineExecutionId,
                newDoc,
                this.pipelineName,
                placeholderNames,
            );

            this.services.shared.workspace.LangiumDocuments.deleteDocument(this.pipelinePath);
            this.services.shared.workspace.LangiumDocuments.addDocument(this.baseDocument);

            const runtimeCallback = (message: messages.RuntimeProgressMessage) => {
                if (message.id !== pipelineExecutionId) {
                    return;
                }
                if (message.data === 'done') {
                    safeDsLogger.debug(`Pipeline execution ${this.pipelineName} done`);
                    this.services.runtime.PythonServer.removeMessageCallback('runtime_progress', runtimeCallback);
                    this.services.runtime.PythonServer.removeMessageCallback('runtime_error', errorCallback);
                    resolve();
                }
            };
            const errorCallback = (message: messages.RuntimeErrorMessage) => {
                if (message.id !== pipelineExecutionId) {
                    return;
                }
                safeDsLogger.error(`Pipeline execution ${this.pipelineName} ran into error: ${message.data}`);
                this.services.runtime.PythonServer.removeMessageCallback('runtime_progress', runtimeCallback);
                this.services.runtime.PythonServer.removeMessageCallback('runtime_error', errorCallback);
                reject(message.data);
            };
            this.services.runtime.PythonServer.addMessageCallback('runtime_progress', runtimeCallback);
            this.services.runtime.PythonServer.addMessageCallback('runtime_error', errorCallback);

            setTimeout(() => {
                reject('Pipeline execution timed out');
            }, 3000000);
        });
    }
    //#endregion

    //#region Helpers
    private runnerResultToTable(tableName: string, runnerResult: any, columnIsNumeric: Map<string, boolean>): Table {
        const table: Table = {
            totalRows: 0,
            name: tableName,
            columns: [] as Table['columns'],
            appliedFilters: [] as Table['appliedFilters'],
        };

        let currentMax = 0;
        for (const [columnName, columnValues] of Object.entries(runnerResult)) {
            if (!Array.isArray(columnValues)) {
                continue;
            }
            if (currentMax < columnValues.length) {
                currentMax = columnValues.length;
            }

            const columnType = columnIsNumeric.get(columnName) ? 'numerical' : 'categorical';

            const column: Column = {
                name: columnName,
                values: columnValues,
                type: columnType,
                hidden: false,
                highlighted: false,
                appliedFilters: [],
                appliedSort: null,
                coloredHighLow: false,
            };
            table.columns.push(column);
        }
        table.totalRows = currentMax;
        table.visibleRows = currentMax;

        return table;
    }
    //#endregion

    //#region SDS code generation
    private sdsStringForHistoryEntry(
        historyEntry: ExternalHistoryEntry,
        overrideTablePlaceholder?: string,
    ): {
        sdsString: string;
        placeholderName: string;
    } {
        const newPlaceholderName = this.genPlaceholderName();
        switch (historyEntry.action) {
            case 'histogram':
                return {
                    sdsString: this.sdsStringForHistogramByColumnName(
                        historyEntry.columnName,
                        overrideTablePlaceholder ?? this.tablePlaceholder,
                        newPlaceholderName,
                    ),
                    placeholderName: newPlaceholderName,
                };
            case 'boxPlot':
                return {
                    sdsString: this.sdsStringForBoxplotByColumnName(
                        historyEntry.columnName,
                        overrideTablePlaceholder ?? this.tablePlaceholder,
                        newPlaceholderName,
                    ),
                    placeholderName: newPlaceholderName,
                };
            case 'linePlot':
                return {
                    sdsString: this.sdsStringForLinePlotByColumnNames(
                        historyEntry.xAxisColumnName,
                        historyEntry.yAxisColumnName,
                        overrideTablePlaceholder ?? this.tablePlaceholder,
                        newPlaceholderName,
                    ),
                    placeholderName: newPlaceholderName,
                };
            case 'scatterPlot':
                return {
                    sdsString: this.sdsStringForScatterPlotByColumnNames(
                        historyEntry.xAxisColumnName,
                        historyEntry.yAxisColumnName,
                        overrideTablePlaceholder ?? this.tablePlaceholder,
                        newPlaceholderName,
                    ),
                    placeholderName: newPlaceholderName,
                };
            case 'heatmap':
                return {
                    sdsString: this.sdsStringForCorrelationHeatmap(
                        overrideTablePlaceholder ?? this.tablePlaceholder,
                        newPlaceholderName,
                    ),
                    placeholderName: newPlaceholderName,
                };
            case 'sortByColumn':
                return {
                    sdsString: this.sdsStringForSortRowsByColumn(
                        historyEntry.columnName,
                        historyEntry.sort,
                        overrideTablePlaceholder ?? this.tablePlaceholder,
                        newPlaceholderName,
                    ),
                    placeholderName: newPlaceholderName,
                };
            case 'voidSortByColumn':
                // This is a void action, no SDS code is generated and new placeholder is just previous one
                return {
                    sdsString: '',
                    placeholderName: overrideTablePlaceholder ?? this.tablePlaceholder,
                };
            case 'voidFilterColumn':
                // This is a void action, no SDS code is generated and new placeholder is just previous one
                return {
                    sdsString: '',
                    placeholderName: overrideTablePlaceholder ?? this.tablePlaceholder,
                };
            case 'filterColumn':
                return {
                    sdsString: this.sdsStringForFilterColumn(
                        historyEntry.columnName,
                        historyEntry.filter,
                        overrideTablePlaceholder ?? this.tablePlaceholder,
                        newPlaceholderName,
                    ),
                    placeholderName: newPlaceholderName,
                };
            default:
                throw new Error('Unknown history entry action: ' + historyEntry.action);
        }
    }

    private sdsStringForFilterColumn(
        columnName: string,
        filter: NumericalFilter | CategoricalFilter,
        tablePlaceholder: string,
        newPlaceholderName: string,
    ) {
        if (filter.type === 'specificValue') {
            return (
                'val ' +
                newPlaceholderName +
                ' = ' +
                tablePlaceholder +
                '.removeRowsByColumn("' +
                columnName +
                '", (cell) -> cell.eq(' +
                (typeof filter.value === 'string' ? `"${filter.value}"` : filter.value) +
                ').^not()); \n'
            );
        } else if (filter.type === 'searchString') {
            return (
                'val ' +
                newPlaceholderName +
                ' = ' +
                tablePlaceholder +
                '.removeRowsByColumn("' +
                columnName +
                '", (cell) -> cell.str.contains("' +
                filter.searchString +
                '").^not()); \n'
            );
        } else if (filter.type === 'valueRange') {
            return (
                'val ' +
                newPlaceholderName +
                ' = ' +
                tablePlaceholder +
                '.removeRowsByColumn("' +
                columnName +
                '", (cell) -> cell.ge(' +
                filter.currentMin +
                ').^not()).removeRowsByColumn("' +
                columnName +
                '", (cell) -> cell.le(' +
                filter.currentMax +
                ').^not()); \n'
            );
        } else {
            throw new Error('Unknown filter type: ' + filter);
        }
    }

    private sdsStringForMissingValueRatioByColumnName(
        columnName: string,
        tablePlaceholder: string,
        newPlaceholderName: string,
    ): string {
        return (
            'val ' +
            newPlaceholderName +
            ' = ' +
            tablePlaceholder +
            '.getColumn("' +
            columnName +
            '").missingValueRatio(); \n'
        );
    }

    private sdsStringForIDnessByColumnName(columnName: string, tablePlaceholder: string, newPlaceholderName: string) {
        return 'val ' + newPlaceholderName + ' = ' + tablePlaceholder + '.getColumn("' + columnName + '").idness(); \n';
    }

    private sdsStringForHistogramByColumnName(
        columnName: string,
        tablePlaceholder: string,
        newPlaceholderName: string,
    ) {
        return (
            'val ' +
            newPlaceholderName +
            ' = ' +
            tablePlaceholder +
            '.getColumn("' +
            columnName +
            '").plot.histogram(); \n'
        );
    }

    private sdsStringForBoxplotByColumnName(columnName: string, tablePlaceholder: string, newPlaceholderName: string) {
        return (
            'val ' +
            newPlaceholderName +
            ' = ' +
            tablePlaceholder +
            '.getColumn("' +
            columnName +
            '").plot.boxPlot(); \n'
        );
    }

    private sdsStringForLinePlotByColumnNames(
        xAxisColumnName: string,
        yAxisColumnName: string,
        tablePlaceholder: string,
        newPlaceholderName: string,
    ) {
        return (
            'val ' +
            newPlaceholderName +
            ' = ' +
            tablePlaceholder +
            '.plot.linePlot(xName="' +
            xAxisColumnName +
            '", yName="' +
            yAxisColumnName +
            '"); \n'
        );
    }

    private sdsStringForScatterPlotByColumnNames(
        xAxisColumnName: string,
        yAxisColumnName: string,
        tablePlaceholder: string,
        newPlaceholderName: string,
    ) {
        return (
            'val ' +
            newPlaceholderName +
            ' = ' +
            tablePlaceholder +
            '.plot.scatterPlot(xName="' +
            xAxisColumnName +
            '", yName="' +
            yAxisColumnName +
            '"); \n'
        );
    }

    private sdsStringForCorrelationHeatmap(tablePlaceholder: string, newPlaceholderName: string) {
        return 'val ' + newPlaceholderName + ' = ' + tablePlaceholder + '.plot.correlationHeatmap(); \n';
    }

    private sdsStringForIsNumeric(tablePlaceholder: string, columnName: string, newPlaceholderName: string) {
        return (
            'val ' + newPlaceholderName + ' = ' + tablePlaceholder + '.getColumn("' + columnName + '").isNumeric; \n'
        );
    }

    private sdsStringForSortRowsByColumn(
        columnName: string,
        direction: PossibleSorts,
        tablePlaceholder: string,
        newPlaceholderName: string,
    ) {
        if (!direction) throw new Error('Null direction not implemented!');
        return (
            'val ' +
            newPlaceholderName +
            ' = ' +
            tablePlaceholder +
            '.sortRowsByColumn("' +
            columnName +
            '" , ' +
            (direction === 'desc') +
            '); \n'
        );
    }

    private sdsStringForRemoveColumns(columnNames: string[], tablePlaceholder: string, newPlaceholderName: string) {
        const quotedColumns = columnNames.map((name) => `"${name}"`).join(',');
        return 'val ' + newPlaceholderName + ' = ' + tablePlaceholder + `.removeColumns([${quotedColumns}]); \n`;
    }

    private sdsStringForTableSchema(tablePlaceholder: string, newPlaceholderName: string) {
        return 'val ' + newPlaceholderName + ' = ' + tablePlaceholder + '.^schema; \n';
    }
    //#endregion

    //#region Placeholder handling
    private genPlaceholderName(suffix?: string): string {
        // Filter out non-alphanumeric characters (allowing underscores), considering Unicode characters
        const cleanedSuffix = suffix ? suffix.replace(/[^a-zA-Z0-9_]/gu, '') : undefined;
        return CODEGEN_PREFIX + this.placeholderCounter++ + (cleanedSuffix ? '_' + cleanedSuffix : '');
    }

    private async getPlaceholderValue(placeholder: string, pipelineExecutionId: string): Promise<any | undefined> {
        return new Promise((resolve) => {
            if (placeholder === '') {
                resolve(undefined);
            }

            const placeholderValueCallback = (message: messages.PlaceholderValueMessage) => {
                if (message.id !== pipelineExecutionId || message.data.name !== placeholder) {
                    return;
                }
                this.services.runtime.PythonServer.removeMessageCallback('placeholder_value', placeholderValueCallback);
                safeDsLogger.debug(
                    'Got placeholder value: ' + JSON.stringify(message.data.value).slice(0, 100) + '...',
                );
                resolve(message.data.value);
            };

            this.services.runtime.PythonServer.addMessageCallback('placeholder_value', placeholderValueCallback);

            safeDsLogger.debug('Requesting placeholder: ' + placeholder);
            this.services.runtime.PythonServer.sendMessageToPythonServer(
                messages.createPlaceholderQueryMessage(pipelineExecutionId, placeholder),
            );

            setTimeout(() => {
                resolve(undefined);
            }, 30000);
        });
    }

    //#region Public API

    //#region Table fetching
    public async getTableByPlaceholder(
        tableName: string,
        pipelineExecutionId: string,
        sdsLinesOverride = '',
    ): Promise<Table | undefined> {
        safeDsLogger.debug('Getting table by placeholder: ' + tableName);

        const pythonTableColumns = await this.getPlaceholderValue(tableName, pipelineExecutionId);
        if (pythonTableColumns) {
            // Get Column Types
            safeDsLogger.debug('Getting column types for table: ' + tableName);
            let sdsLines = sdsLinesOverride;
            let placeholderNames: string[] = [];
            let columnNameToPlaceholderIsNumericNameMap = new Map<string, string>();
            for (const columnName of Object.keys(pythonTableColumns)) {
                const newPlaceholderName = this.genPlaceholderName(columnName + '_type');
                columnNameToPlaceholderIsNumericNameMap.set(columnName, newPlaceholderName);
                placeholderNames.push(newPlaceholderName);
                sdsLines += this.sdsStringForIsNumeric(tableName, columnName, newPlaceholderName);
            }

            await this.addToAndExecutePipeline(pipelineExecutionId, sdsLines, placeholderNames);
            const columnIsNumeric = new Map<string, boolean>();
            for (const [columnName, placeholderName] of columnNameToPlaceholderIsNumericNameMap) {
                const columnType = await this.getPlaceholderValue(placeholderName, pipelineExecutionId);
                columnIsNumeric.set(columnName, columnType as boolean);
            }

            return this.runnerResultToTable(tableName, pythonTableColumns, columnIsNumeric);
        } else {
            return undefined;
        }
    }
    //#endregion

    //#region Profiling
    public async getProfiling(
        table: Table,
        sdsLinesOverride = '',
    ): Promise<{ columnName: string; profiling: Profiling }[]> {
        safeDsLogger.debug('Getting profiling for table: ' + table.name);

        const columns = table.columns;

        let sdsStrings = sdsLinesOverride;

        let placeholderNames: string[] = [];

        const columnNameToPlaceholderMVNameMap = new Map<string, string>(); // Mapping random placeholder name for missing value ratio back to column name
        const missingValueRatioMap = new Map<string, number>(); // Saved by random placeholder name

        const columnNameToPlaceholderHistogramNameMap = new Map<string, string>(); // Mapping random placeholder name for histogram back to column name
        const histogramMap = new Map<string, Base64Image | undefined>(); // Saved by random placeholder name

        const uniqueValuesMap = new Map<string, Set<any>>();

        // Generate SDS code to get missing value ratio for each column
        for (const column of columns) {
            const newMvPlaceholderName = this.genPlaceholderName(column.name + '_mv');
            placeholderNames.push(newMvPlaceholderName);
            columnNameToPlaceholderMVNameMap.set(column.name, newMvPlaceholderName);
            sdsStrings += this.sdsStringForMissingValueRatioByColumnName(column.name, table.name, newMvPlaceholderName);

            // Find unique values
            // TODO reevaluate when image stuck problem fixed
            let uniqueValues = new Set<any>();
            for (let j = 0; j < column.values.length; j++) {
                uniqueValues.add(column.values[j]);
            }
            uniqueValuesMap.set(column.name, uniqueValues);

            // Different histogram conditions for numerical and categorical columns
            if (column.type !== 'numerical') {
                if (uniqueValues.size <= 3 || uniqueValues.size > 10) {
                    // Must match conidtions below that choose to display histogram for categorical columns
                    continue; // This historam only generated if between 4-10 categorigal uniques or numerical type
                }
            } else {
                if (uniqueValues.size > column.values.length * 0.9) {
                    // Must match conidtions below that choose to display histogram for numerical columns
                    // If 90% of values are unique, it's not a good idea to display histogram
                    continue;
                }
            }

            // Histogram for numerical columns or categorical columns with 4-10 unique values
            const newHistogramPlaceholderName = this.genPlaceholderName(column.name + '_hist');
            placeholderNames.push(newHistogramPlaceholderName);
            columnNameToPlaceholderHistogramNameMap.set(column.name, newHistogramPlaceholderName);
            sdsStrings += this.sdsStringForHistogramByColumnName(column.name, table.name, newHistogramPlaceholderName);
        }

        // Execute with generated SDS code
        const pipelineExecutionId = crypto.randomUUID();
        try {
            await this.addToAndExecutePipeline(pipelineExecutionId, sdsStrings, placeholderNames);
        } catch (e) {
            throw e;
        }

        // Get missing value ratio for each column
        for (const [, placeholderName] of columnNameToPlaceholderMVNameMap) {
            const missingValueRatio = await this.getPlaceholderValue(placeholderName, pipelineExecutionId);
            if (missingValueRatio) {
                missingValueRatioMap.set(placeholderName, missingValueRatio as number);
            }
        }

        // Get histogram for each column
        for (const [, placeholderName] of columnNameToPlaceholderHistogramNameMap) {
            const histogram = await this.getPlaceholderValue(placeholderName, pipelineExecutionId);
            if (histogram) {
                histogramMap.set(placeholderName, histogram as Base64Image);
            }
        }

        // Create profiling data
        const profiling: { columnName: string; profiling: Profiling }[] = [];
        for (const column of columns) {
            // Base info for the top of the profiling
            const missingValuesRatio =
                missingValueRatioMap.get(columnNameToPlaceholderMVNameMap.get(column.name)!)! * 100;

            const validRatio: ProfilingDetailStatistical = {
                type: 'numerical',
                name: 'Valid',
                value: missingValuesRatio ? (100 - missingValuesRatio).toFixed(2) + '%' : '100%',
                interpretation: 'good',
            };

            const missingRatio: ProfilingDetailStatistical = {
                type: 'numerical',
                name: 'Missing',
                value: missingValuesRatio ? missingValuesRatio.toFixed(2) + '%' : '0%',
                interpretation: missingValuesRatio > 0 ? 'error' : 'default',
            };

            const uniqueValues = uniqueValuesMap.get(column.name)!.size;
            // If not numerical, add proper profilings according to idness results
            if (column.type !== 'numerical') {
                if (uniqueValues <= 3) {
                    // Can display each separate percentages of unique values
                    // Find all unique values and count them
                    const uniqueValueCounts = new Map<string, number>();
                    for (let i = 0; i < column.values.length; i++) {
                        if (column.values[i] !== undefined && column.values[i] !== null)
                            uniqueValueCounts.set(column.values[i], (uniqueValueCounts.get(column.values[i]) || 0) + 1);
                    }

                    let uniqueProfilings: ProfilingDetailStatistical[] = [];
                    for (const [key, value] of uniqueValueCounts) {
                        uniqueProfilings.push({
                            type: 'numerical',
                            name: key,
                            value: ((value / column.values.length) * 100).toFixed(2) + '%',
                            interpretation: 'category',
                        });
                    }

                    profiling.push({
                        columnName: column.name,
                        profiling: {
                            validRatio,
                            missingRatio,
                            other: [
                                { type: 'text', value: 'Categorical', interpretation: 'important' },
                                ...uniqueProfilings,
                            ],
                        },
                    });
                } else if (uniqueValues <= 10) {
                    // Display histogram for 4-10 unique values, has to match the condition above where histogram is generated
                    const histogram = histogramMap.get(columnNameToPlaceholderHistogramNameMap.get(column.name)!)!;

                    profiling.push({
                        columnName: column.name,
                        profiling: {
                            validRatio,
                            missingRatio,
                            other: [
                                { type: 'text', value: 'Categorical', interpretation: 'important' },
                                { type: 'image', value: histogram },
                            ],
                        },
                    });
                } else {
                    // Display only the number of unique values vs total valid values
                    profiling.push({
                        columnName: column.name,
                        profiling: {
                            validRatio,
                            missingRatio,
                            other: [
                                { type: 'text', value: 'Categorical', interpretation: 'important' },
                                {
                                    type: 'text',
                                    value: uniqueValues + ' Distincts',
                                    interpretation: 'default',
                                },
                                {
                                    type: 'text',
                                    value:
                                        Math.round(
                                            column.values.length *
                                                (1 -
                                                    (missingValueRatioMap.get(
                                                        columnNameToPlaceholderMVNameMap.get(column.name)!,
                                                    ) || 0)),
                                        ) + ' Total Valids',
                                    interpretation: 'default',
                                },
                            ],
                        },
                    });
                }
            } else {
                if (uniqueValues > column.values.length * 0.9) {
                    profiling.push({
                        columnName: column.name,
                        profiling: {
                            validRatio,
                            missingRatio,
                            other: [
                                { type: 'text', value: 'Numerical', interpretation: 'important' },
                                {
                                    type: 'text',
                                    value: uniqueValues + ' Distincts',
                                    interpretation: 'default',
                                },
                                {
                                    type: 'text',
                                    value:
                                        Math.round(
                                            column.values.length *
                                                (1 -
                                                    (missingValueRatioMap.get(
                                                        columnNameToPlaceholderMVNameMap.get(column.name)!,
                                                    ) || 0)),
                                        ) + ' Total Valids',
                                    interpretation: 'default',
                                },
                            ],
                        },
                    });
                } else {
                    const histogram = histogramMap.get(columnNameToPlaceholderHistogramNameMap.get(column.name)!)!;

                    profiling.push({
                        columnName: column.name,
                        profiling: {
                            validRatio,
                            missingRatio,
                            other: [
                                { type: 'text', value: 'Numerical', interpretation: 'important' },
                                { type: 'image', value: histogram },
                            ],
                        },
                    });
                }
            }
        }

        return profiling;
    }

    public async getFreshProfiling(
        historyEntries: HistoryEntry[],
    ): Promise<{ columnName: string; profiling: Profiling }[]> {
        let sdsLines = '';
        const filteredEntries = this.filterPastEntries(historyEntries);
        let placeholderOverride = this.tablePlaceholder;

        for (const entry of filteredEntries) {
            if (entry.type === 'external-manipulating') {
                const sdsStringObj = this.sdsStringForHistoryEntry(entry, placeholderOverride);
                sdsLines += sdsStringObj.sdsString;
                placeholderOverride = sdsStringObj.placeholderName;
            }
        }

        const pipelineExecutionId = crypto.randomUUID();
        try {
            await this.addToAndExecutePipeline(
                pipelineExecutionId,
                sdsLines,
                placeholderOverride ? [placeholderOverride] : undefined,
            );
        } catch (e) {
            throw e;
        }

        const table = await this.getTableByPlaceholder(placeholderOverride, pipelineExecutionId, sdsLines);
        if (!table) throw new Error('Table not found');
        return this.getProfiling(table, sdsLines);
    }
    //#endregion

    //#region History
    public async executeHistoryAndReturnNewResult(
        pastEntries: HistoryEntry[],
        newEntry: HistoryEntry,
        hiddenColumns?: string[],
    ): Promise<RunnerExecutionResultMessage['value']> {
        let sdsLines = '';
        let placeholderNameNeeded: string | undefined;
        let currentPlaceholderOverride = this.tablePlaceholder;
        // let schemaPlaceHolder = this.genPlaceholderName('schema');

        const filteredPastEntries: HistoryEntry[] = this.filterPastEntries(pastEntries, newEntry);

        for (const entry of filteredPastEntries) {
            if (entry.type === 'external-manipulating') {
                // Only manipulating actions have to be repeated before last entry that is of interest, others do not influence that end result
                const sdsStringObj = this.sdsStringForHistoryEntry(entry, currentPlaceholderOverride);
                sdsLines += sdsStringObj.sdsString;
                currentPlaceholderOverride = sdsStringObj.placeholderName;
                safeDsLogger.debug(`Running old entry ${entry.id} with action ${entry.action}`);
            }
        }

        if (newEntry.type === 'external-visualizing') {
            if (newEntry.action === 'infoPanel') throw new Error('Not implemented');

            let overriddenTablePlaceholder;
            if (hiddenColumns && hiddenColumns.length > 0) {
                overriddenTablePlaceholder = this.genPlaceholderName('hiddenColsOverride');
                sdsLines += this.sdsStringForRemoveColumns(
                    hiddenColumns,
                    currentPlaceholderOverride,
                    overriddenTablePlaceholder,
                );
            }

            const sdsStringObj = this.sdsStringForHistoryEntry(
                newEntry,
                overriddenTablePlaceholder ?? currentPlaceholderOverride,
            );
            sdsLines += sdsStringObj.sdsString;
            placeholderNameNeeded = sdsStringObj.placeholderName;

            safeDsLogger.debug(`Running new entry ${newEntry.id} with action ${newEntry.action}`);
        } else if (newEntry.type === 'external-manipulating') {
            const sdsStringObj = this.sdsStringForHistoryEntry(newEntry, currentPlaceholderOverride);
            sdsLines += sdsStringObj.sdsString;
            placeholderNameNeeded = sdsStringObj.placeholderName;

            safeDsLogger.debug(`Running new entry ${newEntry.id} with action ${newEntry.action}`);
        } else if (newEntry.type === 'internal') {
            throw new Error('Cannot execute internal history entry in Runner');
        }

        const pipelineExecutionId = crypto.randomUUID();
        try {
            await this.addToAndExecutePipeline(
                pipelineExecutionId,
                sdsLines,
                placeholderNameNeeded ? [placeholderNameNeeded] : undefined,
            );
        } catch (e) {
            throw e;
        }

        if (newEntry.type === 'external-visualizing' && newEntry.action !== 'infoPanel' && placeholderNameNeeded) {
            const result = await this.getPlaceholderValue(placeholderNameNeeded, pipelineExecutionId);
            const image = result as Base64Image;

            if (newEntry.columnNumber === 'none') {
                return {
                    type: 'tab',
                    historyId: newEntry.id,
                    content: {
                        tabComment: '',
                        type: newEntry.action,
                        columnNumber: newEntry.columnNumber,
                        imageTab: true,
                        isInGeneration: false,
                        id: newEntry.existingTabId ?? newEntry.newTabId,
                        content: { encodedImage: image },
                        outdated: false,
                    },
                };
            } else if (newEntry.columnNumber === 'two') {
                return {
                    type: 'tab',
                    historyId: newEntry.id,
                    content: {
                        tabComment: newEntry.xAxisColumnName + ' x ' + newEntry.yAxisColumnName,
                        type: newEntry.action,
                        columnNumber: newEntry.columnNumber,
                        imageTab: true,
                        isInGeneration: false,
                        id: newEntry.existingTabId ?? newEntry.newTabId,
                        outdated: false,
                        content: {
                            encodedImage: image,
                            xAxisColumnName: newEntry.xAxisColumnName,
                            yAxisColumnName: newEntry.yAxisColumnName,
                        },
                    },
                };
            } else {
                return {
                    type: 'tab',
                    historyId: newEntry.id,
                    content: {
                        tabComment: newEntry.columnName,
                        type: newEntry.action,
                        columnNumber: newEntry.columnNumber,
                        imageTab: true,
                        isInGeneration: false,
                        id: newEntry.existingTabId ?? newEntry.newTabId,
                        content: { encodedImage: image, columnName: newEntry.columnName },
                        outdated: false,
                    },
                };
            }
        } else if (placeholderNameNeeded) {
            const newTable = await this.getPlaceholderValue(placeholderNameNeeded, pipelineExecutionId);
            // const schema = await this.getPlaceholderValue(schemaPlaceHolder, pipelineExecutionId); // Not displayable yet, waiting

            if (!newTable) throw new Error('Table not found');

            return {
                type: 'table',
                historyId: newEntry.id,
                content: this.runnerResultToTable(
                    this.tablePlaceholder,
                    newTable,
                    new Map<string, boolean>(
                        Object.keys(newTable).map((col) => [col, typeof newTable[col][0] === 'number']),
                    ), // temp until schema works as otherwise we would need another execution to get column names
                ),
            };
        } else {
            throw new Error('placeholderNameNeeded not found');
        }
    }

    public async executeMultipleHistoryAndReturnNewResults(
        entries: ExecuteRunnerAllEntry[],
        placeholderOverride = this.tablePlaceholder,
        sdsLinesOverride = '',
    ): Promise<MultipleRunnerExecutionResultMessage['value']['results']> {
        let sdsLines = sdsLinesOverride;
        let placeholderNames: string[] = [];
        let entryIdToPlaceholderNames = new Map<number, string>();
        let currentPlaceholderOverride = placeholderOverride;
        // let schemaPlaceHolder = this.genPlaceholderName('schema');

        const filteredEntries: ExecuteRunnerAllEntry[] = this.filterPastEntriesForAllExecution(entries);

        const results: RunnerExecutionResultMessage['value'][] = [];
        let lastManipulatingEntry: ExecuteRunnerAllEntry | undefined;
        for (const entry of filteredEntries) {
            if (entry.entry.type === 'external-visualizing') {
                if (entry.entry.action === 'infoPanel') throw new Error('Not implemented');

                let overriddenTablePlaceholder;
                if (entry.type === 'excludingHiddenColumns' && entry.hiddenColumns.length > 0) {
                    overriddenTablePlaceholder = this.genPlaceholderName('hiddenColsOverride');
                    sdsLines += this.sdsStringForRemoveColumns(
                        entry.hiddenColumns,
                        currentPlaceholderOverride,
                        overriddenTablePlaceholder,
                    );
                }

                const sdsStringObj = this.sdsStringForHistoryEntry(
                    entry.entry,
                    overriddenTablePlaceholder ?? currentPlaceholderOverride,
                );
                sdsLines += sdsStringObj.sdsString;
                placeholderNames.push(sdsStringObj.placeholderName);
                entryIdToPlaceholderNames.set(entry.entry.id, sdsStringObj.placeholderName);

                safeDsLogger.debug(`Running new entry ${entry.entry.id} with action ${entry.entry.action}`);
            } else if (entry.entry.type === 'external-manipulating') {
                const sdsStringObj = this.sdsStringForHistoryEntry(entry.entry, currentPlaceholderOverride);
                sdsLines += sdsStringObj.sdsString;
                placeholderNames.push(sdsStringObj.placeholderName);
                entryIdToPlaceholderNames.set(entry.entry.id, sdsStringObj.placeholderName);
                currentPlaceholderOverride = sdsStringObj.placeholderName;
                lastManipulatingEntry = entry;

                safeDsLogger.debug(`Running new entry ${entry.entry.id} with action ${entry.entry.action}`);
            }
        }

        const pipelineExecutionId = crypto.randomUUID();
        try {
            await this.addToAndExecutePipeline(pipelineExecutionId, sdsLines, placeholderNames);
        } catch (e) {
            throw e;
        }

        for (const entry of filteredEntries) {
            if (entry.entry.type === 'external-visualizing' && entry.entry.action !== 'infoPanel') {
                const result = await this.getPlaceholderValue(
                    entryIdToPlaceholderNames.get(entry.entry.id)!,
                    pipelineExecutionId,
                );
                const image = result as Base64Image;

                if (entry.entry.columnNumber === 'none') {
                    results.push({
                        type: 'tab',
                        historyId: entry.entry.id,
                        content: {
                            tabComment: '',
                            type: entry.entry.action,
                            columnNumber: entry.entry.columnNumber,
                            imageTab: true,
                            isInGeneration: false,
                            id: entry.entry.existingTabId ?? entry.entry.newTabId,
                            content: { encodedImage: image },
                            outdated: false,
                        },
                    });
                } else if (entry.entry.columnNumber === 'two') {
                    results.push({
                        type: 'tab',
                        historyId: entry.entry.id,
                        content: {
                            tabComment: entry.entry.xAxisColumnName + ' x ' + entry.entry.yAxisColumnName,
                            type: entry.entry.action,
                            columnNumber: entry.entry.columnNumber,
                            imageTab: true,
                            isInGeneration: false,
                            id: entry.entry.existingTabId ?? entry.entry.newTabId,
                            outdated: false,
                            content: {
                                encodedImage: image,
                                xAxisColumnName: entry.entry.xAxisColumnName,
                                yAxisColumnName: entry.entry.yAxisColumnName,
                            },
                        },
                    });
                } else {
                    results.push({
                        type: 'tab',
                        historyId: entry.entry.id,
                        content: {
                            tabComment: entry.entry.columnName,
                            type: entry.entry.action,
                            columnNumber: entry.entry.columnNumber,
                            imageTab: true,
                            isInGeneration: false,
                            id: entry.entry.existingTabId ?? entry.entry.newTabId,
                            content: { encodedImage: image, columnName: entry.entry.columnName },
                            outdated: false,
                        },
                    });
                }
            } else if (entry.entry.type === 'external-manipulating') {
                if (lastManipulatingEntry?.entry.id !== entry.entry.id) continue; // Only last manipulating entry is of interest as we just need final table

                const newTable = await this.getPlaceholderValue(
                    entryIdToPlaceholderNames.get(entry.entry.id)!,
                    pipelineExecutionId,
                );

                if (!newTable) throw new Error('Table not found');

                results.push({
                    type: 'table',
                    historyId: entry.entry.id,
                    content: this.runnerResultToTable(
                        this.tablePlaceholder,
                        newTable,
                        new Map<string, boolean>(
                            Object.keys(newTable).map((col) => [col, typeof newTable[col][0] === 'number']),
                        ), // temp until schema works as otherwise we would need another execution to get column names
                    ),
                });
            }
        }

        return results;
    }

    public async executeFutureHistoryAndReturnNewResults(
        pastEntries: HistoryEntry[],
        futureEntries: ExecuteRunnerAllEntry[],
    ): Promise<MultipleRunnerExecutionResultMessage['value']['results']> {
        let sdsLines = '';
        let currentPlaceholderOverride = this.tablePlaceholder;
        // let schemaPlaceHolder = this.genPlaceholderName('schema');

        const { pastEntries: filteredPastEntries, futureEntries: filteredFutureEntries } =
            this.filterPastEntriesForMultipleExecution(pastEntries, futureEntries);

        for (const entry of filteredPastEntries) {
            if (entry.type === 'external-manipulating') {
                // Only manipulating actions have to be repeated before last entry that is of interest, others do not influence that end result
                const sdsStringObj = this.sdsStringForHistoryEntry(entry, currentPlaceholderOverride);
                sdsLines += sdsStringObj.sdsString;
                currentPlaceholderOverride = sdsStringObj.placeholderName;
                safeDsLogger.debug(`Running old entry ${entry.id} with action ${entry.action}`);
            }
        }

        const results = await this.executeMultipleHistoryAndReturnNewResults(
            filteredFutureEntries,
            currentPlaceholderOverride,
            sdsLines,
        );

        return results;
    }

    filterPastEntries(pastEntries: HistoryEntry[], newEntry?: HistoryEntry): HistoryEntry[] {
        // Keep only the last occurrence of each unique overrideId
        const lastOccurrenceMap = new Map<string, number>();
        const filteredPastEntries: HistoryEntry[] = [];

        // New entry's overrideId is never appended to filteredPastEntries but accounted for in lastOccurrenceMap to have it override other past entries
        if (newEntry) lastOccurrenceMap.set(newEntry.overrideId, pastEntries.length);

        // Traverse from end to start to record the last occurrence of each unique overrideId
        for (let i = pastEntries.length - 1; i >= 0; i--) {
            const entry = pastEntries[i]!;
            const overrideId = entry.overrideId;

            if (!lastOccurrenceMap.has(overrideId)) {
                lastOccurrenceMap.set(overrideId, i);
            }
        }

        // Traverse from start to end to build the final result with only the last occurrences
        for (let i = 0; i < pastEntries.length; i++) {
            const entry = pastEntries[i]!;
            const overrideId = entry.overrideId;

            if (lastOccurrenceMap.get(overrideId) === i) {
                filteredPastEntries.push(entry);
            }
        }

        return filteredPastEntries;
    }

    filterPastEntriesForAllExecution(entries: ExecuteRunnerAllEntry[]): ExecuteRunnerAllEntry[] {
        // Keep only the last occurrence of each unique overrideId
        const lastOccurrenceMap = new Map<string, number>();
        const filteredPastEntries: ExecuteRunnerAllEntry[] = [];

        // Traverse from end to start to record the last occurrence of each unique overrideId
        for (let i = entries.length - 1; i >= 0; i--) {
            const entry = entries[i]!;
            const overrideId = entry.entry.overrideId;

            if (!lastOccurrenceMap.has(overrideId)) {
                lastOccurrenceMap.set(overrideId, i);
            }
        }

        // Traverse from start to end to build the final result with only the last occurrences
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i]!;
            const overrideId = entry.entry.overrideId;

            if (lastOccurrenceMap.get(overrideId) === i) {
                filteredPastEntries.push(entry);
            }
        }

        return filteredPastEntries;
    }

    filterPastEntriesForMultipleExecution(
        pastEntries: HistoryEntry[],
        futureEntries: ExecuteRunnerAllEntry[],
    ): { pastEntries: HistoryEntry[]; futureEntries: ExecuteRunnerAllEntry[] } {
        // Keep only the last occurrence of each unique overrideId
        const lastOccurrenceMap = new Map<string, number>();
        const filteredPastEntries: HistoryEntry[] = [];
        const filteredFutureEntries: ExecuteRunnerAllEntry[] = [];

        // Traverse from end to start to record the last occurrence of each unique overrideId
        for (let i = pastEntries.length + futureEntries.length - 1; i >= 0; i--) {
            if (i >= pastEntries.length) {
                const entry = futureEntries[i - pastEntries.length]!;
                const overrideId = entry.entry.overrideId;

                if (!lastOccurrenceMap.has(overrideId)) {
                    lastOccurrenceMap.set(overrideId, i);
                }
            } else {
                const entry = pastEntries[i]!;
                const overrideId = entry.overrideId;

                if (!lastOccurrenceMap.has(overrideId)) {
                    lastOccurrenceMap.set(overrideId, i);
                }
            }
        }

        // Traverse from start to end to build the final result with only the last occurrences
        for (let i = 0; i < pastEntries.length; i++) {
            const entry = pastEntries[i]!;
            const overrideId = entry.overrideId;

            if (lastOccurrenceMap.get(overrideId) === i) {
                filteredPastEntries.push(entry);
            }
        }

        for (let i = 0; i < futureEntries.length; i++) {
            const entry = futureEntries[i]!;
            const overrideId = entry.entry.overrideId;

            if (lastOccurrenceMap.get(overrideId) === i + pastEntries.length) {
                filteredFutureEntries.push(entry);
            }
        }

        return { pastEntries: filteredPastEntries, futureEntries: filteredFutureEntries };
    }

    //#endregion
    //#endregion // Public API
}

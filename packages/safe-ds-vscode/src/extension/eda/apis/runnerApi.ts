import {
    Base64Image,
    Column,
    ExternalHistoryEntry,
    HistoryEntry,
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
import { RunnerExecutionResultMessage } from '@safe-ds/eda/types/messaging.ts';

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

    //#region SDS code generation
    private sdsStringForHistoryEntry(
        historyEntry: ExternalHistoryEntry,
        overrideTablePlaceholder?: string,
    ): {
        sdsString: string;
        placeholderNames: string[];
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
                    placeholderNames: [newPlaceholderName],
                };
            case 'boxPlot':
                return {
                    sdsString: this.sdsStringForBoxplotByColumnName(
                        historyEntry.columnName,
                        overrideTablePlaceholder ?? this.tablePlaceholder,
                        newPlaceholderName,
                    ),
                    placeholderNames: [newPlaceholderName],
                };
            case 'linePlot':
                return {
                    sdsString: this.sdsStringForLinePlotByColumnNames(
                        historyEntry.xAxisColumnName,
                        historyEntry.yAxisColumnName,
                        overrideTablePlaceholder ?? this.tablePlaceholder,
                        newPlaceholderName,
                    ),
                    placeholderNames: [newPlaceholderName],
                };
            case 'scatterPlot':
                return {
                    sdsString: this.sdsStringForScatterPlotByColumnNames(
                        historyEntry.xAxisColumnName,
                        historyEntry.yAxisColumnName,
                        overrideTablePlaceholder ?? this.tablePlaceholder,
                        newPlaceholderName,
                    ),
                    placeholderNames: [newPlaceholderName],
                };
            case 'heatmap':
                return {
                    sdsString: this.sdsStringForCorrelationHeatmap(
                        overrideTablePlaceholder ?? this.tablePlaceholder,
                        newPlaceholderName,
                    ),
                    placeholderNames: [newPlaceholderName],
                };
            default:
                throw new Error('Unknown history entry action: ' + historyEntry.action);
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

    private sdsStringForRemoveColumns(columnNames: string[], tablePlaceholder: string, newPlaceholderName: string) {
        return (
            'val ' +
            newPlaceholderName +
            ' = ' +
            tablePlaceholder +
            '.removeColumns(["' +
            columnNames.join('","') +
            '"]); \n'
        );
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
    public async getTableByPlaceholder(tableName: string, pipelineExecutionId: string): Promise<Table | undefined> {
        safeDsLogger.debug('Getting table by placeholder: ' + tableName);

        const pythonTableColumns = await this.getPlaceholderValue(tableName, pipelineExecutionId);
        if (pythonTableColumns) {
            // Get Column Types
            safeDsLogger.debug('Getting column types for table: ' + tableName);
            let sdsLines = '';
            let placeholderNames: string[] = [];
            let columnNameToPlaceholderIsNumericNameMap = new Map<string, string>();
            for (const columnName of Object.keys(pythonTableColumns)) {
                const newPlaceholderName = this.genPlaceholderName(columnName + '_type');
                columnNameToPlaceholderIsNumericNameMap.set(columnName, newPlaceholderName);
                placeholderNames.push(newPlaceholderName);
                sdsLines += this.sdsStringForIsNumeric(tableName, columnName, newPlaceholderName);
            }

            await this.addToAndExecutePipeline(pipelineExecutionId, sdsLines, placeholderNames);
            const columnIsNumeric = new Map<string, string>();
            for (const [columnName, placeholderName] of columnNameToPlaceholderIsNumericNameMap) {
                const columnType = await this.getPlaceholderValue(placeholderName, pipelineExecutionId);
                columnIsNumeric.set(columnName, columnType as string);
            }

            const table: Table = {
                totalRows: 0,
                name: tableName,
                columns: [] as Table['columns'],
                appliedFilters: [] as Table['appliedFilters'],
            };

            let currentMax = 0;
            for (const [columnName, columnValues] of Object.entries(pythonTableColumns)) {
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
        } else {
            return undefined;
        }
    }
    //#endregion

    //#region Profiling
    public async getProfiling(table: Table): Promise<{ columnName: string; profiling: Profiling }[]> {
        safeDsLogger.debug('Getting profiling for table: ' + table.name);

        const columns = table.columns;

        let sdsStrings = '';

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
    //#endregion

    //#region History
    public async executeHistoryAndReturnNewResult(
        pastEntries: HistoryEntry[],
        newEntry: HistoryEntry,
        hiddenColumns?: string[],
    ): Promise<RunnerExecutionResultMessage['value']> {
        let sdsLines = '';
        let placeholderNames: string[] = [];
        for (const entry of pastEntries) {
            if (entry.type === 'external-manipulating') {
                // Only manipulating actions have to be repeated before last entry that is of interest, others do not influence that end result
                const sdsString = this.sdsStringForHistoryEntry(entry).sdsString;
                if (sdsString) {
                    sdsLines += sdsString + '\n';
                }
                safeDsLogger.debug(`Running old entry ${entry.id} with action ${entry.action}`);
            }
        }

        if (newEntry.type === 'external-visualizing') {
            if (newEntry.action === 'infoPanel' || newEntry.action === 'refreshTab') throw new Error('Not implemented');

            let overriddenTablePlaceholder;
            if (hiddenColumns && hiddenColumns.length > 0) {
                overriddenTablePlaceholder = this.genPlaceholderName('hiddenColsOverride');
                sdsLines += this.sdsStringForRemoveColumns(
                    hiddenColumns,
                    this.tablePlaceholder,
                    overriddenTablePlaceholder,
                );
            }

            const sdsStringObj = this.sdsStringForHistoryEntry(newEntry, overriddenTablePlaceholder);
            sdsLines += sdsStringObj.sdsString;
            placeholderNames = sdsStringObj.placeholderNames;

            safeDsLogger.debug(`Running new entry ${newEntry.id} with action ${newEntry.action}`);
        } else if (newEntry.type === 'external-manipulating') {
            throw new Error('Not implemented');
        } else if (newEntry.type === 'internal') {
            throw new Error('Cannot execute internal history entry in Runner');
        }

        const pipelineExecutionId = crypto.randomUUID();
        try {
            await this.addToAndExecutePipeline(pipelineExecutionId, sdsLines, placeholderNames);
        } catch (e) {
            throw e;
        }

        if (
            newEntry.type === 'external-visualizing' &&
            newEntry.action !== 'infoPanel' &&
            placeholderNames.length > 0
        ) {
            const result = await this.getPlaceholderValue(placeholderNames[0]!, pipelineExecutionId);
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
                        id: newEntry.existingTabId,
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
                        id: newEntry.existingTabId,
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
                        id: newEntry.existingTabId,
                        content: { encodedImage: image, columnName: newEntry.columnName },
                        outdated: false,
                    },
                };
            }
        } else {
            throw new Error('Not implemented');
        }
    }
    //#endregion
    //#endregion // Public API
}

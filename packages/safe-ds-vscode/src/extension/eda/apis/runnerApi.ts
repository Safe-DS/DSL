import {
    Base64Image,
    Column,
    ExternalHistoryEntry,
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
    private sdsStringForHistoryEntry(historyEntry: ExternalHistoryEntry): string | undefined {
        const newPlaceholderName = this.genPlaceholderName();
        switch (historyEntry.action) {
            case 'histogram':
                return this.sdsStringForHistogramByColumnName(
                    historyEntry.columnName,
                    this.tablePlaceholder,
                    newPlaceholderName,
                );
            default:
                return undefined;
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
            '").plotHistogram(); \n'
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
                resolve(message.data.value);
            };

            this.services.runtime.PythonServer.addMessageCallback('placeholder_value', placeholderValueCallback);

            safeDsLogger.info('Requesting placeholder: ' + placeholder);
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
        safeDsLogger.info('Getting table by placeholder: ' + tableName);
        const pythonTableColumns = await this.getPlaceholderValue(tableName, pipelineExecutionId);
        if (pythonTableColumns) {
            const table: Table = {
                totalRows: 0,
                name: tableName,
                columns: [] as Table['columns'],
                appliedFilters: [] as Table['appliedFilters'],
            };

            let i = 0;
            let currentMax = 0;
            for (const [columnName, columnValues] of Object.entries(pythonTableColumns)) {
                if (!Array.isArray(columnValues)) {
                    continue;
                }
                if (currentMax < columnValues.length) {
                    currentMax = columnValues.length;
                }

                const isNumerical = typeof columnValues[0] === 'number';
                const columnType = isNumerical ? 'numerical' : 'categorical';

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
                table.columns.push([i++, column]);
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
        safeDsLogger.info('Getting profiling for table: ' + table.name);

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
            const newMvPlaceholderName = this.genPlaceholderName(column[1].name + '_mv');
            placeholderNames.push(newMvPlaceholderName);
            columnNameToPlaceholderMVNameMap.set(column[1].name, newMvPlaceholderName);
            sdsStrings += this.sdsStringForMissingValueRatioByColumnName(
                column[1].name,
                table.name,
                newMvPlaceholderName,
            );

            // Find unique values
            // TODO reevaluate when image stuck problem fixed
            let uniqueValues = new Set<any>();
            for (let j = 0; j < column[1].values.length; j++) {
                uniqueValues.add(column[1].values[j]);
            }
            uniqueValuesMap.set(column[1].name, uniqueValues);

            // Different histogram conditions for numerical and categorical columns
            if (column[1].type !== 'numerical') {
                if (uniqueValues.size <= 3 || uniqueValues.size > 10) {
                    // Must match conidtions below that choose to display histogram for categorical columns
                    continue; // This historam only generated if between 4-10 categorigal uniques or numerical type
                }
            } else {
                if (uniqueValues.size > column[1].values.length * 0.9) {
                    // Must match conidtions below that choose to display histogram for numerical columns
                    // If 90% of values are unique, it's not a good idea to display histogram
                    continue;
                }
            }

            // Histogram for numerical columns or categorical columns with 4-10 unique values
            const newHistogramPlaceholderName = this.genPlaceholderName(column[1].name + '_hist');
            placeholderNames.push(newHistogramPlaceholderName);
            columnNameToPlaceholderHistogramNameMap.set(column[1].name, newHistogramPlaceholderName);
            sdsStrings += this.sdsStringForHistogramByColumnName(
                column[1].name,
                table.name,
                newHistogramPlaceholderName,
            );
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
                missingValueRatioMap.get(columnNameToPlaceholderMVNameMap.get(column[1].name)!)! * 100;

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

            const uniqueValues = uniqueValuesMap.get(column[1].name)!.size;
            // If not numerical, add proper profilings according to idness results
            if (column[1].type !== 'numerical') {
                if (uniqueValues <= 3) {
                    // Can display each separate percentages of unique values
                    // Find all unique values and count them
                    const uniqueValueCounts = new Map<string, number>();
                    for (let i = 0; i < column[1].values.length; i++) {
                        if (column[1].values[i] !== undefined && column[1].values[i] !== null)
                            uniqueValueCounts.set(
                                column[1].values[i],
                                (uniqueValueCounts.get(column[1].values[i]) || 0) + 1,
                            );
                    }

                    let uniqueProfilings: ProfilingDetailStatistical[] = [];
                    for (const [key, value] of uniqueValueCounts) {
                        uniqueProfilings.push({
                            type: 'numerical',
                            name: key,
                            value: ((value / column[1].values.length) * 100).toFixed(2) + '%',
                            interpretation: 'category',
                        });
                    }

                    profiling.push({
                        columnName: column[1].name,
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
                    const histogram = histogramMap.get(columnNameToPlaceholderHistogramNameMap.get(column[1].name)!)!;

                    profiling.push({
                        columnName: column[1].name,
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
                        columnName: column[1].name,
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
                                            column[1].values.length *
                                                (1 -
                                                    (missingValueRatioMap.get(
                                                        columnNameToPlaceholderMVNameMap.get(column[1].name)!,
                                                    ) || 0)),
                                        ) + ' Total Valids',
                                    interpretation: 'default',
                                },
                            ],
                        },
                    });
                }
            } else {
                if (uniqueValues > column[1].values.length * 0.9) {
                    profiling.push({
                        columnName: column[1].name,
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
                                            column[1].values.length *
                                                (1 -
                                                    (missingValueRatioMap.get(
                                                        columnNameToPlaceholderMVNameMap.get(column[1].name)!,
                                                    ) || 0)),
                                        ) + ' Total Valids',
                                    interpretation: 'default',
                                },
                            ],
                        },
                    });
                } else {
                    const histogram = histogramMap.get(columnNameToPlaceholderHistogramNameMap.get(column[1].name)!)!;

                    profiling.push({
                        columnName: column[1].name,
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
    // public async executeHistoryAndReturnLastResult(history: ExternalHistoryEntry[]): Promise<Table | Tab> {
    //     const toReturnEntry = history.pop();

    //     let toReturnToStateLines = '';
    //     for (const entry of history) {
    //         const sdsString = this.sdsStringForHistoryEntry(entry);
    //         if (sdsString) {
    //             toReturnToStateLines += sdsString + '\n';
    //         }
    //     }
    // }
    //#endregion
    //#endregion // Public API
}

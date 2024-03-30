import { Base64Image, Column, Profiling, ProfilingDetailStatistical, Table } from '@safe-ds/eda/types/state.js';
import { SafeDsServices, messages } from '@safe-ds/lang';
import { LangiumDocument, AstNode } from 'langium';
import { printOutputMessage } from '../../output.ts';
import * as vscode from 'vscode';
import crypto from 'crypto';
import { getPipelineDocument } from '../../mainClient.ts';
import { CODEGEN_PREFIX } from '../../../../../safe-ds-lang/src/language/generation/safe-ds-python-generator.ts';

export class RunnerApi {
    services: SafeDsServices;
    pipelinePath: vscode.Uri;
    pipelineName: string;
    baseDocument: LangiumDocument<AstNode> | undefined;
    placeholderCounter = 0;

    constructor(services: SafeDsServices, pipelinePath: vscode.Uri, pipelineName: string) {
        this.services = services;
        this.pipelinePath = pipelinePath;
        this.pipelineName = pipelineName;
        getPipelineDocument(this.pipelinePath).then((doc) => {
            // Get here to avoid issues because of chanigng file
            this.baseDocument = doc;
        });
    }

    private async addToAndExecutePipeline(pipelineExecutionId: string, addedLines: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (!this.baseDocument) {
                reject('Document not found');
                return;
            }

            const documentText = this.baseDocument.textDocument.getText();

            // Find pattern "pipeline <pipelineName> {" and add the SDS code before the closing bracket of it
            const pipelineStart = documentText.indexOf('pipeline ' + this.pipelineName);
            if (pipelineStart === -1) {
                reject('Pipeline not found');
                return;
            }
            const nextCurlyBraceEnd = documentText.indexOf('}', pipelineStart);
            if (nextCurlyBraceEnd === -1) {
                reject('Internal error: Pipeline end not found');
                return;
            }

            const beforeClosingBrace = documentText.substring(0, nextCurlyBraceEnd);
            const afterClosingBrace = documentText.substring(nextCurlyBraceEnd);
            const newDocumentText = beforeClosingBrace + addedLines + afterClosingBrace;

            const newDoc = this.services.shared.workspace.LangiumDocumentFactory.fromString(
                newDocumentText,
                this.pipelinePath,
            );
            await this.services.runtime.Runner.executePipeline(pipelineExecutionId, newDoc, this.pipelineName);

            const runtimeCallback = (message: messages.RuntimeProgressMessage) => {
                if (message.id !== pipelineExecutionId) {
                    return;
                }
                if (message.data === 'done') {
                    this.services.runtime.Runner.removeMessageCallback(runtimeCallback, 'runtime_progress');
                    resolve();
                }
            };
            this.services.runtime.Runner.addMessageCallback(runtimeCallback, 'runtime_progress');

            setTimeout(() => {
                reject('Pipeline execution timed out');
            }, 30000);
        });
    }

    // --- SDS code generation ---

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
            '.get_column("' +
            columnName +
            '").missing_value_ratio(); \n'
        );
    }

    private sdsStringForColumnNames(tableIdentifier: string, newPlaceholderName: string): string {
        return 'val ' + newPlaceholderName + ' = ' + tableIdentifier + '.column_names; \n';
    }

    private sdsStringForIDnessByColumnName(columnName: string, tablePlaceholder: string, newPlaceholderName: string) {
        return (
            'val ' + newPlaceholderName + ' = ' + tablePlaceholder + '.get_column("' + columnName + '").idness(); \n'
        );
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
            '.get_column("' +
            columnName +
            '").plot_histogram(); \n'
        );
    }

    // --- Placeholder handling ---

    private genPlaceholderName(): string {
        return CODEGEN_PREFIX + this.placeholderCounter++;
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
                this.services.runtime.Runner.removeMessageCallback(placeholderValueCallback, 'placeholder_value');
                resolve(message.data.value);
            };

            this.services.runtime.Runner.addMessageCallback(placeholderValueCallback, 'placeholder_value');
            printOutputMessage('Getting placeholder from Runner ...');
            this.services.runtime.Runner.sendMessageToPythonServer(
                messages.createPlaceholderQueryMessage(pipelineExecutionId, placeholder),
            );

            setTimeout(() => {
                resolve(undefined);
            }, 30000);
        });
    }

    // --- Public API ---

    public async getTableByPlaceholder(tableName: string, pipelineExecutionId: string): Promise<Table | undefined> {
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
                    profiling: { top: [], bottom: [] },
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

    public async getProfiling(table: Table): Promise<{ columnName: string; profiling: Profiling }[]> {
        const columns = table.columns;

        let sdsStrings = '';

        const columnNameToPlaceholderMVNameMap = new Map<string, string>(); // Mapping random placeholder name for missing value ratio back to column name
        const missingValueRatioMap = new Map<string, number>(); // Saved by random placeholder name

        const columnNameToPlaceholderIDnessNameMap = new Map<string, string>(); // Mapping random placeholder name for IDness back to column name
        const idnessMap = new Map<string, number>(); // Saved by random placeholder name

        const columnNameToPlaceholderHistogramNameMap = new Map<string, string>(); // Mapping random placeholder name for histogram back to column name
        const histogramMap = new Map<string, Base64Image | undefined>(); // Saved by random placeholder name

        // Generate SDS code to get missing value ratio for each column
        for (let i = 0; i < columns.length; i++) {
            const newMvPlaceholderName = this.genPlaceholderName();
            columnNameToPlaceholderMVNameMap.set(columns[i]![1].name, newMvPlaceholderName);
            sdsStrings += this.sdsStringForMissingValueRatioByColumnName(
                columns[i]![1].name,
                table.name,
                newMvPlaceholderName,
            );

            // Only need to check IDness for non-numerical columns
            if (columns[i]![1].type !== 'numerical') {
                const newIDnessPlaceholderName = this.genPlaceholderName();
                columnNameToPlaceholderIDnessNameMap.set(columns[i]![1].name, newIDnessPlaceholderName);
                sdsStrings += this.sdsStringForIDnessByColumnName(
                    columns[i]![1].name,
                    table.name,
                    newIDnessPlaceholderName,
                );

                // Find unique values
                let uniqueValues = new Set();
                for (let j = 0; j < columns[i]![1].values.length; j++) {
                    uniqueValues.add(columns[i]![1].values[j]);
                }
                if (uniqueValues.size <= 3 || uniqueValues.size > 10) {
                    // Must match conidtions below that choose to display histogram
                    continue; // This historam only generated if between 4-10 categorigal uniques or numerical type
                }
            }

            // Histogram for numerical columns or categorical columns with 4-10 unique values
            const newHistogramPlaceholderName = this.genPlaceholderName();
            columnNameToPlaceholderHistogramNameMap.set(columns[i]![1].name, newHistogramPlaceholderName);
            sdsStrings += this.sdsStringForHistogramByColumnName(
                columns[i]![1].name,
                table.name,
                newHistogramPlaceholderName,
            );
        }

        // Execute with generated SDS code
        const pipelineExecutionId = crypto.randomUUID();
        await this.addToAndExecutePipeline(pipelineExecutionId, sdsStrings);

        // Get missing value ratio for each column
        for (const [, placeholderName] of columnNameToPlaceholderMVNameMap) {
            const missingValueRatio = await this.getPlaceholderValue(placeholderName, pipelineExecutionId);
            if (missingValueRatio) {
                missingValueRatioMap.set(placeholderName, missingValueRatio as number);
            }
        }

        // Get IDness for each column
        for (const [, placeholderName] of columnNameToPlaceholderIDnessNameMap) {
            const idness = await this.getPlaceholderValue(placeholderName, pipelineExecutionId);
            if (idness) {
                idnessMap.set(placeholderName, idness as number);
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

            // If not numerical, add proper profilings according to idness results
            if (column[1].type !== 'numerical') {
                const idness = idnessMap.get(columnNameToPlaceholderIDnessNameMap.get(column[1].name)!)!;
                const uniqueValues = idness * column[1].values.length;

                if (uniqueValues <= 3) {
                    // Can display each separate percentages of unique values
                    // Find all unique values and count them
                    const uniqueValueCounts = new Map<string, number>();
                    for (let i = 0; i < column[1].values.length; i++) {
                        if (column[1].values[i])
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
                            top: [validRatio, missingRatio],
                            bottom: [
                                { type: 'text', value: 'Categorical', interpretation: 'bold' },
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
                            top: [validRatio, missingRatio],
                            bottom: [
                                { type: 'text', value: 'Categorical', interpretation: 'bold' },
                                { type: 'image', value: histogram, interpretation: 'default' },
                            ],
                        },
                    });
                } else {
                    // Display only the number of unique values vs total valid values
                    profiling.push({
                        columnName: column[1].name,
                        profiling: {
                            top: [validRatio, missingRatio],
                            bottom: [
                                { type: 'text', value: 'Categorical', interpretation: 'bold' },
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
                // Display histogram for numerical columns
                const histogram = histogramMap.get(columnNameToPlaceholderHistogramNameMap.get(column[1].name)!)!;

                profiling.push({
                    columnName: column[1].name,
                    profiling: {
                        top: [validRatio, missingRatio],
                        bottom: [
                            { type: 'text', value: 'Numerical', interpretation: 'bold' },
                            { type: 'image', value: histogram, interpretation: 'default' },
                        ],
                    },
                });
            }
        }

        return profiling;
    }

    public async getColumnNames(tableIdentifier: string): Promise<string[]> {
        const newPlaceholderName = this.genPlaceholderName();
        const columnNamesSdsCode = this.sdsStringForColumnNames(tableIdentifier, newPlaceholderName);
        const pipelineExecutionId = crypto.randomUUID();
        await this.addToAndExecutePipeline(pipelineExecutionId, columnNamesSdsCode);
        const columnNames = await this.getPlaceholderValue(newPlaceholderName, pipelineExecutionId);
        return columnNames as string[];
    }
}

import { Column, Profiling, ProfilingDetailStatistical, State, Table } from '@safe-ds/eda/types/state.js';
import { SafeDsServices, messages } from '@safe-ds/lang';
import { printOutputMessage } from '../../output.ts';
import * as vscode from 'vscode';
import { getPipelineDocument } from '../../mainClient.ts';
import crypto from 'crypto';

export class RunnerApi {
    services: SafeDsServices;
    pipelinePath: vscode.Uri;

    constructor(services: SafeDsServices, pipelinePath: vscode.Uri) {
        this.services = services;
        this.pipelinePath = pipelinePath;
    }

    private async addToAndExecutePipeline(pipelineId: string, addedLines: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const baseDocument = await getPipelineDocument(this.pipelinePath);
            if (baseDocument) {
                const documentText = baseDocument.textDocument.getText();
                const lastBracket = documentText.lastIndexOf('}');

                const newText = documentText.slice(0, lastBracket) + addedLines + documentText.slice(lastBracket);
                const newDoc = this.services.shared.workspace.LangiumDocumentFactory.fromString(
                    newText,
                    this.pipelinePath,
                );
                await this.services.runtime.Runner.executePipeline(newDoc, pipelineId);

                const runtimeCallback = (message: messages.RuntimeProgressMessage) => {
                    if (message.id !== pipelineId) {
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
            } else {
                reject('Could not find pipeline document');
            }
        });
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
            '.get_column("' +
            columnName +
            '").missing_value_ratio(); \n'
        );
    }

    private sdsStringForColumnNames(tableIdentifier: string, newPlaceholderName: string): string {
        return 'val ' + newPlaceholderName + ' = ' + tableIdentifier + '.column_names; \n';
    }

    private sdsStringForColumns(tableIdentifier: string, newPlaceholderName: string): string {
        return 'val ' + newPlaceholderName + ' = ' + tableIdentifier + '.to_columns(); \n';
    }

    private sdsStringForIDnessByColumnName(columnName: string, tablePlaceholder: string, newPlaceholderName: string) {
        return (
            'val ' + newPlaceholderName + ' = ' + tablePlaceholder + '.get_column("' + columnName + '").idness(); \n'
        );
    }

    private randomPlaceholderName(): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const charactersLength = characters.length;
        const randomArray = new Uint8Array(20);
        crypto.getRandomValues(randomArray);
        let result = '';
        randomArray.forEach((value) => {
            result += characters.charAt(value % charactersLength);
        });
        return result;
    }

    private async getPlaceholderValue(placeholder: string, pipelineId: string): Promise<any | undefined> {
        return new Promise((resolve) => {
            if (placeholder === '') {
                resolve(undefined);
            }

            const placeholderValueCallback = (message: messages.PlaceholderValueMessage) => {
                if (message.id !== pipelineId || message.data.name !== placeholder) {
                    return;
                }
                this.services.runtime.Runner.removeMessageCallback(placeholderValueCallback, 'placeholder_value');
                resolve(message.data.value);
            };

            this.services.runtime.Runner.addMessageCallback(placeholderValueCallback, 'placeholder_value');
            printOutputMessage('Getting placeholder from Runner ...');
            this.services.runtime.Runner.sendMessageToPythonServer(
                messages.createPlaceholderQueryMessage(pipelineId, placeholder),
            );

            setTimeout(() => {
                resolve(undefined);
            }, 30000);
        });
    }

    // --- Public API ---

    public async getStateByPlaceholder(tableIdentifier: string, pipelineId: string): Promise<State | undefined> {
        const pythonTableColumns = await this.getPlaceholderValue(tableIdentifier, pipelineId);
        if (pythonTableColumns) {
            const table: Table = {
                totalRows: 0,
                name: tableIdentifier,
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

            return { tableIdentifier, history: [], defaultState: false, table };
        } else {
            return undefined;
        }
    }

    public async getProfiling(
        tableIdentifier: string,
        table: Table,
    ): Promise<{ columnName: string; profiling: Profiling }[]> {
        const columns = table.columns;

        let sdsStrings = '';

        const columnNameToPlaceholderMVNameMap = new Map<string, string>(); // Mapping random placeholder name for missing value ratio back to column name
        const missingValueRatioMap = new Map<string, string>(); // Saved by random placeholder name

        const columnNameToPlaceholderIDnessNameMap = new Map<string, string>(); // Mapping random placeholder name for IDness back to column name
        const idnessMap = new Map<string, number>(); // Saved by random placeholder name

        // Generate SDS code to get missing value ratio for each column
        for (let i = 0; i < columns.length; i++) {
            const newMvPlaceholderName = this.randomPlaceholderName();
            missingValueRatioMap.set(newMvPlaceholderName, 'null');
            columnNameToPlaceholderMVNameMap.set(columns[i]![1].name, newMvPlaceholderName);

            sdsStrings += this.sdsStringForMissingValueRatioByColumnName(
                columns[i]![1].name,
                tableIdentifier,
                newMvPlaceholderName,
            );

            // Only need to check IDness for non-numerical columns
            if (columns[i]![1].type !== 'numerical') {
                const newIDnessPlaceholderName = this.randomPlaceholderName();
                idnessMap.set(newIDnessPlaceholderName, 1);
                columnNameToPlaceholderIDnessNameMap.set(columns[i]![1].name, newIDnessPlaceholderName);
                sdsStrings += this.sdsStringForIDnessByColumnName(
                    columns[i]![1].name,
                    tableIdentifier,
                    newIDnessPlaceholderName,
                );
            }
        }

        // Execute with generated SDS code
        const pipelineId = crypto.randomUUID();
        await this.addToAndExecutePipeline(pipelineId, sdsStrings);

        // Get missing value ratio for each column
        for (const [placeholderName] of missingValueRatioMap) {
            const missingValueRatio = await this.getPlaceholderValue(placeholderName, pipelineId);
            if (missingValueRatio) {
                missingValueRatioMap.set(placeholderName, missingValueRatio as string);
            }
        }

        // Get IDness for each column
        for (const [placeholderName] of idnessMap) {
            const idness = await this.getPlaceholderValue(placeholderName, pipelineId);
            if (idness) {
                idnessMap.set(placeholderName, idness as number);
            }
        }

        // Create profiling data, interpret numerical values and color them
        const profiling: { columnName: string; profiling: Profiling }[] = [];
        for (const column of columns) {
            const missingValuesRatio =
                parseFloat(missingValueRatioMap.get(columnNameToPlaceholderMVNameMap.get(column[1].name)!)!) * 100;

            const validRatio: ProfilingDetailStatistical = {
                type: 'numerical',
                name: 'Valid',
                value: missingValuesRatio ? (100 - missingValuesRatio).toFixed(2) + '%' : '100%',
                color: 'var(--primary-color)',
            };

            const missingRatio: ProfilingDetailStatistical = {
                type: 'numerical',
                name: 'Missing',
                value: missingValuesRatio ? missingValuesRatio.toFixed(2) + '%' : '0%',
                color: missingValuesRatio > 0 ? 'var(--error-color)' : 'var(--font-light)',
            };

            // If not numerical, add proper profilings according to idness results
            if (column[1].type !== 'numerical') {
                const idness = idnessMap.get(columnNameToPlaceholderIDnessNameMap.get(column[1].name)!)!;
                const uniqueValues = idness * column[1].values.length;

                if (uniqueValues <= 3) {
                    // Can display each separate percentages of unique values
                    // Find all unique values
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
                            color: 'var(--font-light)',
                        });
                    }

                    profiling.push({
                        columnName: column[1].name,
                        profiling: {
                            top: [validRatio, missingRatio],
                            bottom: [
                                { type: 'name', name: 'Categorical', color: 'var(--font-dark)' },
                                ...uniqueProfilings,
                            ],
                        },
                    });
                } else {
                    // Display only the number of unique values
                    profiling.push({
                        columnName: column[1].name,
                        profiling: {
                            top: [validRatio, missingRatio],
                            bottom: [
                                {
                                    type: 'name',
                                    name: uniqueValues + ' Unique <br>Strings',
                                    color: 'var(--font-light)',
                                },
                            ],
                        },
                    });
                }
            } else {
                profiling.push({
                    columnName: column[1].name,
                    profiling: {
                        top: [validRatio, missingRatio],
                        bottom: [],
                    },
                });
            }
        }

        return profiling;
    }

    public async getColumnNames(tableIdentifier: string): Promise<string[]> {
        const newPlaceholderName = this.randomPlaceholderName();
        const columnNamesSdsCode = this.sdsStringForColumnNames(tableIdentifier, newPlaceholderName);
        const pipelineId = crypto.randomUUID();
        await this.addToAndExecutePipeline(pipelineId, columnNamesSdsCode);
        const columnNames = await this.getPlaceholderValue(newPlaceholderName, pipelineId);
        return columnNames as string[];
    }

    // Doesn't work as columns cannot be serialized yet by Runner
    // public async getColumns(tableIdentifier: string): Promise<{ columns: any; placeholderName: string }> {
    //     const newPlaceholderName = this.randomPlaceholderName();
    //     const columnsSdsCode = this.sdsStringForColumns(tableIdentifier, newPlaceholderName);
    //     const pipelineId = crypto.randomUUID();
    //     await this.addToAndExecutePipeline(pipelineId, columnsSdsCode);
    //     const columns = await this.getPlaceholderValue(newPlaceholderName, pipelineId);
    //     // eslint-disable-next-line no-console
    //     console.log(columns);
    //     return { columns, placeholderName: newPlaceholderName };
    // }
}

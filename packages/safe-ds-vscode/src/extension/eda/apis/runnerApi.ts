import { Column, State, Table } from '@safe-ds/eda/types/state.js';
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

    private sdsStringForMultMissingValueRatio(
        columnsPlaceholder: string,
        columnIndex: number,
        newPlaceholderName: string,
    ): string {
        return (
            'val ' + newPlaceholderName + ' = ' + columnsPlaceholder + '[' + columnIndex + '].missing_value_ratio(); \n'
        );
    }

    private sdsStringForColumnNames(tableIdentifier: string, newPlaceholderName: string): string {
        return 'val ' + newPlaceholderName + ' = ' + tableIdentifier + '.column_names; \n';
    }

    private sdsStringForColumns(tableIdentifier: string, newPlaceholderName: string): string {
        return 'val ' + newPlaceholderName + ' = ' + tableIdentifier + '.to_columns(); \n';
    }

    private randomPlaceholderName(): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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

                printOutputMessage('Got placeholder from Runner!');
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

    public async getProfiling(tableIdentifier: string): Promise<undefined> {
        const columnsInfo = await this.getColumns(tableIdentifier);
        // eslint-disable-next-line no-console
        console.log(columnsInfo.columns);
        const columns = columnsInfo.columns;
        let missingValueRatioSdsStrings = '';
        const placeholderNameToColumnNameMap = new Map<string, string>();
        const missingValueRatioMap = new Map<string, string>();

        for (let i = 0; i < columns.length; i++) {
            const newPlaceholderName = this.randomPlaceholderName();
            missingValueRatioMap.set(newPlaceholderName, 'null');
            placeholderNameToColumnNameMap.set(newPlaceholderName, columns[i]!);
            missingValueRatioSdsStrings += this.sdsStringForMultMissingValueRatio(
                columnsInfo.placeholderName,
                i,
                newPlaceholderName,
            );
        }

        printOutputMessage(missingValueRatioSdsStrings);

        const pipelineId = crypto.randomUUID();
        await this.addToAndExecutePipeline(pipelineId, missingValueRatioSdsStrings);

        for (const [placeholderName] of missingValueRatioMap) {
            const missingValueRatio = await this.getPlaceholderValue(placeholderName, pipelineId);
            if (missingValueRatio) {
                missingValueRatioMap.set(placeholderName, missingValueRatio as string);
            }
        }

        missingValueRatioMap.forEach((value, key) => {
            printOutputMessage(placeholderNameToColumnNameMap.get(key) + ': ' + value);
        });
    }

    public async getColumnNames(tableIdentifier: string): Promise<string[]> {
        const newPlaceholderName = this.randomPlaceholderName();
        const columnNamesSdsCode = this.sdsStringForColumnNames(tableIdentifier, newPlaceholderName);
        const pipelineId = crypto.randomUUID();
        await this.addToAndExecutePipeline(pipelineId, columnNamesSdsCode);
        const columnNames = await this.getPlaceholderValue(newPlaceholderName, pipelineId);
        // eslint-disable-next-line no-console
        console.log(columnNames);
        return columnNames as string[];
    }

    public async getColumns(tableIdentifier: string): Promise<{ columns: any; placeholderName: string }> {
        const newPlaceholderName = this.randomPlaceholderName();
        const columnsSdsCode = this.sdsStringForColumns(tableIdentifier, newPlaceholderName);
        const pipelineId = crypto.randomUUID();
        await this.addToAndExecutePipeline(pipelineId, columnsSdsCode);
        const columns = await this.getPlaceholderValue(newPlaceholderName, pipelineId);
        // eslint-disable-next-line no-console
        console.log(columns);
        return { columns, placeholderName: newPlaceholderName };
    }
}

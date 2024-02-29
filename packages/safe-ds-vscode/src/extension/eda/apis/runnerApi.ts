import { Column, State, Table } from '@safe-ds/eda/types/state.js';
import { SafeDsServices, messages } from '@safe-ds/lang';
import { printOutputMessage } from '../../output.ts';
import * as vscode from 'vscode';

export class RunnerApi {
    services: SafeDsServices;
    pipelinePath: vscode.Uri;

    constructor(services: SafeDsServices, pipelinePath: vscode.Uri) {
        this.services = services;
        this.pipelinePath = pipelinePath;
    }

    public async getPlaceholderValue(tableIdentifier: string, pipelineId: string): Promise<State | undefined> {
        return new Promise((resolve) => {
            if (tableIdentifier === '') {
                resolve(undefined);
            }

            const placeholderValueCallback = (message: messages.PlaceholderValueMessage) => {
                if (message.id !== pipelineId || message.data.name !== tableIdentifier) {
                    return;
                }
                this.services.runtime.Runner.removeMessageCallback(placeholderValueCallback, 'placeholder_value');

                const pythonTableColumns = message.data.value;
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
                printOutputMessage('Got placeholder from Runner!');
                resolve({ tableIdentifier, history: [], defaultState: false, table });
            };

            this.services.runtime.Runner.addMessageCallback(placeholderValueCallback, 'placeholder_value');
            printOutputMessage('Getting placeholder from Runner ...');
            this.services.runtime.Runner.sendMessageToPythonServer(
                messages.createPlaceholderQueryMessage(pipelineId, tableIdentifier),
            );

            setTimeout(() => {
                resolve(undefined);
            }, 30000);
        });
    }
}

import type { FromExtensionMessage } from '../types/messaging';
import type { HistoryEntry, Tab, Table } from '../types/state';
import { get, writable } from 'svelte/store';

const tabs = writable<Tab[]>([]);

const currentTabIndex = writable<number | undefined>(undefined);

const preventClicks = writable<boolean>(false);

const cancelTabIdsWaiting = writable<string[]>([]);

// Define the stores, current state to default in case the extension never calls setWebviewState( Shouldn't happen)
const table = writable<Table | undefined>();

const history = writable<HistoryEntry[]>([]);

const tableLoading = writable<boolean>(false);

window.addEventListener('message', (event) => {
    const message = event.data as FromExtensionMessage;
    // eslint-disable-next-line no-console
    console.log(Date.now() + ': ' + message.command + ' called');
    switch (message.command) {
        case 'setInitialTable':
            if (!get(table)) {
                table.set(message.value);
            } else {
                throw new Error('setInitialTable called more than once');
            }
            break;
        case 'setProfiling':
            if (get(table)) {
                table.update((currentTable) => {
                    return {
                        ...currentTable!,
                        columns: currentTable!.columns.map((column) => {
                            const profiling = message.value.find((p) => p.columnName === column.name);
                            if (profiling) {
                                return {
                                    ...column,
                                    profiling: profiling.profiling,
                                };
                            } else {
                                return column;
                            }
                        }),
                    };
                });
            }
            break;
    }
});

export { history, tabs, table, currentTabIndex, preventClicks, cancelTabIdsWaiting, tableLoading };

import type { FromExtensionMessage } from '../types/messaging';
import type { HistoryEntry, Profiling, Tab, Table } from '../types/state';
import { get, writable } from 'svelte/store';

const tabs = writable<Tab[]>([]);

const currentTabIndex = writable<number | undefined>(undefined);

const preventClicks = writable<boolean>(false);

const cancelTabIdsWaiting = writable<string[]>([]);

let initialTable: Table | undefined;
const tableKey = writable<number>(0); // If changed will remount the table
let initialProfiling: { columnName: string; profiling: Profiling }[] = [];
const tabKey = writable<number>(0); // If changed will remount the tabs

// Define the stores, current state to default in case the extension never calls setWebviewState( Shouldn't happen)
const table = writable<Table | undefined>();

const history = writable<HistoryEntry[]>([]);

const savedColumnWidths = writable(new Map<string, number>());

const tableLoading = writable<boolean>(false);

window.addEventListener('message', (event) => {
    const message = event.data as FromExtensionMessage;
    // eslint-disable-next-line no-console
    console.log(Date.now() + ': ' + message.command + ' called');
    switch (message.command) {
        case 'setInitialTable':
            if (!get(table)) {
                table.set(message.value);
                initialTable = message.value;
            } else {
                throw new Error('setInitialTable called more than once');
            }
            break;
        case 'setProfiling':
            if (get(table)) {
                initialProfiling = message.value;
                setProfiling(message.value);
            }
            break;
    }
});

const setProfiling = (profiling: { columnName: string; profiling: Profiling }[]) => {
    table.update((currentTable) => {
        return {
            ...currentTable!,
            columns: currentTable!.columns.map((column) => {
                const newProfiling = profiling.find((p) => p.columnName === column.name);
                if (newProfiling) {
                    return {
                        ...column,
                        profiling: newProfiling.profiling,
                    };
                } else {
                    return column;
                }
            }),
        };
    });
};

const restoreTableInitialState = () => {
    table.set(initialTable);
    tabs.set([]);
    currentTabIndex.set(undefined);
    cancelTabIdsWaiting.set([]);
    savedColumnWidths.set(new Map<string, number>());
    tableKey.update((key) => key + 1);
    tabKey.update((key) => key + 1);
    setProfiling(initialProfiling);
};

export {
    history,
    tabs,
    table,
    currentTabIndex,
    preventClicks,
    cancelTabIdsWaiting,
    tableLoading,
    savedColumnWidths,
    restoreTableInitialState,
    tableKey,
    tabKey,
};

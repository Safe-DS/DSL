import type { FromExtensionMessage } from '../types/messaging';
import type { HistoryEntry, PossibleColumnFilter, Profiling, Tab, Table } from '../types/state';
import { get, writable } from 'svelte/store';

const tabs = writable<Tab[]>([]);

const currentTabIndex = writable<number | undefined>(undefined);

const preventClicks = writable<boolean>(false);

const cancelTabIdsWaiting = writable<string[]>([]);

export let initialTable: Table | undefined;
const tableKey = writable<number>(0); // If changed will remount the table
let initialProfiling: { columnName: string; profiling: Profiling }[] = [];
const tabKey = writable<number>(0); // If changed will remount the tabs

const possibleColumnFilters = new Map<string, PossibleColumnFilter[]>();

const showProfiling = writable<boolean>(false);
const profilingOutdated = writable<boolean>(false);
const profilingLoading = writable<boolean>(false);

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

                for (let i = 0; i < message.value.columns.length; i++) {
                    possibleColumnFilters.set(message.value.columns[i].name, getPosiibleColumnFilters(i));
                }
            } else {
                throw new Error('setInitialTable called more than once');
            }
            break;
        case 'setProfiling':
            if (message.historyId !== undefined) {
                setProfiling(message.value);
                profilingLoading.set(false);
                history.update((currentHistory) => {
                    return currentHistory.map((entry) => {
                        if (entry.id === message.historyId) {
                            return {
                                ...entry,
                                profilingState: message.value,
                            };
                        } else {
                            return entry;
                        }
                    });
                });
            } else if (get(table)) {
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
    setProfiling(initialProfiling);
    cancelTabIdsWaiting.set([]);
    savedColumnWidths.set(new Map<string, number>());
    rerender();
};

const rerender = () => {
    tableKey.update((key) => key + 1);
    tabKey.update((key) => key + 1);
};

const getPosiibleColumnFilters = function (columnIndex: number): PossibleColumnFilter[] {
    if (!get(table)) return [];

    const column = get(table)!.columns[columnIndex];

    const possibleColumnFiltersHere: PossibleColumnFilter[] = [];

    const distinctValues: string[] = [];
    for (const value of column.values) {
        if (!distinctValues.includes(value)) {
            distinctValues.push(value);
        }
        if (distinctValues.length > 5) {
            break;
        }
    }

    if (column.type === 'categorical') {
        if (distinctValues.length <= 5) {
            possibleColumnFiltersHere.push({
                type: 'specificValue',
                values: ['-'].concat(distinctValues),
            });
        } else {
            possibleColumnFiltersHere.push({
                type: 'searchString',
            });
        }
    } else {
        if (distinctValues.length <= 5) {
            possibleColumnFiltersHere.push({
                type: 'specificValue',
                values: ['-'].concat(distinctValues),
            });
        }

        if (distinctValues.length >= 4) {
            const colMax = column.values.reduce(
                (acc: number, val: number) => Math.max(acc, val),
                Number.NEGATIVE_INFINITY,
            );
            const colMin = column.values.reduce(
                (acc: number, val: number) => Math.min(acc, val),
                Number.POSITIVE_INFINITY,
            );

            possibleColumnFiltersHere.push({
                type: 'valueRange',
                min: colMin,
                max: colMax,
            });
        }
    }

    return possibleColumnFiltersHere;
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
    profilingLoading,
    profilingOutdated,
    restoreTableInitialState,
    rerender,
    possibleColumnFilters,
    tableKey,
    tabKey,
    showProfiling,
};

import type { HistoryEntry, FullInternalHistoryEntry } from '../types/state';

export const filterHistoryOnlyInternal = function (entries: HistoryEntry[]): FullInternalHistoryEntry[] {
    // Keep only the last occurrence of each unique overrideId
    const lastOccurrenceMap = new Map<string, number>();
    const filteredEntries: HistoryEntry[] = [];

    // Traverse from end to start to record the last occurrence of each unique overrideId
    for (let i = entries.length - 1; i >= 0; i--) {
        const entry = entries[i]!;
        const overrideId = entry.overrideId;

        if (!lastOccurrenceMap.has(overrideId)) {
            lastOccurrenceMap.set(overrideId, i);
        }
    }

    // Traverse from start to end to build the final result with only the last occurrences
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i]!;
        const overrideId = entry.overrideId;

        if (lastOccurrenceMap.get(overrideId) === i) {
            filteredEntries.push(entry);
        }
    }

    return filteredEntries.filter((entry) => entry.type === 'internal') as FullInternalHistoryEntry[];
};

export const filterHistoryOnlyProfilingInvalidating = function (entries: HistoryEntry[]): HistoryEntry[] {
    // Keep only the last occurrence of each unique overrideId
    const lastOccurrenceMap = new Map<string, number>();
    const filteredEntries: HistoryEntry[] = [];

    // Traverse from end to start to record the last occurrence of each unique overrideId
    for (let i = entries.length - 1; i >= 0; i--) {
        const entry = entries[i]!;
        const overrideId = entry.overrideId;

        if (!lastOccurrenceMap.has(overrideId) && doesEntryActionInvalidateProfiling(entry.action)) {
            lastOccurrenceMap.set(overrideId, i);
        }
    }

    // Traverse from start to end to build the final result with only the last occurrences
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i]!;
        const overrideId = entry.overrideId;

        if (lastOccurrenceMap.get(overrideId) === i) {
            filteredEntries.push(entry);
        }
    }

    return filteredEntries;
};

export const doesEntryActionInvalidateProfiling = function (entryAction: HistoryEntry['action']): boolean {
    return entryAction === 'filterColumn' || entryAction === 'voidFilterColumn';
};

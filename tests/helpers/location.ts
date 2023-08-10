import { Location, Position, Range } from 'vscode-languageserver';
import { isRangeEqual } from 'langium/test';

/**
 * Converts a position to a string.
 *
 * @param position The position to convert.
 * @returns The string representation of the position.
 */
export const positionToString = (position: Position): string => {
    return `${position.line + 1}:${position.character + 1}`;
};

/**
 * Converts a range to a string.
 *
 * @param range The range to convert.
 * @returns The string representation of the range.
 */
export const rangeToString = (range: Range): string => {
    return `${positionToString(range.start)} -> ${positionToString(range.end)}`;
};

/**
 * Converts a location to a string.
 *
 * @param location The location to convert.
 * @returns The string representation of the location.
 */
export const locationToString = (location: Location) => {
    return `${location.uri}:${rangeToString(location.range)}`;
};

/**
 * Compare two locations for equality.ts.
 *
 * @param location1 The first location.
 * @param location2 The second location.
 * @returns True if the locations are equal, false otherwise.
 */
export const isLocationEqual = (location1: Location, location2: Location): boolean => {
    return location1.uri === location2.uri && isRangeEqual(location1.range, location2.range);
};

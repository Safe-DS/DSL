import { Location, Position, Range } from 'vscode-languageserver';

/**
 * Converts a position to a string.
 */
export const positionToString = (position: Position): string => {
    return `${position.line}:${position.character}`;
};

/**
 * Converts a range to a string.
 */
export const rangeToString = (range: Range): string => {
    return `${positionToString(range.start)}->${positionToString(range.end)}`;
};

/**
 * Converts a location to a string.
 */
export const locationToString = (location: Location) => {
    return `[${location.uri}] at ${rangeToString(location.range)}`;
};

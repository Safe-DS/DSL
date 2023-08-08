import { Result } from 'true-myth';
import { Range, Position } from 'vscode-languageserver';
import { CLOSE, OPEN } from './testMarker';
import {positionToString} from "./stringification";

/**
 * Finds test ranges, i.e. parts of the program delimited by opening and closing test markers. They are sorted by the
 * position of their opening test markers. In case opening and closing markers don't match, an error value is returned.
 * Nested test markers are supported.
 *
 * @param program The program with test markers.
 * @return A wrapper that indicates success of failure.
 * @see FindTestRangesError
 * @see CLOSE
 * @see OPEN
 */
export const findTestRanges = (program: string): Result<Range[], FindTestRangesError> => {
    let currentLine = 0;
    let currentColumn = 0;
    let previousChar: string | null = null;

    const testRangeStarts: Position[] = [];
    const finishedLocations: Range[] = [];

    for (let currentIndex = 0; currentIndex < program.length; currentIndex++) {
        const currentChar = program[currentIndex];
        switch (currentChar) {
            case OPEN:
                currentColumn++;

                testRangeStarts.push(Position.create(currentLine, currentColumn));
                break;
            case CLOSE:
                currentColumn++;

                if (testRangeStarts.length === 0) {
                    return Result.err(new CloseWithoutOpenError(Position.create(currentLine, currentColumn - 1)));
                }

                finishedLocations.push(
                    Range.create(testRangeStarts.pop()!, Position.create(currentLine, currentColumn - 1)),
                );
                break;
            case '\r':
                currentLine++;
                currentColumn = 0;
                break;
            case '\n':
                if (previousChar !== '\r') {
                    currentLine++;
                    currentColumn = 0;
                }
                break;
            default:
                currentColumn++;
        }

        previousChar = currentChar;
    }

    if (testRangeStarts.length > 0) {
        return Result.err(
            new OpenWithoutCloseError(
                testRangeStarts.map((position) => Position.create(position.line, position.character - 1)),
            ),
        );
    } else {
        return Result.ok(
            finishedLocations.sort((a, b) => {
                return a.start.line === b.start.line
                    ? a.start.character - b.start.character
                    : a.start.line - b.start.line;
            }),
        );
    }
};

/**
 * Something went wrong when creating program ranges.
 */
export type FindTestRangesError = CloseWithoutOpenError | OpenWithoutCloseError;

/**
 * Found a closing test marker without a previous opening test marker.
 */
export class CloseWithoutOpenError extends Error {
    constructor(readonly position: Position) {
        super(`Found '${CLOSE}' without previous '${OPEN}' at ${position.line}:${position.character}.`);
    }
}

/**
 * Reached the end of the program but there were still unclosed opening test markers.
 */
export class OpenWithoutCloseError extends Error {
    constructor(readonly positions: Position[]) {
        super(
            `Found '${OPEN}' without following '${CLOSE}' at ${positions
                .map(positionToString)
                .join(', ')}.`,
        );
    }
}

import {Position, Range} from "vscode-languageserver";

export const positionToString = (position: Position): string => {
    return `${position.line}:${position.character}`;
}

export const rangeToString = (range: Range): string => {
    return `${positionToString(range.start)}->${positionToString(range.end)}`;
}

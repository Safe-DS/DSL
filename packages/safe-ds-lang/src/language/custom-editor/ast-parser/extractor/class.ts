import { SdsClass } from "../../../generated/ast.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGING_TAG = "CustomEditor] [AstParser] [Class";

export interface Class {
    $type: "class";
    name: string;
}

export const getClass = (node: SdsClass): Class => {
    return {
        $type: "class",
        name: node.name,
    };
};

export const isClass = (object: any): object is Class => {
    return (
        object &&
        typeof object === "object" &&
        typeof object.name === "string" &&
        object.$type === "class"
    );
};

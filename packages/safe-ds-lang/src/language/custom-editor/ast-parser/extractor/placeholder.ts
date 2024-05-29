import { SdsPlaceholder } from "../../../generated/ast.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGING_TAG = "CustomEditor] [AstParser] [Placeholder";

export interface Placeholder {
    $type: "placeholder";
    name: string;
}

export const getPlaceholder = (node: SdsPlaceholder): Placeholder => {
    return { $type: "placeholder", name: node.name };
};

export const isPlaceholder = (object: any): object is Placeholder => {
    return (
        object &&
        typeof object === "object" &&
        typeof object.name === "string" &&
        object.$type === "placeholder"
    );
};

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { AstNode, LangiumDocument, isAstNode, isReference } from "langium";
import {
    SafeDsAstReflection,
    isSdsAnnotationCall,
    isSdsAnnotationCallList,
} from "../../../generated/ast.js";
import { writeFileSync } from "fs";

export const printJson = (json: {}) => {
    console.dir(json);
};

export const saveJson = (json: {}, name: string) => {
    const extension = ".txt";
    const path = `${name}${extension}`;

    try {
        writeFileSync(path, JSON.stringify(json));
        console.log(`Debug: Saved Json`);
    } catch (error) {
        if (error instanceof Error) console.dir(error);
    }
};

export const documentToJson = (
    document: LangiumDocument<AstNode>,
    depth: number,
): {} => {
    const root = document.parseResult.value;
    return nodeToJson(root, depth);
};

export const nodeToJson = (node: AstNode, depth: number): {} => {
    // console.log(node.$type);

    const astHelper = new SafeDsAstReflection();
    const metadata = astHelper.getTypeMetaData(node.$type);
    const result: { [key: string]: any } = { $type: metadata.name };

    if (depth === 0) {
        metadata.properties.forEach((property) => {
            result[property.name] = "DEPTH_STOP";
        });
        return result;
    }

    metadata.properties.forEach((property) => {
        const element =
            (node as any)[property.name] ?? property.defaultValue ?? "";

        let parsedElement;
        if (isSdsAnnotationCallList(element)) {
            parsedElement = nodeToJson(element, depth - 1);
        } else if (isAstNode(element)) {
            parsedElement = nodeToJson(element, depth - 1);
        } else if (Array.isArray(element)) {
            parsedElement = element.map((listElement) => {
                return nodeToJson(listElement, depth - 1);
            });
        } else if (isReference(element)) {
            parsedElement = {
                ref: element.ref ? nodeToJson(element.ref, depth - 1) : "",
            };
        } else if (typeof element === "bigint") {
            parsedElement = element.toString();
        } else {
            parsedElement = element;
        }

        result[property.name] = parsedElement;
    });

    return result;
};

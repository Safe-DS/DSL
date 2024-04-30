/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { AstNode, Reference, isReference } from 'langium';
import { SdsDeclaration } from '../../generated/ast.js';
import fs from 'fs';
import util from 'util';

export const treeToJson = (root: AstNode) => {
    try {
        const parsedTree = recursiveParse(root, -1);

        // fs.writeFileSync('ast_DELSOON.txt', util.inspect(parsedTree, { depth: null }));
        // console.log('SAVED PARSED TREE');

        fs.writeFileSync('astJSON_DELSOON.txt', JSON.stringify(parsedTree));
        console.log('SAVED PARSED TREE');
    } catch (e) {
        console.log('I GOT AN ERROR\n');
        if (e instanceof Error) console.dir(e);
    }
};

export const recursiveParse = (node: AstNode, depthLeft: number): {} => {
    if (depthLeft === 0) {
        return { type: node.$type, DEPTH_STOP: 'DEPTH_STOP' };
    }

    if (node.$type === undefined) {
        if (isReference(node)) {
            return {
                type: 'Reference',
                ref: recursiveParse((node as Reference).ref as SdsDeclaration, 3),
            };
        }
        return { type: 'TYPE_UNDEFINED', keys: Object.keys(node) };
    }

    const keys = Object.keys(node);
    const ignoreList = ['$type', '$container', '$containerProperty', '$containerIndex', '$cstNode', '$document'];

    const children: { [key: string]: any } = {};

    keys.filter((key) => !ignoreList.includes(key)).forEach((key) => {
        if ((node as any)[key] === null || (node as any)[key] === undefined) {
            children[key] = 'NULL';
            return;
        }

        if (Array.isArray((node as any)[key])) {
            if ((node as any)[key].length <= 0) {
                children[key] = 'EMPTY_ARRAY';
                return;
            }

            const sampleElement = (node as any)[key][0];
            if (typeof sampleElement === 'object') {
                children[key] = (node as any)[key].map((arrayElement: AstNode, index: number) => {
                    if (index > 4) {
                        return { type: 'ARRAY_TO_LONG' };
                    }
                    return recursiveParse(arrayElement, depthLeft - 1);
                });
                return;
            }

            children[key] = (node as any)[key].map((arrayElement: any) => {
                return arrayElement.toString();
            });
        }

        if (typeof (node as any)[key] === 'object') {
            children[key] = recursiveParse((node as any)[key], depthLeft - 1);
            return;
        }

        children[key] = (node as any)[key].toString();
    });

    return { type: node.$type, ...children };
};

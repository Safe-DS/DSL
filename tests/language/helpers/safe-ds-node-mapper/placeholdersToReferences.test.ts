import { afterEach, describe, expect, it } from 'vitest';
import { createSafeDsServices } from '../../../../src/language/safe-ds-module.js';
import { clearDocuments } from 'langium/test';
import { EmptyFileSystem } from 'langium';
import {getNodeOfType} from "../../../helpers/nodeFinder.js";
import {isSdsPlaceholder} from "../../../../src/language/generated/ast.js";

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const nodeMapper = services.helpers.NodeMapper;

describe('SafeDsNodeMapper', () => {
    afterEach(async () => {
        await clearDocuments(services);
    });

    describe('placeholderToReferences', () => {
        it('should return an empty list if passed undefined', async () => {
            expect(nodeMapper.placeholderToReferences(undefined)).toStrictEqual([]);
        });

        it('should return references in default values', async () => {
            const code = `
                segment mySegment() {
                    val a1 = 1;
                    (p1: Int = a1) -> 1;
                }
            `;

            const placeholder = await getNodeOfType(services, code, isSdsPlaceholder);
            expect(nodeMapper.placeholderToReferences(placeholder)).toHaveLength(1);
        });

        it('should return references directly in body', async () => {
            const code = `
                pipeline myPipeline {
                    val a1 = 1;

                    a1;
                    a1;
                };
            `;

            const placeholder = await getNodeOfType(services, code, isSdsPlaceholder);
            expect(nodeMapper.placeholderToReferences(placeholder)).toHaveLength(2);
        });

        it('should return references nested in body', async () => {
            const code = `
                segment mySegment() {
                    val a1 = 1;

                    () {
                        a1;
                    };
                    () -> a1;
                };
            `;

            const placeholder = await getNodeOfType(services, code, isSdsPlaceholder);
            expect(nodeMapper.placeholderToReferences(placeholder)).toHaveLength(2);
        });

        it('should not return references to other placeholders', async () => {
            const code = `
                pipeline myPipeline {
                    val a1 = 1;
                    val a2 = 2;

                    a1;
                    a2;
                };
            `;

            const placeholder = await getNodeOfType(services, code, isSdsPlaceholder);
            expect(nodeMapper.placeholderToReferences(placeholder)).toHaveLength(1);
        });
    });
});

import { afterEach, describe, expect, it } from 'vitest';
import { createSafeDsServices } from '../../../../src/language/safe-ds-module.js';
import { clearDocuments } from 'langium/test';
import { EmptyFileSystem } from 'langium';
import { getNodeOfType } from '../../../helpers/nodeFinder.js';
import { isSdsAbstractCall } from '../../../../src/language/generated/ast.js';

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const nodeMapper = services.helpers.NodeMapper;

describe('SafeDsNodeMapper', () => {
    afterEach(async () => {
        await clearDocuments(services);
    });

    describe('callToCallableOrUndefined', () => {
        it('should return undefined if passed undefined', () => {
            expect(nodeMapper.callToCallableOrUndefined(undefined)).toBeUndefined();
        });

        // -----------------------------------------------------------------------------------------
        // Annotation calls
        // -----------------------------------------------------------------------------------------

        describe('annotation calls', () => {
            it('should return undefined if receiver is unresolved', async () => {
                const code = `
                    @unresolved
                    pipeline myPipeline {}
                `;

                const call = await getNodeOfType(services, code, isSdsAbstractCall);
                expect(nodeMapper.callToCallableOrUndefined(call)?.$type).toBeUndefined();
            });

            it('should return the called annotation', async () => {
                const code = `
                    annotation MyAnnotation

                    @MyAnnotation
                    class MyClass
                `;

                const call = await getNodeOfType(services, code, isSdsAbstractCall);
                expect(nodeMapper.callToCallableOrUndefined(call)?.$type).toBe('SdsAnnotation');
            });
        });

        // -----------------------------------------------------------------------------------------
        // Calls
        // -----------------------------------------------------------------------------------------

        describe('calls', () => {
            it('should return undefined if receiver is unresolved', async () => {
                const code = `
                    pipeline myPipeline {
                        unresolved();
                    }
                `;

                const call = await getNodeOfType(services, code, isSdsAbstractCall);
                expect(nodeMapper.callToCallableOrUndefined(call)?.$type).toBeUndefined();
            });

            it('should return undefined if receiver is not callable', async () => {
                const code = `
                    enum MyEnum

                    pipeline myPipeline {
                        MyEnum();
                    }
                `;

                const call = await getNodeOfType(services, code, isSdsAbstractCall);
                expect(nodeMapper.callToCallableOrUndefined(call)?.$type).toBeUndefined();
            });

            it('should return the called annotation', async () => {
                const code = `
                    annotation MyAnnotation

                    pipeline myPipeline {
                        MyAnnotation();
                    }
                `;

                const call = await getNodeOfType(services, code, isSdsAbstractCall);
                expect(nodeMapper.callToCallableOrUndefined(call)?.$type).toBe('SdsAnnotation');
            });

            it('should return the called annotation (aliased)', async () => {
                const code = `
                    annotation MyAnnotation

                    pipeline myPipeline {
                        val alias = MyAnnotation;
                        alias();
                    }
                `;

                const call = await getNodeOfType(services, code, isSdsAbstractCall);
                expect(nodeMapper.callToCallableOrUndefined(call)?.$type).toBe('SdsAnnotation');
            });

            it('should return the called block lambda (aliased)', async () => {
                const code = `
                    pipeline myPipeline {
                        val alias = () {};
                        alias();
                    }
                `;

                const call = await getNodeOfType(services, code, isSdsAbstractCall);
                expect(nodeMapper.callToCallableOrUndefined(call)?.$type).toBe('SdsBlockLambda');
            });

            it('should return the called callable type', async () => {
                const code = `
                    segment mySegment(f: () -> ()) {
                        f();
                    }
                `;

                const call = await getNodeOfType(services, code, isSdsAbstractCall);
                expect(nodeMapper.callToCallableOrUndefined(call)?.$type).toBe('SdsCallableType');
            });

            it('should return the called callable type (aliased)', async () => {
                const code = `
                    segment mySegment(f: () -> ()) {
                        val alias = f;
                        alias();
                    }
                `;

                const call = await getNodeOfType(services, code, isSdsAbstractCall);
                expect(nodeMapper.callToCallableOrUndefined(call)?.$type).toBe('SdsCallableType');
            });

            it('should return the called class', async () => {
                const code = `
                    class MyClass

                    pipeline myPipeline {
                        MyClass();
                    }
                `;

                const call = await getNodeOfType(services, code, isSdsAbstractCall);
                expect(nodeMapper.callToCallableOrUndefined(call)?.$type).toBe('SdsClass');
            });

            it('should return the called class (aliased)', async () => {
                const code = `
                    class MyClass

                    pipeline myPipeline {
                        val alias = MyClass;
                        alias();
                    }
                `;

                const call = await getNodeOfType(services, code, isSdsAbstractCall);
                expect(nodeMapper.callToCallableOrUndefined(call)?.$type).toBe('SdsClass');
            });

            it('should return the called enum variant', async () => {
                const code = `
                    enum MyEnum {
                        MyEnumVariant
                    }

                    pipeline myPipeline {
                        MyEnum.MyEnumVariant();
                    }
                `;

                const call = await getNodeOfType(services, code, isSdsAbstractCall);
                expect(nodeMapper.callToCallableOrUndefined(call)?.$type).toBe('SdsEnumVariant');
            });

            it('should return the called enum variant (aliased)', async () => {
                const code = `
                    enum MyEnum {
                        MyEnumVariant
                    }

                    pipeline myPipeline {
                        val alias = MyEnum.MyEnumVariant;
                        alias();
                    }
                `;

                const call = await getNodeOfType(services, code, isSdsAbstractCall);
                expect(nodeMapper.callToCallableOrUndefined(call)?.$type).toBe('SdsEnumVariant');
            });

            it('should return the called expression lambda (aliased)', async () => {
                const code = `
                    pipeline myPipeline {
                        val alias = () -> 0;
                        alias()
                    }
                `;

                const call = await getNodeOfType(services, code, isSdsAbstractCall);
                expect(nodeMapper.callToCallableOrUndefined(call)?.$type).toBe('SdsExpressionLambda');
            });

            it('should return the called function', async () => {
                const code = `
                    fun myFunction()

                    pipeline myPipeline {
                        myFunction();
                    }
                `;

                const call = await getNodeOfType(services, code, isSdsAbstractCall);
                expect(nodeMapper.callToCallableOrUndefined(call)?.$type).toBe('SdsFunction');
            });

            it('should return the called function (aliased)', async () => {
                const code = `
                    fun myFunction()

                    pipeline myPipeline {
                        val alias = myFunction;
                        alias();
                    }
                `;

                const call = await getNodeOfType(services, code, isSdsAbstractCall);
                expect(nodeMapper.callToCallableOrUndefined(call)?.$type).toBe('SdsFunction');
            });

            it('should return the called segment', async () => {
                const code = `
                    segment mySegment() {}

                    pipeline myPipeline {
                        mySegment();
                    }
                `;

                const call = await getNodeOfType(services, code, isSdsAbstractCall);
                expect(nodeMapper.callToCallableOrUndefined(call)?.$type).toBe('SdsSegment');
            });

            it('should return the called segment (aliased)', async () => {
                const code = `
                    segment mySegment() {}

                    pipeline myPipeline {
                        val alias = mySegment;
                        alias();
                    }
                `;

                const call = await getNodeOfType(services, code, isSdsAbstractCall);
                expect(nodeMapper.callToCallableOrUndefined(call)?.$type).toBe('SdsSegment');
            });
        });
    });
});

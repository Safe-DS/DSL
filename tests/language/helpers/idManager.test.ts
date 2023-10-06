import { beforeEach, describe, expect, it } from 'vitest';
import { IdManager } from '../../../src/language/helpers/idManager.js';

describe('IdManager', () => {
    let idManager: IdManager<object>;

    beforeEach(() => {
        idManager = new IdManager<object>();
    });

    describe('assignId', () => {
        it('should assign a new id for new objects', () => {
            const obj1 = {};
            const obj2 = {};

            const id1 = idManager.assignId(obj1);
            const id2 = idManager.assignId(obj2);

            expect(id1).toBe(0);
            expect(id2).toBe(1);
        });

        it('should return the old id for known objects', () => {
            const obj = {};

            const id1 = idManager.assignId(obj);
            const id2 = idManager.assignId(obj);

            expect(id2).toBe(id1);
        });
    });
    describe('reset', () => {
        it('should forget all objects and ids', () => {
            const obj1 = {};
            const obj2 = {};

            idManager.assignId(obj1);
            const id1 = idManager.assignId(obj2);
            idManager.reset();
            const id2 = idManager.assignId(obj2);

            expect(id1).to.not.equal(id2);
        });

        it('should reset the id counter', () => {
            const obj1 = {};
            const obj2 = {};

            idManager.assignId(obj1);
            idManager.assignId(obj2);
            idManager.reset();
            const id = idManager.assignId(obj2);

            expect(id).toBe(0);
        });
    });
});

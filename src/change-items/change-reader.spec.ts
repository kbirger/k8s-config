import { Actions, ChangeItem } from "./interfaces";
import { readChanges } from "./change-reader";

describe('ChangeReader', () => {
    ([
        { item: { action: Actions.Add, change: { path: 'a.b', field: 'name' }, name: 'name', newValue: '' }, expected: 'x' },
        { item: { action: Actions.Add, change: { path: 'a.b' }, newValue: 'new' }, expected: 'x' },
        { item: { action: Actions.Change, change: { path: 'a.b', field: 'name' }, oldValue: 'old', newValue: 'new' }, expected: 'x' },
        { item: { action: Actions.Delete, change: { path: 'a.b', field: 'name' }, name: 'name', newValue: '' }, expected: 'x' },
        { item: { action: Actions.Delete, change: { path: 'a.b' }, newValue: '' }, expected: 'x' },
    ] as { item: ChangeItem, expected: string }[])
        .forEach(({ item, expected }, index) => {
            it(`should print '${expected}'`, async () => {
                // Act
                const actual = await readChanges([item]);

                // Assert
                expect(actual[0]).toEqual(expected)

            });
        });
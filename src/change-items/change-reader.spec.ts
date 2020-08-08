import { Actions, ChangeItem } from './interfaces';
import { readChanges } from './change-reader';


describe('ChangeReader', () => {
    ([
        {
            item: { action: Actions.Add, change: { path: 'a.b', field: 'field' }, itemType: 'cluster', name: 'name', newValue: '' },
            expected: "Added field 'name' with value:"
        },
        {
            item: { action: Actions.Add, change: { path: 'a.b' }, newValue: 'new' }, itemType: 'cluster',
            expected: 'Added a.b with value:'
        },
        {
            item: { action: Actions.Change, change: { path: 'a.b', field: 'name' }, itemType: 'cluster', oldValue: 'old', newValue: 'new' },
            expected: 'Changed a.b[?].cluster: old => new'
        },
        {
            item: { action: Actions.Delete, change: { path: 'a.b', field: 'name' }, itemType: 'cluster', name: 'name', newValue: '' },
            expected: "Deleted cluster with name='name'"
        },
        {
            item: { action: Actions.Delete, change: { path: 'a.b' }, newValue: '' }, itemType: 'cluster',
            expected: 'Deleted a.b'
        },

    ] as { item: ChangeItem, expected: string }[])
        .forEach(({ item, expected }, index) => {
            it(`should print '${expected}': #${index + 1}`, async () => {
                // Act
                const actual = await readChanges([item]);

                // Assert
                expect(actual[0]).toEqual(expect.stringContaining(expected));

            });

        });
});

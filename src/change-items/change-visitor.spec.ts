import { ChangeProcessor, processChanges, ProcessorResult } from './change-visitor';
import { ChangeItem, Actions } from './interfaces';

type MockProcessor = ChangeProcessor<string[]> & { [P in keyof ChangeProcessor<string[]>]: jest.Mock };
function getMockProcessor(): MockProcessor {
    return {
        processAddItemUnnamed: jest.fn(),
        processAddNamedItem: jest.fn(),
        processChangeValueNamedItem: jest.fn(),
        processDeleteNamedItem: jest.fn(),
        processDeleteUnnamedItem: jest.fn()
    };
}

describe('change-visitor', () => {
    it('should handle Success', async () => {
        // Arrange
        const processor = getMockProcessor();
        processor.processAddItemUnnamed.mockReturnValue(ProcessorResult.success());
        const state = [];
        const items: ChangeItem[] = [{
            action: Actions.Add,
            change: { path: 'context' },
            itemType: 'context',
            newValue: 'yup'
        }];

        // Act
        const result = await processChanges(state, items, processor);

        // Assert
        expect(processor.processAddItemUnnamed).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            success: true,
            messages: [],
            performed: items
        });
    });

    it('should handle Continue', async () => {
        // Arrange
        const processor = getMockProcessor();
        const state = [];
        const items: ChangeItem[] = [{
            action: Actions.Add,
            change: { path: 'context' },
            itemType: 'context',
            newValue: 'yup'
        }];

        const newItems: ChangeItem[] = [{
            action: Actions.Delete,
            change: { path: 'context' },
            itemType: 'context',
            name: 'foo'
        }];

        processor.processDeleteNamedItem.mockReturnValue(ProcessorResult.success());
        processor.processAddItemUnnamed.mockReturnValueOnce(ProcessorResult.continue([...newItems, ...items], 'yes, but'));
        processor.processAddItemUnnamed.mockReturnValueOnce(ProcessorResult.success());

        // Act
        const result = await processChanges(state, items, processor);

        // Assert
        expect(result).toEqual({
            success: true,
            messages: ['yes, but'],
            performed: [...newItems, ...items]
        });
    });

    it('should handle Error', async () => {
        // Arrange
        const processor = getMockProcessor();
        const state = [];
        const items: ChangeItem[] = [{
            action: Actions.Add,
            change: { path: 'context' },
            itemType: 'context',
            newValue: 'yup'
        }];

        processor.processAddItemUnnamed
            .mockReturnValueOnce(ProcessorResult.error('error!'));

        // Act
        const result = await processChanges(state, items, processor);

        // Assert
        expect(result).toEqual({
            success: false,
            messages: ['error!'],
            performed: []
        });
    });

    it('should handle Skip', async () => {
        // Arrange
        const processor = getMockProcessor();
        const state = [];
        const items: ChangeItem[] = [{
            action: Actions.Add,
            change: { path: 'context' },
            itemType: 'context',
            newValue: 'yup'
        }];

        processor.processAddItemUnnamed.mockReturnValue(ProcessorResult.skip('nevermind'));

        // Act
        const result = await processChanges(state, items, processor);

        // Assert
        expect(result).toEqual({
            success: true,
            messages: [],
            performed: []
        });
    });

    it('should reject invalid item', async () => {
        // Arrange
        const processor = getMockProcessor();
        const state = [];
        const items: ChangeItem[] = [{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            action: 35 as any,
            change: { path: 'context' },
            itemType: 'context',
            newValue: 'yup'
        }];


        // Act
        await expect(processChanges(state, items, processor))
            .rejects.toEqual('Invalid item type');
    });

    type Callback = (processor: MockProcessor) => jest.Mock;
    ([
        { item: { action: Actions.Add, change: { path: 'a.b', field: 'name' }, name: 'name', newValue: '' }, callbackGetter: (p) => p.processAddNamedItem },
        { item: { action: Actions.Add, change: { path: 'a.b' }, newValue: 'new' }, callbackGetter: (p) => p.processAddItemUnnamed },
        { item: { action: Actions.Change, change: { path: 'a.b', field: 'name' }, oldValue: 'old', newValue: 'new' }, callbackGetter: (p) => p.processChangeValueNamedItem },
        { item: { action: Actions.Delete, change: { path: 'a.b', field: 'name' }, name: 'name', newValue: '' }, callbackGetter: (p) => p.processDeleteNamedItem },
        { item: { action: Actions.Delete, change: { path: 'a.b' }, newValue: '' }, callbackGetter: (p) => p.processDeleteUnnamedItem },
    ] as { item: ChangeItem, callbackGetter: Callback }[])
        .forEach(({ item, callbackGetter }, index) => {
            it(`should call correct callback #${index + 1}`, async () => {
                // Arrange
                const processor = getMockProcessor();
                const state = [];
                const items = [item];
                const callback = callbackGetter(processor);
                callback.mockReturnValue(ProcessorResult.success());

                // Act
                await processChanges(state, items, processor);

                // Assert
                expect(callback).toHaveBeenCalled();
            });




        });
});
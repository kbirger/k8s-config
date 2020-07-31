import '../file-utils'
import { list } from './list';

jest.mock('../file-utils');

describe('list command', () => {
  it('should list clusters', () => {
    // Act
    list('/tmp/foo', 'cluster');

    // Assert
    expect(console.log).toHaveBeenCalledWith(['test-cluster'])
  });

  it('should list contexts', () => {
    // Act
    list('/tmp/foo', 'context');

    // Assert
    expect(console.log).toHaveBeenCalledWith(['test-ctx'])
  });

  it('should list users', () => {
    // Act
    list('/tmp/foo', 'user');

    // Assert
    expect(console.log).toHaveBeenCalledWith(['test-user'])
  });

});
import * as helpers from './helpers';

describe('command helpers', () => {
  describe('compose', () => {
    beforeEach(() => {
      jest.spyOn(process, 'exit').mockImplementation();
    });
    it('should return true for multiple plain value commands', async () => {
      // Act
      const result = await helpers.compose(() => true, () => true);

      // Assrt
      expect(result).toEqual(true);
    });

    it('should return true for multiple promise value commands', async () => {
      // Act
      const result = await helpers.compose(() => Promise.resolve(true), () => Promise.resolve(true));

      // Assrt
      expect(result).toEqual(true);
    });

    it('should return true for multiple mixed value commands', async () => {
      // Act
      const result = await helpers.compose(() => true, () => Promise.resolve(true));

      // Assrt
      expect(result).toEqual(true);
    });


    it('should return false when promise command returns false', async () => {
      // Act
      const result = await helpers.compose(() => true, () => Promise.resolve(false));

      // Assrt
      expect(result).toEqual(false);
      expect(process.exit).toHaveBeenLastCalledWith(1);
    });


    it('should return false when plain value command returns false', async () => {
      // Act
      const result = await helpers.compose(() => false, () => Promise.resolve(true));

      // Assrt
      expect(result).toEqual(false);
      expect(process.exit).toHaveBeenLastCalledWith(1);
    });
  });

  describe('header', () => {
    beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation();
    });

    it('should print header when in dry-run', () => {
      // Act
      const result = helpers.header(true);

      // Assert
      expect(result).toEqual(true);
      expect(console.log).toHaveBeenCalledWith('DRY-RUN ENABLED! No changes will be committed to disk');
    });

    it('should not print header when not in dry-run', () => {
      // Act
      const result = helpers.header(false);

      // Assert
      expect(result).toEqual(true);
      expect(console.log).not.toHaveBeenCalledWith('DRY-RUN ENABLED! No changes will be committed to disk');
    });
  });
});
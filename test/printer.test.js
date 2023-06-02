const {printers} = require('../dist/index')
test('Get printer', async () => {
    const result = await printers()
    expect(result.length).not.toBe(undefined)
});
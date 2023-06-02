const {print_file} = require('../dist/index')
// test('Get printer', async () => {
//     const result = await printers()
//     expect(result.length).not.toBe(undefined)
// });
test('print_file', async () => {
    const result = await print_file({
        id: "test",
        path: "test",
        print_setting: {
            orientation: "landscape"
        }
    })
    // expect(result.length).not.toBe(undefined)
});
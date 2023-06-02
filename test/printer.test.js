const {print_file} = require('../dist/index')
// test('Get printer', async () => {
//     const result = await printers()
//     expect(result.length).not.toBe(undefined)
// });
test('print_pdf_local', async () => {
    
    const result = await print_file({
        id: "QlAtTElURSA4MEQrODBYIFByaW50ZXI=",
        path: "test",
        print_setting: {
            orientation: "landscape",
            paper: "A5"
        }
    })
    // expect(result.length).not.toBe(undefined)
});

test('print_pdf_sharing', async () => {
    const result = await print_file({
        id: "XFwxNzIuMzEuNjQuMjIxXEhQIEluayBUYW5rIDMxMCBzZXJpZXM=",
        path: "test",
        print_setting: {
            orientation: "landscape",
            paper: "A5"
        }
    })
    // expect(result.length).not.toBe(undefined)
});

test('print_pdf_by_name', async () => {
    const result = await print_file({
        name: "BP-LITE 80D+80X Printer",
        path: "test",
        print_setting: {
            orientation: "landscape",
            paper: "A5"
        }
    })
    // expect(result.length).not.toBe(undefined)
});
const fs = require('fs')
const {get_jobs, restart_job, print_file} = require('../dist/index')
// test('Get printer', async () => {
//     const result = await printers()
//     expect(result.length).not.toBe(undefined)
// });
// test('print_pdf_local', async () => {
    
//     const result = await print_file({
//         id: "QlAtTElURSA4MEQrODBYIFByaW50ZXI=",
//         path: "path/to/file.pdf",
//         print_setting: {
//             orientation: "landscape",
//             paper: "A5"
//         }
//     })
//     // expect(result.length).not.toBe(undefined)
// });

test('print_pdf_sharing', async () => {
    const buffer = await fs.readFileSync("F:\\devcode\\test.pdf")
    const result = await print_file({
        id: "XFwxNzIuMzEuNjQuMjIxXEhQIEluayBUYW5rIDMxMCBzZXJpZXM=",
        file: buffer,
        print_setting: {
            orientation: "landscape",
            paper: "A5"
        }
    })
    // expect(result.length).not.toBe(undefined)
});

// test('print_pdf_by_name', async () => {
//     const result = await print_file({
//         name: "BP-LITE 80D+80X Printer",
//         path: "path/to/file.pdf",
//         print_setting: {
//             orientation: "landscape",
//             paper: "A5"
//         }
//     })
//     // expect(result.length).not.toBe(undefined)
// });

// test('get_jobs', async () => {
//     const result = await jobs();
//     console.log(result)
// })

// test('restart_jobs', async () => {
//     const result = await restart_job("XFwxNzIuMzEuNjQuMjIxXEhQIEluayBUYW5rIDMxMCBzZXJpZXNfQF80Ng==");
//     // console.log(data.length)
// })
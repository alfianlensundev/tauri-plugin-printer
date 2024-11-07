export const jobStatus: any = {
    512: {
        name: "Completed",
        description: "An error condition, possibly on a print job that precedes this one in the queue, blocked the print job."
    },
    4096: {
        name: "Completed",
        description: "The print job is complete, including any post-printing processing."
    },
    256: {
        name: "Deleted",
        description: "The print job was deleted from the queue, typically after printing."
    },
    4: {
        name: "Deleting",
        description: "The print job is in the process of being deleted."
    },
    2: {
        name: "Error",
        description: "The print job is in an error state."
    },
    0: {
        name: "None",
        description: "The print job has no specified state."
    },
    32: {
        name: "Offline",
        description: "The printer is offline."
    },
    64: {
        name: "PaperOut",
        description: "The printer is out of the required paper size."
    },
    1: {
        name: "Paused",
        description: "The print job is paused."
    },
    128: {
        name: "Printed",
        description: "The print job printed."
    },
    16: {
        name: "Printing",
        description: "The print job is now printing."
    },
    2048: {
        name: "Restarted",
        description: "The print job was blocked but has restarted."
    },
    8192: {
        name: "Retained",
        description: "The print job is retained in the print queue after printing."
    },
    1024: {
        name: "UserIntervention",
        description: "The printer requires user action to fix an error condition."
    },
    8: {
        name: "Spooling",
        description: "The print job is spooling."
    },
}
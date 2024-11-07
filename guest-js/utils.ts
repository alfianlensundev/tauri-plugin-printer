export const parseIfJSON = (str: string, dflt: any = null) => {
    try {
        return JSON.parse(str)
    } catch (error) {
        return dflt
    }
}
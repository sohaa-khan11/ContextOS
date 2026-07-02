export const validatePayload = (payload: any, requiredFields: string[]) => {
    for (const field of requiredFields) {
        if (payload[field] === undefined) {
            return { valid: false, error: `Missing required field: ${field}` };
        }
    }
    return { valid: true };
}

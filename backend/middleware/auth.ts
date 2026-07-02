export const validateExtensionToken = async (req: Request) => {
    // TODO: Verify token against Postgres extension_tokens table
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    return token === 'mock-token' ? { userId: 'mock-user-id' } : null;
}

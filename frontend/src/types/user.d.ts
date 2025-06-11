declare global {
    interface LocalUser {
        id: string;
        name: string;
        email: string;
        createdAt?: string;
    }
}
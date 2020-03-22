export interface User {
    createdAt?: string;
    customerId?: any;
    disabled?: boolean;
    displayName?: string;
    email?: string;
    emailVerified?: boolean;
    notifications?: object;
    photoURL?: string;
    source?: string;
    token?: string;
    uid: string;
}
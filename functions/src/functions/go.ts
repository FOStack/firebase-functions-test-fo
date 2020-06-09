import * as functions from 'firebase-functions';
import { docSet } from '../modules/admin';

export const apply = functions.https.onCall(
async (p, c) => {
    const user: any = c.auth;
    
    return await docSet(`go/${user.uid}`, p);
});
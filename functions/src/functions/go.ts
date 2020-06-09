import * as functions from 'firebase-functions';
import { docSet } from '../modules/admin';

export const apply = functions.https.onCall(
async (p, c) => {
    const user: any = c.auth;

    const uid: string = (user)?user.uid:p.uid;

    if(p.password) delete p.password;
    if(p.confirm_password) delete p.confirm_password;
    if(p.uid) delete p.uid;
    
    return await docSet(`go/${uid}`, p);
});
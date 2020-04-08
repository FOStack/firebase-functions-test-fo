import * as functions from 'firebase-functions';
import { col } from '../modules/admin';

export const orders = functions.https.onCall(
(p, c)=> {
    return col({
        ref: 'orders',
        field: 'seller.id',
        query: p
    }).get();
})
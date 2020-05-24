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

export const authorized = functions.https.onRequest((req, res) => {
    console.log(req.rawBody);
    res.status(200);
    res.send(req.rawBody);
})
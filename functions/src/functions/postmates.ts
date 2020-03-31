import * as functions from 'firebase-functions';

import { quote, create } from '../modules/postmates';

export const quoteGet = functions.https.onCall(
    async (p, c) => { 
        const r = await quote(p);
        // console.log(quote);
        return r;
    }
);

export const deliveryCreate = functions.https.onCall(
    async (p, c) => { 
        const delivery = await create(p);
        // console.log(delivery);
        return delivery;
    }
);
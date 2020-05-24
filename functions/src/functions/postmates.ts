import * as functions from 'firebase-functions';

import { quote, create, phoneParam } from '../modules/postmates';

export const quoteGet = functions.https.onCall(
    async (p, c) => { 
        const r = await quote(p);
        // console.log(quote);
        return r;
    }
);

export const deliveryCreate = functions.https.onCall(
    async (p, c) => { 
        const params = p;
        p.pickup_phone_number = phoneParam(p.pickup_phone_number);
        p.dropoff_phone_number = phoneParam(p.dropoff_phone_number);
        const delivery = await create(params);
        // console.log(delivery);
        return delivery;
    }
);
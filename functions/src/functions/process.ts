import * as functions from 'firebase-functions';

import { prim } from '../modules/utl';
import { add, userDoc, notify } from '../modules/admin';
import { paymentIntentsCreate } from '../modules/stripe';
import { create } from '../modules/postmates';

export const order = functions.https.onCall(
    async (p, c) => {
        if(!c.auth || !c.auth.uid)
        throw { msg: 'Please re-authenticate.'};
        
        const user = await userDoc(c.auth.uid);
        
        const charge = await paymentIntentsCreate(p, user);

        if(!charge.status) throw {
            msg: 'Charge did not go through.'
        }
            
        const order = o(charge, p);

        await orderDelivery(p, user);

        await add('orders', order);

        await notify(p, user);

        return order;
    }
);










const o = (charge:any, p:any) => {
    return {
        charge: prim(charge),
        ...p
    };
}










const orderDelivery = (p:any, user:any) => {
    let delivery = {};
    delivery = {

    }
    return create(delivery);
}
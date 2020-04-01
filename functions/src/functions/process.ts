import * as functions from 'firebase-functions';

import { prim } from '../modules/utl';
import { 
//     add, 
//     notify, 
    userDoc, 
    docGet
} from '../modules/admin';
import { paymentIntentsCreate } from '../modules/stripe';
import { 
    quote, 
    phoneParam,
    create 
} from '../modules/postmates';

export const order = functions.https.onCall(
    async (p, c) => {
        if(!c.auth || !c.auth.uid)
        throw { msg: 'Please re-authenticate.'};
        
        const user = await userDoc(c.auth.uid);

        let order:any = await docGet('orders', p.orderId);

        const kitchen:any = await docGet('kitchens', order.kitchenId);
        
        const quote = await quoteCheck({
            pickup: kitchen.address, 
            dropoff: p.customerAddress
        });
      
        const charge = await paymentIntent({
            accountId: kitchen.accountId, 
            deliveryFee: quote.fee,
            amount: 1500
        }, user);
            
        const delivery = await orderDelivery({
            pickup_name: kitchen.name,
            pickup: kitchen.address, 
            pickup_phone_number: kitchen.phone,
            // dropoff_name: user.displayName,
            dropoff: p.customerAddress,
            dropoff_phone_number: p.customerPhone
        });
        
        order = o(order, charge);
        
        // await update(`orders/${p.orderID}`, order);

        // await notify(p, user);

        return order;
        console.log(delivery);
    }
);










const o = (order:any, charge:any) => {
    return {
        charge: prim(charge),
        status: "pending",
        ...o
    };
}










async function quoteCheck(p:any) {
    let params = quoteParams(p.pickup, p.dropoff);
    let result = await quote(params);
    if(!result)
    throw {
        msg: 'Delivery is currently unavailable in your area. Payment was not processed.'
    };
    return result;
}

const quoteParams = (pickup_address:any, dropoff_address:any) => {
    let params = {      
        pickup_address: `${pickup_address.line1}, ${pickup_address.city}, ${pickup_address.state}`,
        dropoff_address: `${dropoff_address.line1}, ${dropoff_address.city}, ${dropoff_address.state}`
    };
    return params;
}

async function paymentIntent(p: any, user: FirebaseFirestore.DocumentData | undefined) {
    const charge = await paymentIntentsCreate(p, user);
    if (!charge.status)
        throw {
            msg: 'Charge did not go through.'
        };
    return charge;
}

const orderDelivery = (p:any) => {
    let delivery = deliveryParams(p);
    return create(delivery);
}

const deliveryParams = (p:any) => {
    let params = {
        manifest: p.manifest || "Food stuffs",
        pickup_name: p.pickup_name || "Homefry Kitchen Partner",
        pickup_phone_number: phoneParam(p.pickup_phone_number),
        dropoff_name: p.dropoff_name || "Homefry Orderer",
        dropoff_phone_number: phoneParam(p.dropoff_phone_number),
        ...quoteParams(p.pickup, p.dropoff),
    };
    return params;
}
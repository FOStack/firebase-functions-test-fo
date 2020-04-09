import * as functions from 'firebase-functions';

import { prim } from '../modules/utl';
import { 
    add, 
    userDoc, 
    docGet
//     notify, 
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
        
        const user:any = await userDoc(c.auth.uid);

        // let order:any = await docGet('orders', p.orderId);

        const kitchen:any = await docGet('kitchens', p.kitchenId);
        
        const quote = await quoteCheck({
            pickup_address: kitchen.address, 
            dropoff_address: p.customerAddress
        });

        const amount = subTotal(p.items);
      
        const charge = await paymentIntent({
            accountId: kitchen.accountId, 
            deliveryFee: quote.fee,
            amount: amount
        }, user);
            
        const delivery = await orderDelivery({
            pickup_name: kitchen.name,
            pickup_address: kitchen.address, 
            pickup_phone_number: kitchen.phone,
            ...(user.displayName)?{dropoff_name: user.displayName}:null,
            dropoff_address: p.customerAddress,
            dropoff_phone_number: p.customerPhone
        });
        console.log(delivery);
        
        const order = {
            active: true,
            status: "pending",
            items: p.items,
            user: prim(user),
            charge: prim(charge),
            delivery: prim(delivery),
            fee: quote.fee,
            ...p,
        };
        
        await add(`orders`, order);

        // await notify(p, user);

        return order;
    }
);










async function quoteCheck(p:any) {
    let params = quoteParams(
        p.pickup_address, 
        p.dropoff_address
    );
    let result = await quote(params);
    if(!result)
    throw {
        msg: 'Delivery is currently unavailable in your area. Payment was not processed.'
    };
    return result;
}

const quoteParams = (pa:any, da:any) => {
    let params = { 
        pickup_address: `${pa.line1}, ${pa.city}, ${pa.state}`,
        dropoff_address: `${da.line1}, ${da.city}, ${da.state}`
    };
    return params;
}

const subTotal = (items:Array<any>) => {
    let [amount, count] = [0, 0];
    for(let i of items){
        count += (1*i.quantity);
        amount += (1*i.quantity * i.price);
    }
    console.log(count);
    return amount;
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
        pickup_name: `Homefry Kitchen: ${p.pickup_name||'Partner'}`,
        pickup_phone_number: phoneParam(p.pickup_phone_number),
        dropoff_name: p.dropoff_name || "Homefry Orderer",
        dropoff_phone_number: phoneParam(p.dropoff_phone_number),
        ...quoteParams(p.pickup_address, p.dropoff_address),
    };
    return params;
}
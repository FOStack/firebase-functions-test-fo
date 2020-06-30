import * as functions from 'firebase-functions';

import { prim } from '../modules/utl';
import { 
    add, 
    userDoc, 
    docGet
//     notify, 
} from '../modules/admin';
// import { paymentIntentsCreate/*, chargesCreate*/ } from '../modules/stripe';
import { 
    quote, 
    phoneParam,
    create 
} from '../modules/postmates';
import * as notification from '../services/notification';
// import { user } from 'firebase-functions/lib/providers/auth';

export const doc = {
    get: docGet,
    user: userDoc
}

export const col = {
    add: add
}

// export const order = functions.https.onCall(
//     async (p, c) => {
//         if(!c.auth || !c.auth.uid)
//         throw { msg: 'Please re-authenticate.'};
        
//         const user:any = await userDoc(c.auth.uid);

//         // let order:any = await docGet('orders', p.orderId);

//         const kitchen:any = await docGet('kitchens', p.kitchenId);
//         if(!kitchen) throw { msg: 'No kitchen record available' };
        
//         const quoteObject = await quoteCheck({
//             pickup_address: kitchen.address, 
//             dropoff_address: p.customerAddress
//         });

//         const amount = subTotal(p.items);
      
//         const charge = await paymentIntent({
//             accountId: kitchen.accountId, 
//             deliveryFee: quoteObject.fee,
//             amount: amount
//         }, user);
            
//         const deliveryObject = await orderDelivery({
//             pickup_name: kitchen.name,
//             pickup_address: kitchen.address, 
//             pickup_phone_number: kitchen.phone,
//             ...(user.displayName)?{dropoff_name: user.displayName}:null,
//             dropoff_address: p.customerAddress,
//             dropoff_phone_number: p.customerPhone,
//             ...(quoteObject.id)?{quote_id: quoteObject.id}:null
//         });
//         console.log(deliveryObject);
        
//         const orderObject = {
//             active: true,
//             status: "pending",
//             items: p.items,
//             user: prim(user),
//             charge: prim(charge),
//             delivery: prim(deliveryObject),
//             fee: quoteObject.fee,
//             ...p,
//         };
        
//         await add(`orders`, orderObject);

//         // await notify(p, user);

//         return orderObject;
//     }
// );



export const order = functions.https.onCall(
    async (p:any, c: any) => {
        try {
            const order = {
                customer: await userDoc(c?.auth?.uid),
                merchant: await docGet('merchants', p?.merchantId),
                items: p.items,
            }
            console.log(subTotal(p.items));
            return await col.add(`orders`, order);
        } catch (e) {
            throw e;
        }
    }
);



export const delivery = functions.https.onCall(
    async (p, c) => {
        const quoteD = await quoteCheck({
            pickup_address: p.pickup_address, 
            dropoff_address: p.dropoff_address
        });
        console.log(quoteD); 
        
        // const amount = quoteD.fee + 150;
        // console.log(amount);

        // const charge = await chargesCreate({
        //     amount: amount,
        //     source: p.source,
        //     ...(p.customer)?{customer: p.customer}:null,
        //     ...(p.receipt_email)?{receipt_email: p.receipt_email}:null
        // })
        // console.log(charge);
            
        const deliveryO = await orderDelivery({
            ...p,
            ...(quoteD.id)?{quote_id: quoteD.id}:null
        });
        console.log(deliveryO);
        
        const processedOrder = {
            active: true,
            status: "pending",
            ...(p.manifest)?{items: [{name: p.manifest}]}:null,
            // charge: prim(charge),
            delivery: prim(deliveryO)
        };
        
        await add(`orders`, processedOrder);

        return processedOrder;
    }
);



export const notifications = functions.firestore.document('orders/{orderId}').onCreate(
    async (s:any, c:any) => {
        try {
            return await notification.messages(s.data());
        } catch(e) {
            throw e;
        }
    }
);










async function quoteCheck(p:any) {
    const params = quoteParams(
        p.pickup_address, 
        p.dropoff_address
    );
    const result = await quote(params);
    if(!result)
    throw {
        msg: 'Delivery is currently unavailable in your area. Payment was not processed.'
    };
    return result;
}

const quoteParams = (pa:any, da:any) => {
    const params = { 
        pickup_address: (pa.line1)?`${pa.line1}, ${pa.city}, ${pa.state}`:pa,
        dropoff_address: (da.line1)?`${da.line1}, ${da.city}, ${da.state}`:da
    };
    return params;
}

const subTotal = (items:Array<any>) => {
    let [amount, count] = [0, 0];
    for(const i of items){
        count += (1*i.quantity);
        amount += (1*i.quantity * i.price);
    }
    console.log(count);
    return amount;
}

// async function paymentIntent(p: any, user: FirebaseFirestore.DocumentData | undefined) {
//     const charge = await paymentIntentsCreate(p, user);
//     if (!charge.status)
//         throw {
//             msg: 'Charge did not go through.'
//         };
//     return charge;
// }

const orderDelivery = (p:any) => {
    const deliveryP = deliveryParams(p);
    return create(deliveryP);
}

const deliveryParams = (p:any) => {
    const params = {
        manifest: p.manifest || "Food stuffs",
        pickup_name: `Homefry - ${p.pickup_name||'Partner'}`,
        pickup_phone_number: phoneParam(p.pickup_phone_number),
        dropoff_name: p.dropoff_name || "Homefry Orderer",
        dropoff_phone_number: phoneParam(p.dropoff_phone_number),
        ...quoteParams(p.pickup_address, p.dropoff_address),
        ...(p.pickup_business_name)?{pickup_business_name: p.pickup_business_name}:null,
        ...(p.pickup_notes)?{pickup_notes: p.pickup_notes}:null,
        ...(p.dropoff_business_name)?{dropoff_business_name: p.dropoff_business_name}:null,
        ...(p.dropoff_notes)?{dropoff_notes: p.dropoff_notes}:null,
        ...(p.quote_id)?{quote_id: p.quote_id}:null
    };
    return params;
}










export const payout = async (payees:any, order:any) => {
    try {
        const pay: any = {};
        
        // const provider = order?.payment?.type;
        // const commission = (provider != 'stripe')?

        // pay?.[provider](payee);

        return pay;

    } catch(e) {
        console.log(e);
        
    }
}
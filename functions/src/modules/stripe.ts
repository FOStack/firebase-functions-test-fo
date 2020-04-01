import * as functions from 'firebase-functions';
import * as Stripe from 'stripe';

export const stripe = new Stripe(functions.config().stripe.homefry);










export const paymentIntentsCreate = async (p:any, user:any) => {
    
    const fee = Math.floor(0.075 * (p.amount || p.total)) + 50 + (p.deliveryFee||0);
    
    const params = {
        customer: user.customerId,
        amount: p.amount || p.total,
        currency: p.currency || "usd",
        payment_method: user.source,
        application_fee_amount: fee,
        on_behalf_of: p.accountId,
        transfer_data: {
            destination: p.accountId
        },
        // capture: capture || false
    };
    
    // const transfer_group = db.collection("tmp").doc().id;
    // const capture = p.accepted;
    

    const paymentIntent = await stripe.paymentIntents.create(params);
    
    return paymentIntent; 
}
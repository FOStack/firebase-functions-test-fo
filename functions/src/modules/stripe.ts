import * as functions from 'firebase-functions';
import * as Stripe from 'stripe';

export const stripe = new Stripe(functions.config().stripe.homefry);

export const paymentIntentsCreate = (p:any, user:any) => {
    // let r:any = {};

    const amount = p.amount || p.total;
    const currency = p.currency || 'usd';
    const customer = user.customerId;
    const source = user.source;
    const accountId = /**/p.seller.accountId;//*/"acct_1FPAyTHJfaumqsIl";
    
    // const transfer_group = db.collection("tmp").doc().id;
    // const capture = p.accepted;
    
    const fee = Math.floor(0.075 * amount) + 50;

    return stripe.paymentIntents.create({
        customer: customer,
        amount: amount,
        currency: currency || "usd",
        payment_method: source,
        application_fee_amount: fee,
        on_behalf_of: accountId,
        transfer_data: {
            destination: accountId
        },
        // capture: capture || false
    });
    
    // return r; 
}
import * as functions from 'firebase-functions';

export const order = functions.https.onCall(
    async (p, c) => {
        if(!c.auth || !c.auth.uid)
        throw { msg: 'Please re-authenticate.'};
        console.log('hi');
        return p;
        // const user: any = await userDoc(c.auth.uid);
        // if(!user) throw { msg: 'No record for this user...'};

        // const amount = p.amount || p.total;
        // const currency = p.currency || 'usd';
        // const customer = user.customerId;
        // const source = user.source;
        // const accountId = /**/p.seller.accountId;//*/"acct_1FPAyTHJfaumqsIl";
        
        // // const transfer_group = db.collection("tmp").doc().id;
        // // const capture = p.accepted;
        
        // const fee = Math.floor(0.075 * amount) + 50;
        
        // if(amount < 1000)
        // throw {
        //     msg: 'Amount is too low to complete order.'
        // };
        // if(!source) 
        // throw {
        //     msg: 'Please add a card to process payment.'
        // };
        
        // const charge = await stripe.paymentIntents.create({
        //     customer: customer,
        //     amount: amount,
        //     currency: currency || "usd",
        //     payment_method: source,
        //     application_fee_amount: fee,
        //     on_behalf_of: accountId,
        //     transfer_data: {
        //         destination: accountId
        //     },
        //     // capture: capture || false
        // })

        // if(!charge.status)
        // throw {
        //     msg: 'Charge did not go through.'
        // }
            
        // const order = {
        //     charge: prim(charge),
        //     ...p
        // };

        // await db.collection('orders').add(order);

        // if(user.token && user.token != ""){
        //     // Notification content
        //     const payload = {
        //         notification: {
        //             title: 'Preparing Order',
        //             body: `${p.seller.name} has recieved your order.`,
        //             sound: 'default'
        //         } 
        //     };
        //     await message.sendToDevice(user.token, payload);
        // }

        // return order;
    }
);
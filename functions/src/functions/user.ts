import * as functions from 'firebase-functions';
import * as admin from './../modules/admin';
import { stripe } from './../modules/stripe';

// Interfaces
import { User } from './../models/user';







///// USERS /////










export const create = functions.auth.user().onCreate(
    async (event) => {
        try {
            const user: User = userObject(event);
            user.customerId = await stripeCustomerCreatedId(user)
            return userAdd(user.uid, user)
        } catch(e) {
            throw {msg: 'User creation unsuccessful.'}
        }
    }
);










export const update = functions.https.onCall(
    async (p, c) => {
        if(!c.auth)
        throw { msg: 'Please re-authenticate.'};
        const user = c.auth;
        const data: User = (p)?p:{};
        return admin.update('users', user.uid, data)
    }
);










export const remove = functions.auth.user().onDelete(
    async (event) => {
        try {
            const user: any = await admin.userDoc(event.uid);
            await stripeCustomerDelete(user.customerId);
            const status = await admin.del('users', event.uid);
            return status;
        } catch(e) {
            throw {msg: 'User deletion unsuccessful.'};
        }
    }
);










///// USER: STRIPE /////










export const userSourceAdd = functions.https.onCall(
async (p, c) => { try {
    if(!c.auth || !c.auth.uid)
    throw { msg: 'Please re-authenticate.'};
    if(!p.source || !p.source.id)
    throw { msg: 'No card data available'};
    
    // 
    
    const user: any = (p.customerId)?{...c.auth,...p}:await admin.userDoc(c.auth.uid);
    
    const card: any = 
    
    await stripe.customers.createSource(
        user.customerId,
        {source: p.source.id}
    )
    
    if(card && p.primary === true){
        await admin.update('users', user.uid, {source: p.source.id})
    } else { throw { msg: 'Adding the card was not successful.' } }

    const list = {
        card: {...card, primary: p.primary || null }|| null,
        ...await stripeCustomersListSources(user.customerId)
    };

    return list;

} catch (e) { throw e; }});










export const userSourceDelete = functions.https.onCall(
async (p, c) => { try {
    if(!c.auth || !c.auth.uid)
    throw { msg: 'Please re-authenticate.'};

    const user: any = await admin.userDoc(c.auth.uid);
    if(!user) throw { msg: 'No record for this user...'};
    
    

    const status = await stripe.customers.deleteSource(
        user.customerId,
        p
    );

    const list = {
        status: status || null,
        ...await stripeCustomersListSources(user.customerId)
    };

    return list;

} catch (e) { throw e; }})










export const userSourceList = functions.https.onCall(
async (p, c) => { try {
    if(!c.auth || !c.auth.uid)
    throw { msg: 'Please re-authenticate.'};

    const user: any = await admin.userDoc(c.auth.uid);
    if(!user) throw { msg: 'No record for this user...'};

    const list = await stripeCustomersListSources(user.customerId);

    return list;
} catch (e) { throw e; }});










// export const userChargeslist = functions.https.onCall(
//     async (p, c) => {
//         return p;
//     }
// );










///// HELPER FUNCTIONS: FIREBASE - USER /////










const userObject = (event: any) => {
    return {
        createdAt: event.createdAt || null,
        customerId: event.customerId || null,
        disabled: event.disabled || false,
        displayName: event.displayName || null,
        email: event.email || null,
        emailVerified: event.emailVerified || false,
        photoURL: event.photoURL || null,
        source: event.source || null,
        token: event.token || null,
        uid: event.uid || null,
        notifications: notificationsObject() || null
    };
}










const notificationsObject = () => {
    return {
      makeOrder: {
        push: true,
        email: true,
        desc: 'Get notifications when a kitchen recieves your order. ',
        name: 'Making orders',
      }, 
      recieveOrder:{
        push: true,
        email: true,
        desc: 'Get notifications when a customer places an order with you.',
        name: 'Recieving orders',
      }, 
      updates:{
        push: true,
        email: true,
        desc: 'Get notifications whenever there is an update to the terms & privacy policies.',
        name: 'Policy changes',
      },
      promotions: {
        push: true,
        email: true,
        desc: 'Get notifications about weekly/daily promotions by partnering kitchens.',
        name: 'Promotions',
      }
    };
}










const userAdd = (d:string, data:any) => {    
    return admin.db.doc(`users/${d}`).set(data);
}










// const userCheck = async (data:any) => {
//     if(!data.notifications){
//         data.notifications = notificationsObject();
//     }
//     await db.doc(`users/${data.uid}`).update(data);
//     return true;
// }










///// HELPER FUNCTIONS: STRIPE - USER /////










const stripeCustomerCreatedId = async (user: User) => {
    
    const customer = await stripe.customers.create({
        email: user.email,
        metadata: {uid: user.uid} 
    })
    return customer.id
}










const stripeCustomerDelete = (cid: string) => {        
    
    return stripe.customers.del(cid);
}










const stripeCustomersListSources = async (cid: string) => {
    
    return await stripe.customers.listSources(
        cid,
        {object: 'source'}
    );
}
import * as functions from 'firebase-functions';

import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

import { 
    db, 
    storage, 
    userDoc, 
    docGet, 
    docSet, 
    add,
    update,
    del
} from './modules/admin';
import { stripe } from './modules/stripe';

// Interfaces
import { User } from './models/user';

// Functions
export * as kitchen from './functions/kitchen';
export * as postmates from './functions/postmates';
export * as process from './functions/process';










// Cloud Functions will go here...










export const appHomefry = functions.https.onCall(
    async (p, c) => { 
        return {
            v: 1,
            md: {v: 1, l: 'market://details?id=com.fostack.homefry'},
            ios: {v: 1, l: ''},
        };
    }
);










// export const appKitchen = functions.https.onCall(
//     async (p, c) => { 
//         return {
//             v: 1,
//             md: {v: 1, l: 'market://details?id=com.fostack.homefry'},
//             ios: {v: 1, l: ''},
//         };
//     }
// );










// export const appRunner = functions.https.onCall(
//     async (p, c) => { 
//         return {
//             v: 1,
//             md: {v: 1, l: 'market://details?id=com.fostack.homefry'},
//             ios: {v: 1, l: ''},
//         };
//     }
// );







///// USERS /////










export const userCreate = functions.auth.user().onCreate(
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










export const userUpdate = functions.https.onCall(
    async (p, c) => {
        if(!c.auth)
        throw { msg: 'Please re-authenticate.'};
        const user = c.auth;
        const data: User = (p)?p:{};
        return update('users', user.uid, data)
    }
);










export const userDelete = functions.auth.user().onDelete(
    async (event) => {
        try {
            const user: any = await userDoc(event.uid);
            await stripeCustomerDelete(user.customerId);
            const status = await del('users', event.uid);
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
    
    const user: any = (p.customerId)?{...c.auth,...p}:await userDoc(c.auth.uid);
    
    const card: any = 
    
    await stripe.customers.createSource(
        user.customerId,
        {source: p.source.id}
    )
    
    if(card && p.primary === true){
        await update('users', user.uid, {source: p.source.id})
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

    const user: any = await userDoc(c.auth.uid);
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

    const user: any = await userDoc(c.auth.uid);
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
    return db.doc(`users/${d}`).set(data);
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






















































































































































































































///// KITCHENS /////










export const kitchenCreate = functions.https.onCall(
async (p, c) => {
    if(!c.auth)
    throw { msg: 'Please re-authenticate.'};
    // return p;
    const k: any = p; k.address = {};
    k.uid = c.auth.uid;

    const ki = await docGet(`kitchens`, k.uid);
    if(ki) return ki;

    // k.id = docId();

    k.accountId = await stripeAccountCreatedId(k, c.rawRequest.ip);
    // return add('kitchens', k);
    return docSet(`kitchens/${k.uid}`, k)
});










export const kitchenUpdate = functions.https.onCall(
async (p, c) => {
    if(!c.auth)
    throw { msg: 'Please re-authenticate.'};
    const id: any = p.kid || p.id;
    return update('kitchens', id, p);
});










export const kitchenAccountRetrieve = functions.https.onCall(
async (p, c) => {
    if(!c.auth)
    throw { msg: 'Please re-authenticate.'};
    return await stripe.accounts.retrieve(p.id||p.accountId||p);
});










export const kitchenAccountUpdate = functions.https.onCall(
async (p, c) => {
    if(!c.auth)
    throw { msg: 'Please re-authenticate.'};
    if(!p.data || (!p.data.individual && !p.data.company))
    throw { msg: 'Missing entity data.'};
    p.data.individual.verification = undefined;
    return await stripe.accounts.update(p.id, p.data);
});










export const kitchenAccountIdentityDocuments = functions.storage.bucket('ts-felixo-verification').object().onFinalize(
async (object) => {
    const contentType = object.contentType || '';

    if (!contentType.startsWith('image/'))
        return 'This is not an image.';

    const filePath = object.name || '';
    const meta = object.metadata || {}; // Get AccountId...

    if(!meta.accountId)
        return "No id";

    const d: any = {
        name: path.basename(filePath)||'',
        path: filePath,
        purpose: 'identity_document',
        bucket: 'ts-felixo-verification',
        accountId: meta.accountId
    };

    const file = await stripeFileCreatedId(d);

    return file; // Add update impl...
});










// export const kitchenDelete = functions.https.onCall(
// async (p, c) => {
//     const id: any = p.kid || p.id || p;
//     return del('kitchens', id);    
// });










// export const kitchenRecords = functions.https.onCall(
// async (p, c) => {
//     const id: any = p.kid || p.id;
//     stripe.accounts.retrieve(p.accountId,)
//     return update('kitchens', id, p);    
// });










// export const kitchenExternalAccountAdd = functions.https.onCall(
// async (p, c) => {
//     try {
//         if(!c.auth || !c.auth.uid)
//         throw { msg: 'Please re-authenticate.'};
        
//         
        
//         const kid = p.kid || p.id;
        
//         const eA = await stripe.accounts.createExternalAccount(
//             p.accountId,
//             {external_account: p.external_account.id}
//         )
        
//         await add(`kitchens/${kid}/externalaccounts`, p.external_account)
        
//         if(p.primary == true){
//             await update('kitchens', kid, {external_account: p.external_account.id})
//         }
        
//         return eA;
//         // return p;
//     } catch (e) {
//         throw e;
//     }    
// });
    
    
    
    
    
    
    
    
    
    
// export const kitchenExternalAccountUpdate = functions.https.onCall(
// async (p, c) => {
//     try {
//         if(!c.auth || !c.auth.uid)
//         throw { msg: 'Please re-authenticate.'};
        
//         

//         const kid = p.kid || p.id;
//         const eA = await stripe.accounts.updateExternalAccount(
//             p.accountId,
//             p.external_account.id,
//             {metadata: {}}
//         )
//         await add(`kitchens/${kid}/externalaccounts`, p.external_account)
//         if(p.primary == true){
//             await update('kitchens', kid, {external_account: p.external_account.id})
//         }
//         return eA;
//         // return p;
//     } catch (e) {
//         throw e;
//     }    
// });
    
    
    
    
    
    
    
    
    
    
    ///// ITEMS /////
    
    
    
    
    
    
    
    
    
    
export const itemAdd = functions.https.onCall(
    async (p, c) => {
        if(!c.auth)
        throw { msg: 'Please re-authenticate.'};
        const i: any = p;
        i.uid = c.auth.uid;
        return add(`kitchens/${p.kid}/items`, i);
    }
);
    
    
    
    
    
    
    
    
    
    
export const itemUpdate = functions.https.onCall(
    async (p, c) => {
        if(!c.auth)
        throw { msg: 'Please re-authenticate.'};
        const id: any = p.iid || p.id || p;
        return update(`kitchens/${p.kid}/items`, id, p);    
    }
);
    
    
    
    
    
    
    
    
    
    
export const itemDelete = functions.https.onCall(
    async (p, c) => {
        if(!c.auth)
        throw { msg: 'Please re-authenticate.'};
        const id: any = p.iid || p.id || p;
        return del(`kitchens/${p.kid}/items`, id);    
    }
);










///// HELPER FUNCTIONS: STRIPE /////










const stripeAccountCreatedId = async (k: any, ip?: any) => {

    const bp = k.business_profile;

    const account = await stripe.accounts.create({
        type: 'custom',
        metadata: {
            kid: k.id||k.uid,
            uid: k.uid
        },
        country: k.address.country || 'US',
        ...(k.email)?{email: k.email}:null,
        requested_capabilities: [
            'card_payments',
            'transfers'
        ],
        ...(k.business_type)?{
            business_type: k.business_type
        }:null,
        ...(k.business_profile)?{ business_profile: {
          mcc: (bp)?(bp.mcc||'5499'):'5499',
          url: k.business_profile.url||`https://homefryapp.com/kitchen?=${k.id}`,
        } }:null,
        ...(k.business_type === "individual")?{ individual: {
            first_name: k.first_name||k.name,
            last_name: k.last_name,
            address: k.address,
            dob: k.dob,
            email: k.email,
            phone: k.phone,
            ssn_last_4: k.ssn_last_4,
            verification: k.verification
        } }:null,
        ...(k.business_type === "company")?{ company: {
            name: k.name,
            address: k.address,
            directors_provided: false,
            owners_provided: k.owners_provided,
            phone: k.phone,
            tax_id: k.tax_id,
            tax_id_registrar: k.tax_id_registrar,
            vat_id: k.vat_id
        } }:null,
        ...(ip)?{ tos_acceptance: {
            date: Math.floor(Date.now() / 1000),
            ip: ip // Assumes you're not using a proxy
        } }:null
    })
    return account.id
}










const stripeFileCreatedId = async (d: any) => {

    const tempFilePath = path.join(os.tmpdir(), d.name);
    
    await storage.bucket(d.b||d.bucket||null)
    .file(d.path||d.filePath)
    .download({
        destination: tempFilePath
    });

    const data = fs.readFileSync(tempFilePath);

    const file = await stripe.files.create({
        file: {
            data: data,
            name: d.name,
            type: 'application/octet-stream'
        },
        purpose: d.purpose
    }, {...(d.accountId)?{
        stripe_account: d.accountId
    }:null});

    fs.unlinkSync(tempFilePath);
    
    return file.id;
}










////////// SNIPPETS ///////////


// let d = p.data.individual.verification.document;
// if(!(d.front.includes("file_"))){
//     p.data.individual.verification.document.front = await stripeFileCreatedId({
//         data: d.front,
//         name: 'front.jpg',
//         purpose: 'identity_document'
//     })
// }
// if(!(d.back.includes("file_"))){
//     p.data.individual.verification.document.back = await stripeFileCreatedId({
//         data: d.back,
//         name: 'back.jpg',
//         purpose: 'identity_document'
//     })
// }


// identitySet: event.identitySet || false,
// identityVerified: event.identityVerified || false,
// payoutSet: event.payoutSet || false,

import * as functions from 'firebase-functions';

import * as path from 'path';

import { 
    docGet, 
    docSet, 
    add,
    update,
    del
} from './modules/admin';

import { 
    stripe, 
    stripeAccountCreatedId, 
    stripeFileCreatedId 
} from './modules/stripe';

// Functions
export * as kitchen from './functions/kitchen';
export * as process from './functions/process';
export * as notify from './functions/notify';
export * as go from './functions/go';
export * as user from './functions/user';
export * as merchant from './functions/merchant';










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

import * as admin from 'firebase-admin';
admin.initializeApp();

export const db = admin.firestore();
export const storage = admin.storage();
export const message = admin.messaging();










export const userDoc = async (uid: string) => {
    let user = await db.collection('users').doc(uid).get();
    return user.data();
}










export const docGet = async (c:string, d:string) => {    
    let doc = await db.collection(c).doc(d).get();
    if(!doc) throw {msg: 'Record not available.'}
    return doc.data();
}










export const add = (r:string, data:any) => {    
    return db.collection(r).add(data);
}










export const notify = async (p:any, user:any) => {
    let r = {};
    if(user.token && user.token != ""){
        // Notification content
        const payload = {
            notification: {
                title: 'Preparing Order',
                body: `${p.seller.name} has recieved your order.`,
                sound: 'default'
            } 
        };
        r = await message.sendToDevice(user.token, payload);
    }
    return r;
}
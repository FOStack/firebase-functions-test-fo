import * as admin from 'firebase-admin';
admin.initializeApp();

export const db = admin.firestore();
export const storage = admin.storage();
export const message = admin.messaging();










export const userDoc = async (uid: string) => {
    const user = await db.collection('users').doc(uid).get();
    return user.data();
}










///// HELPER FUNCTIONS: FIREBASE /////










export const docId = () => {
    return db.collection(``).doc().id;
}










export const docGet = async (c:string, d:string) => {    
    const doc = await db.collection(c).doc(d).get();
    return (doc.exists)?doc.data():undefined;
}










export const docSet = (r:string, data:any) => {    
    return db.doc(r).set(data);
}










export const update = (r:string, d:string, data:any) => {    
    return db.collection(r).doc(d).update(data);
}










export const del = (r: string, id: string) => {
    return db.collection(r).doc(id).delete()
}










export const add = (r:string, data:any) => {    
    return db.collection(r).add(data);
}










export const col = (p:any) => {    
    const ref = db.collection(p.ref);
    if(Array.isArray(p)){
        p.forEach((v:any) => {
            ref.where(v.field, v.operator||v.op||'==', v.query);
        });
    } else {
        ref.where(p.field, p.operator||p.op||'==', p.query);
    }
    return ref;
}










export const notify = async (p:any, user:any) => {
    let r = {};
    if(user.token && user.token !== ""){
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
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










export const list = async (p:any) => {    
    
    let data: any;

    const query = await col(p).get();

    if(!query.empty) {
        const snapshot = query.docs;
        data = [];
        snapshot.forEach(d => {
            let dt = d.data();
            if(p.delete){
                delete dt[p.delete];
            }
            data.push(dt);
        });
    }

    return (data)?data:undefined;
}










export const docs = async (p:any, i?:any) => {    
    
    let data: any;

    const query = await col(p).get();

    if(!query.empty) {
        const snapshot = query.docs[i||0];
        data = snapshot.data();
        data.id = snapshot.id;
    }

    return (data)?data:undefined;
}












export const sendMessage = async (p:any) => {
    const payload = {
        notification: {
            title: p.title,
            body: p.body,
            sound: p.sound||'default'
        },
        webpush: {
            notification: {
                vibrate: p.vibrate||[100,200,250,100]
            }
        }
    };
    return await message.sendToDevice(p.token, payload);
}










export const timestamp = (d?: any) => {
    const stamp = admin.firestore.Timestamp;//[(d)?'fromDate':'now'];
    return (d)?stamp.fromDate(d):stamp.now()
}
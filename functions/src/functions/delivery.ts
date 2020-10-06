import * as functions from 'firebase-functions';
import { 
    db,
    timestamp,
    // storage
} from '../modules/admin';

// interface Workers {
//     [key: string]: (options: any) => Promise<any>
// }

// // Example Worker
// const perform: Workers = {
//     update: (p: any) => db.collection('deliveries').doc(p.id).update(p.data)
// }










///// SCHEDULE /////





// export const schedule = functions.runWith({memory: '2GB'}).pubsub
// .schedule('0 0 1 1 *').onRun(async context => {

//     const jobs: Promise<any>[] = [];
//     const queue = await deliveries();
    
//     queue.forEach(i => {
//         const job = i.ref.update({ 
//             status: 'scheduled', 
//             cid: null,
//             courier: null
//         });
//         jobs.push(job);
//     });

//     return await Promise.all(jobs);

// });





// export const deliveries = async () => {
//     const query = db.collection('deliveries')
//     return await query.get();
// }










///// SHIFT /////





export const shift = functions.runWith({memory: '2GB'}).pubsub
.schedule('15 6 * * *').onRun(async context => {

    let day: any = {drivers:[]};
    const queue = await drivers();
    
    queue.forEach((i) => {
        let d = {...i.data(), id: i.id, orders: 0};
        day.drivers.push(d);
    });

    return await shiftsRef.set(day);

});





export const drivers = async () => {
    const query = db.collection('drivers');
    return await query.get();
}





export const today = () => {
    return new Date().toISOString().slice(0,10);
}










///// TASKS /////





export const tasks = functions.runWith({memory: '2GB'}).pubsub
.schedule('0 8-19/2 * * *').onRun(async context => {

    const jobs: Promise<any>[] = [];
    const queue = await scheduled();

    const shifts: any = await shiftsRef.get();
    let {drivers} = shifts.data();
    
    queue.forEach(i => {
        const l = drivers.reduce((a:any,b:any) => a.orders<b.orders?a:b);
        const j = drivers.findIndex((d: any) => d == l);
        const job = i.ref.update({ 
            status: 'assigned', 
            cid: drivers[j]?.id||null,
            courier: {
                id: drivers[j]?.id||null,
                payoutType: "paypal",
                payoutId: drivers[j]?.email||null
            }
        });
        jobs.push(job);
        drivers[j].orders += 1;
    });
    
    await shiftsRef.update({drivers});

    return await Promise.all(jobs);

});





export const scheduled = async () => {
    const now = timestamp();
    const query = db.collection('deliveries')
                    .where('performAt', '<=', now)
                    .where('status', '==', 'scheduled');
    return await query.get();
}





export const shiftsRef = db.collection('shifts').doc(today());










///// PAYOUT /////





export const payout = functions.runWith({memory: '2GB'}).pubsub
.schedule('0 22 * * *').onRun(async context => {

    const jobs: Promise<any>[] = [];
    const queue = await payouts();
    
    queue.forEach(async i => {
        const j = i.ref;
        const details: any = await j.get();
        
        await pay(details?.courier);

        const job = j.update({ 
            paidout: true
        });
        jobs.push(job);
    });

    return await Promise.all(jobs);

});





export const payouts = async () => {
    const query = db.collection('deliveries')
                    .where('paidout', '==', false)
                    .where('status', '==', 'completed');
    return await query.get();
}





export const pay = (p: any) => {
    const {payoutId, payoutType} = p?.courier;
    console.log({payoutId, payoutType});
}
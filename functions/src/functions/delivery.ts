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



export const tasks = functions.runWith({memory: '2GB'}).pubsub
.schedule('0 8-19/2 * * *').onRun(async context => {

    const jobs: Promise<any>[] = [];
    const now = timestamp();

    const query = db.collection('deliveries')
                    .where('performAt', '<=', now)
                    .where('status', '==', 'scheduled');
    const queue = await query.get();

    const query2 = db.collection('drivers');
    const driverRefs = await query2.get();
    let drivers: any = [];

    driverRefs.forEach(d => {
        const cid = d.ref.id;
        drivers.push({
            cid,
            orders: 0
        });
    });
    
    queue.forEach(i => {
        const l = drivers.reduce((a:any,b:any) => a.count<b.count?a:b);
        const j = drivers.findIndex((d: any) => d == l);
        const job = i.ref.update({ 
            status: 'assigned', 
            cid: drivers[j].cid
        });
        jobs.push(job);
        drivers[j].count += 1;
    });

    return await Promise.all(jobs);

});

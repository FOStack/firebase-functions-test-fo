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
    queue.forEach(i => {
        const job = i.ref.update({ status: 'assigned', cid: 'djjd2iu29d2kkj2kmc9' });
        jobs.push(job);
    });

    return await Promise.all(jobs);

});

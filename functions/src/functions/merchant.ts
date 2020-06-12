import * as functions from 'firebase-functions';
import { docs } from '../modules/admin';

export const get = functions.https.onCall(
async (p:any, c)=> {

    const data = await docs({
        ref: 'merchants',
        field: 'slug',
        query: p.slug
    });

    return data;
});
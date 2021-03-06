import * as functions from 'firebase-functions';
import { docs, list } from '../modules/admin';

export const get = functions.https.onCall(
async (p:any, c)=> {

    let data = await docs({
        ref: 'merchants',
        field: 'slug',
        query: p.slug
    });

    data.items = await list({
        ref: 'items',
        field: 'mid',
        op: '==',
        query: data.id
    });

    return data;
});
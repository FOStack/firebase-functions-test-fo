import * as functions from 'firebase-functions';
const rp = require('request-promise');
const key = Buffer.from(functions.config().postmates.key + ':').toString('base64');
const customerId = functions.config().postmates.customerid;

const headers = {
    'Authorization': `Basic ${key}`
};
const base = `https://api.postmates.com`;

export const quote = (delivery:any) => {
    return rp({
        method: 'POST',
        url: `${base}/v1/customers/${customerId}/delivery_quotes`,
        headers: headers,
        json: true,
        body: delivery
    });
}

export const create = (delivery:any) => {
    return rp({
        method: 'POST',
        url: `${base}/v1/customers/${customerId}/deliveries`,
        headers: headers,
        json: true,
        body: delivery
    });
}










export const phoneParam = (n:any) => {
    const last4 = n.slice(-4);
    const mid3 = n.substring((n.length-7),(n.length-4));
    const first3 = n.substring((n.length-10),(n.length-7));
    const param = `${first3}-${mid3}-${last4}`;
    return param;
}
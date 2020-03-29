import * as functions from 'firebase-functions';
import { postmates } from '../';

export const postmatesQuote = functions.https.onCall(
    async (p, c) => { 
        return new Promise((resolve, reject) => {
            const delivery = p;
            postmates.quote(delivery, function(err:any, res:any) {
                if(res){
                    let r = res.body;
                    resolve(r);
                } else {
                    reject(err);
                }
            });
        });
    }
);

export const postmatesDelivery = functions.https.onCall(
    async (p, c) => { 
        return new Promise((resolve, reject) => {
            const delivery = p;
            postmates.new(delivery, function(err:any, res:any) {
                if(res){
                    let r = res.body;
                    resolve(r);
                } else {
                    reject(err);
                }
            });
        });
    }
);
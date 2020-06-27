import * as functions from 'firebase-functions';
import { sendMessage } from './../modules/admin';
import { textMessage, toE164 } from "./../modules/twilio";

const msg: any = {
    twilio: textMessage,
    web: sendMessage
};

export const order = functions.firestore.document('orders/{orderId}').onCreate(
    async (s:any, c:any) => {
        try {
            const { customer, merchant } = s.data();
            const provider = (customer.token && customer.token.length > 1)?'web':'twilio';
            return await msg[provider]({
                token: customer.token||null,
                title: 'Preparing Order',
                body: `You placed an order with ${merchant.name||'a kitchen'} on HomeFry.`,
                to: toE164(customer.phone)||'+16193179360'
            });
        } catch(e) {
            throw e;
        }
    }
);
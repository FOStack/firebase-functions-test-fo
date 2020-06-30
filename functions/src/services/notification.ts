import { sendMessage } from '../modules/admin';
import { textMessage, toE164 } from "../modules/twilio";

const msg: any = {
    twilio: textMessage,
    web: sendMessage
};










export const queue = (order: any) => {

    const tasks: Promise<any>[] = [];

    const { customer, merchant } = order;
            
    const msgs: any = {
        customer,
        merchant
    };

    for (let key in msgs){
        if(msgs.hasOwnProperty(key)){

            const {token, phone} = msgs[key];
            
            const provider = (token && token.length > 1)?'web':'twilio';

            let params: any = {
                token: token||null,
                title: 'New Order',
                to: toE164(phone||'+16193179360')
            }
    
            if(key == 'customer'){
                params.body = `You placed an order with ${merchant.name||'a kitchen'} on HomeFry! We are confirming your order now.`;
            }
    
            if(key == 'merchant'){
                params.body = `A customer has placed an order with you on HomeFry! Please review the order.`;
            }
            
            const task = msg[provider](params);

            tasks.push(task);
        }
    }

    return tasks
}










export const messages = async (tasks: any) => {
    return await Promise.all(queue(tasks));
}
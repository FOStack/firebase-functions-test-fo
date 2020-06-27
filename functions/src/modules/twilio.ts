const functions = require('firebase-functions');

const twilio = require('twilio');

const { sid, token, number } = functions.config().twilio;

const client = new twilio(sid, token);

export const validE164 = (num: string) => {
    return /^\+?[1-9]\d{1,14}$/.test(num)
};

export const toE164 = (num: string) => {
    if(!num.includes('+')){
        if(num.length <= 10){
            num = '+1'+num;
        } else {
            num = '+'+num;
        }
    }
    return num
};

export const textMessage = (p: any) => {
    return client.messages.create({
        body: p.body,
        to: p.to,
        from: number
    });
};
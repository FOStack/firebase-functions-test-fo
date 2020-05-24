let sms = {
    plivo: async (message:any) => {
        return message
    }
};

export const notify = async (p:any) => {
    let notified = false;

    // const prop:string = p.provider || 'plivo';

    const sent = await sms.plivo(p.message);

    notified = (sent)?true:false;

    return notified
};


export const deliveryComplete = async (p:any) => {
    let complete = false;

    // const prop:string = p.provider || 'plivo';

    const order = p.status;

    complete = (order)?true:false;

    return complete
};
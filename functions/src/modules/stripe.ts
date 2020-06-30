import { env } from './../configs/environment';
import { storage } from './admin';

import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as Stripe from 'stripe';

export const stripe = new Stripe(env.stripe.secret);










export const paymentIntentsCreate = async (p:any, user:any) => {
    
    const fee = Math.floor(0.075 * (p.amount || p.total)) + 50 + (p.deliveryFee||0);
    
    const params = {
        customer: user.customerId,
        amount: p.amount || p.total,
        currency: p.currency || "usd",
        payment_method: user.source,
        application_fee_amount: fee,
        on_behalf_of: p.accountId,
        transfer_data: {
            destination: p.accountId
        },
        // capture: capture || false
    };
    
    // const transfer_group = db.collection("tmp").doc().id;
    // const capture = p.accepted;
    

    const paymentIntent = await stripe.paymentIntents.create(params);
    
    return paymentIntent; 
}










export const chargesCreate = async (p:any) => {
    const charge = await stripe.charges.create({
        currency: 'usd',
        amount: p.amount,
        ...(p.source)?{source: p.source}:null,
        ...(p.customer)?{customer: p.customer}:null,
        ...(p.receipt_email)?{receipt_email: p.receipt_email}:null
    })
    return charge
}










///// HELPER FUNCTIONS: STRIPE /////










export const stripeAccountCreatedId = async (k: any, ip?: any) => {

    const bp = k.business_profile;

    const account = await stripe.accounts.create({
        type: 'custom',
        metadata: {
            kid: k.id||k.uid,
            uid: k.uid
        },
        country: k.address.country || 'US',
        ...(k.email)?{email: k.email}:null,
        requested_capabilities: [
            'card_payments',
            'transfers'
        ],
        ...(k.business_type)?{
            business_type: k.business_type
        }:null,
        ...(k.business_profile)?{ business_profile: {
          mcc: (bp)?(bp.mcc||'5499'):'5499',
          url: k.business_profile.url||`https://homefryapp.com/kitchen?=${k.id}`,
        } }:null,
        ...(k.business_type === "individual")?{ individual: {
            first_name: k.first_name||k.name,
            last_name: k.last_name,
            address: k.address,
            dob: k.dob,
            email: k.email,
            phone: k.phone,
            ssn_last_4: k.ssn_last_4,
            verification: k.verification
        } }:null,
        ...(k.business_type === "company")?{ company: {
            name: k.name,
            address: k.address,
            directors_provided: false,
            owners_provided: k.owners_provided,
            phone: k.phone,
            tax_id: k.tax_id,
            tax_id_registrar: k.tax_id_registrar,
            vat_id: k.vat_id
        } }:null,
        ...(ip)?{ tos_acceptance: {
            date: Math.floor(Date.now() / 1000),
            ip: ip // Assumes you're not using a proxy
        } }:null
    })
    return account.id
}










export const stripeFileCreatedId = async (d: any) => {

    const tempFilePath = path.join(os.tmpdir(), d.name);
    
    await storage.bucket(d.b||d.bucket||null)
    .file(d.path||d.filePath)
    .download({
        destination: tempFilePath
    });

    const data = fs.readFileSync(tempFilePath);

    const file = await stripe.files.create({
        file: {
            data: data,
            name: d.name,
            type: 'application/octet-stream'
        },
        purpose: d.purpose
    }, {...(d.accountId)?{
        stripe_account: d.accountId
    }:null});

    fs.unlinkSync(tempFilePath);
    
    return file.id;
}
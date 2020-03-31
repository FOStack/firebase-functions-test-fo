import * as functions from 'firebase-functions';
import * as Stripe from 'stripe';

export const stripe = new Stripe(functions.config().stripe.homefry);
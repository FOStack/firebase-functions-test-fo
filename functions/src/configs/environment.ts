import * as functions from 'firebase-functions';

const config = functions.config();

export const { homefry } = config;

export const env = homefry;

export const environment = env;
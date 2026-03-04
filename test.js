import { BisonJibPayAPI } from './api.js';
const api = new BisonJibPayAPI("https://bison-backend-development-hhgrdbhcbwhahdfk.southeastasia-01.azurewebsites.net", "BwVEfJ2u5y2JPsX8qGxtXlIhHyhu3qU2VW2y6Nf9Qc6KTsETvr");
api.findOperatorFromEnverus("12345").then(console.log).catch(console.error);

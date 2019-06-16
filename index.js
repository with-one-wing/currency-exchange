const got = require('got');
const {getHashKey, getConvertedDate} = require('./util');

const transactionLength = 100;

const baseUrl = 'https://7np770qqk5.execute-api.eu-west-1.amazonaws.com/prod/';

const httpClient = got.extend({baseUrl, json: true});

const transactionRequests = Array(transactionLength).fill().map(_ => httpClient.get('get-transaction'));

(async () => {
    try {
        const response = await Promise.all(transactionRequests);
        const transactions = response.map((item) => item.body);
        const currencyRates = [];

        for (const t of transactions) {
            const transactionDate = getConvertedDate(t['createdAt']);
            const query = new URLSearchParams([['symbols', t['currency']]]);
            const exchangeUrl = t['exchangeUrl'].replace('Y-M-D', transactionDate);

            const resp = (await httpClient.get(exchangeUrl, {query})).body;
            const currencyKey = Object.keys(resp['rates'])[0];
            const hashKey = getHashKey(t['createdAt'], currencyKey);
            currencyRates[hashKey] = resp['rates'][currencyKey];
            console.info(`Process transaction, currency: ${currencyKey} and date: ${transactionDate}`);
        }

        transactions.forEach(t => {
            const hashKey = getHashKey(t['createdAt'], t['currency']);
            t.convertedAmount = Math.round((t.amount / currencyRates[hashKey]) * 1e4) / 1e4;
        });

        const res = await httpClient.post('process-transactions',  {
            body: {transactions},
        });

        console.info('RESULT: ', res.body);

    } catch (error) {
        console.error(error);
    }
})();
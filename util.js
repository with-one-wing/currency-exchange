const getConvertedDate = (date) => {
    const convertedDate = new Date(date);
    const year = convertedDate.getUTCFullYear();
    const month = (convertedDate.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = convertedDate.getUTCDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getHashKey = (date, currency) => getConvertedDate(date) + '_' + currency;

module.exports = {getConvertedDate: getConvertedDate, getHashKey};

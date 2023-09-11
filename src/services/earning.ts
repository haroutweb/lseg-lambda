import axios from 'axios';
import { parse } from 'csv-parse';
import { BadRequestException } from '../exceptions/bad-request-exception';
import { CompanyEarning, Rate, AverageResponse } from '../schemas/earning';
import * as dotenv from 'dotenv';
const envPath = process.env.APP_ENV ? `.env.${process.env.APP_ENV}` : '.env';
dotenv.config({ path: envPath });

export const getData = async (currencies: Array<string>, targetCurrency: string) => {
  const axiosResponse = await axios.request({
    method: 'get',
    url:
      'https://www.alphavantage.co/query' +
      '?function=EARNINGS_CALENDAR' +
      '&horizon=3month' +
      '&apikey=' + process.env.API_KEY
  });

  if (!axiosResponse.data.length || axiosResponse.status !== 200) {
    throw new BadRequestException();
  }

  const data = await parseCSV(axiosResponse.data);
  const rates: Array<Rate> = [];
  let estimateValues = 0;
  let companies: Array<CompanyEarning> = [];

  for (const record of data) {
    if (!record.estimate || !currencies.includes(record.currency)) {
      continue;
    }

    if (record.currency !== targetCurrency) {
      let rate: Rate | undefined = rates.find((rate) => rate.from === record.currency && rate.to === targetCurrency);

      if (!rate) {
        rate = await convertCurrency(record.currency, targetCurrency);
        rates.push(rate);
      }

      estimateValues += record.estimate * rate.value;
    } else {
      estimateValues += record.estimate;
    }

    companies.push(record);
  }

  companies = isCompanyWithNearestReport(companies);

  if (!companies.length) {
    throw new BadRequestException();
  }

  return {
    average: estimateValues/companies.length,
    currency: targetCurrency
  } as AverageResponse;
};

export const parseCSV = async (data: string) => {
  return new Promise<Array<CompanyEarning>>((resolve, reject) => {
    parse(data, {
      delimiter: ',',
      columns: ['symbol', 'name', 'reportDate', 'fiscalDateEnding', 'estimate', 'currency'],
      fromLine: 2,
      cast: (columnValue, context) => {
        if (context.column === 'estimate') {
          if (columnValue.length) {
            return parseFloat(columnValue);
          }

          return null;
        }

        return columnValue;
      }
    }, (error, result) => {
      if (error) {
        reject(error);
      }

      resolve(result);
    });
  });
};

export const convertCurrency = async (from: string, to: string) => {
  const axiosResponse = await axios.request({
    method: 'get',
    url:
      'https://www.alphavantage.co/query' +
      '?function=CURRENCY_EXCHANGE_RATE' +
      '&from_currency=' + from +
      '&to_currency=' + to +
      '&apikey=' + process.env.API_KEY
  });

  if (!axiosResponse.data['Realtime Currency Exchange Rate'] || !axiosResponse.data['Realtime Currency Exchange Rate']['5. Exchange Rate']) {
    throw new BadRequestException();
  }

  return {
    from,
    to,
    value: parseFloat(axiosResponse.data['Realtime Currency Exchange Rate']['5. Exchange Rate'])
  };
};

export const isCompanyWithNearestReport = (data: CompanyEarning[]) => {
  const now = new Date();
  let diff = Infinity;
  const companies: CompanyEarning[] = [];

  for (const company of data) {
    const reportDate = new Date(company.reportDate);
    const monthDiff = Math.abs(now.getTime() - reportDate.getTime());

    if (monthDiff < diff) {
      diff = monthDiff;
    }

    companies.push(company);
  }

  return companies;
}
import * as earningModule from './earning';
import axiosMockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import * as chai from 'chai';
import { BadRequestException } from '../exceptions/bad-request-exception';

const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;

const {
  getData,
  parseCSV,
  convertCurrency
} = earningModule;

describe('get data test', () => {
  const axiosMock = new axiosMockAdapter(axios);

  afterEach(() => {
    axiosMock.reset();
  });

  it('convertCurrency should return rate from USD to EUR', async () => {
    const mockData = {
      'Realtime Currency Exchange Rate': {
        '1. From_Currency Code': 'USD',
        '2. From_Currency Name': 'United States Dollar',
        '3. To_Currency Code': 'EUR',
        '4. To_Currency Name': 'Euro',
        '5. Exchange Rate': '0.93420000',
        '6. Last Refreshed': '2023-09-08 09:40:03',
        '7. Time Zone': 'UTC',
        '8. Bid Price': '0.93419000',
        '9. Ask Price': '0.93422000'
      }
    };

    axiosMock.onGet(
      'https://www.alphavantage.co/query' +
      '?function=CURRENCY_EXCHANGE_RATE' +
      '&from_currency=USD' +
      '&to_currency=EUR' +
      '&apikey=' + process.env.API_KEY
    ).reply(200, mockData);

    const result = await convertCurrency('USD', 'EUR');
    expect(result).to.be.deep.equal({
      from: 'USD',
      to: 'EUR',
      value: 0.9342
    });
  });

  it('convertCurrency should return throw BadRequestException if from is empty', async () => {
    const mockData = {};
    chai.use(chaiAsPromised);
    axiosMock.onGet(
      'https://www.alphavantage.co/query' +
      '?function=CURRENCY_EXCHANGE_RATE' +
      '&from_currency=' +
      '&to_currency=USD' +
      '&apikey=' + process.env.API_KEY
    ).reply(200, mockData);
    await expect(convertCurrency('', 'USD')).to.be.rejectedWith(BadRequestException);
  });

  it('convertCurrency should return throw BadRequestException if to is empty', async () => {
    const mockData = {};
    chai.use(chaiAsPromised);
    axiosMock.onGet(
      'https://www.alphavantage.co/query' +
      '?function=CURRENCY_EXCHANGE_RATE' +
      '&from_currency=USD' +
      '&to_currency=' +
      '&apikey=' + process.env.API_KEY
    ).reply(200, mockData);

    await expect(convertCurrency('USD', '')).to.be.rejectedWith(BadRequestException);
  });

  it('parseCSV should parse string to json object', async () => {
    const data = 'symbol,name,reportDate,fiscalDateEnding,estimate,currency\n' +
      'A,Agilent Technologies Inc,2023-11-20,2023-10-31,1.35,USD\n' +
      'AA,Alcoa Corp,2023-10-17,2023-09-30,-0.53,USD';

    const result = await parseCSV(data);
    expect(result).to.be.deep.equal([
      {
        symbol: 'A',
        name: 'Agilent Technologies Inc',
        reportDate: '2023-11-20',
        fiscalDateEnding: '2023-10-31',
        estimate: 1.35,
        currency: 'USD'
      },
      {
        symbol: 'AA',
        name: 'Alcoa Corp',
        reportDate: '2023-10-17',
        fiscalDateEnding: '2023-09-30',
        estimate: -0.53,
        currency: 'USD'
      }
    ]);
  });

  it('getData should calculate average', async () => {
    const mockData = {
      status: 200,
      data: 'symbol,name,reportDate,fiscalDateEnding,estimate,currency\n' +
        'A,Agilent Technologies Inc,2023-11-20,2023-10-31,1.35,USD\n' +
        'AA,Alcoa Corp,2023-10-17,2023-09-30,-0.53,USD'
    };

    axiosMock.onGet(
      'https://www.alphavantage.co/query' +
      '?function=EARNINGS_CALENDAR' +
      '&horizon=3month' +
      '&apikey=' + process.env.API_KEY
    ).reply(200, mockData.data);

    const result = await getData(['USD'], 'USD');
    expect(result).to.be.deep.equal({
      average: 0.41000000000000003,
      currency: 'USD'
    });
  });

  it('getData should return throw Error if currency is empty', async () => {
    const mockData = {};
    chai.use(chaiAsPromised);
    axiosMock.onGet(
      'https://www.alphavantage.co/query' +
      '?function=EARNINGS_CALENDAR' +
      '&horizon=3month' +
      '&apikey=' + process.env.API_KEY
    ).reply(200, mockData);
    await expect(getData([], 'USD')).to.be.rejectedWith(Error);
  });

  it('getData should return throw Error if targetCurrency is empty', async () => {
    const mockData = {};
    chai.use(chaiAsPromised);
    axiosMock.onGet(
      'https://www.alphavantage.co/query' +
      '?function=EARNINGS_CALENDAR' +
      '&horizon=3month' +
      '&apikey=' + process.env.API_KEY
    ).reply(200, mockData);

    await expect(getData(['USD'], '')).to.be.rejectedWith(Error);
  });
});

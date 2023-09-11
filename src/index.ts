import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getData } from './services/earning';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { cur, targetCur } = event.multiValueQueryStringParameters || {};
  const targetCurrency = targetCur?.length ? targetCur[0] : undefined;

  try {
    if (!cur || !cur.length) {
      throw Error('cur parameter must be an array');
    }

    if (!targetCurrency || !targetCurrency.length) {
      throw Error('targetCur parameter must be a string');
    }

    const data = await getData(cur, targetCurrency);

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: (error as Error)?.message as string
    };
  }
};
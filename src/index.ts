import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getData } from './services/earning';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { cur, targetCur } = event.queryStringParameters || {};

  try {
    if (!cur || !Array.isArray(cur) || !cur.length) {
      throw Error('cur parameter must be an array');
    }

    if (!targetCur || !targetCur.length) {
      throw Error('targetCur parameter must be a string');
    }

    const data = await getData(Array.isArray(cur) ? cur : [], targetCur);

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
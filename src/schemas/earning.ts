export type QueryParams = {
  cur: Array<string>;
  targetCur: string;
};

export type CompanyEarning = {
  symbol: string;
  name: string;
  reportDate: string;
  fiscalDateEnding: string;
  estimate: number | null;
  currency: string;
};

export type Rate = {
  from: string;
  to: string;
  value: number;
};

export type AverageResponse = {
  average: number;
  currency: string;
};
export interface AdressInterface {
  name: string;
  address: string;
}
export interface JsonDataBaseInterface {
  connection?: boolean;
  addresses?: AdressInterface[];
  error?: string;
}
export enum Channels {
  getConnectionAndIpAddresses = 'get-connection-and-ip-adresses',
}

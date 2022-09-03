export interface AdressInterface {
  name: string;
  address: string;
}
export interface JsonDataBaseInterface {
  connection?: boolean;
  addresses?: AdressInterface[];
  error?: string;
}

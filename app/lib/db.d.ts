import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Customers {
  email: string;
  id: Generated<string>;
  image_url: string;
  name: string;
}

export interface Invoices {
  amount: number;
  customer_id: string;
  date: Timestamp;
  id: Generated<string>;
  status: string;
}

export interface Revenue {
  month: string;
  revenue: number;
}

export interface Users {
  email: string;
  id: Generated<string>;
  name: string;
  password: string;
}

export interface DB {
  customers: Customers;
  invoices: Invoices;
  revenue: Revenue;
  users: Users;
}

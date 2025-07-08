export type JsonPrimitive =
  | number
  | string
  | null
  | undefined
  | symbol
  | boolean
  | Date;

export type JsonArray = [];
export type JosnRecord<T> = {
  [Property in keyof T]: Json;
};

export type Json<T = any> = JsonPrimitive | JsonArray | JosnRecord<T>;

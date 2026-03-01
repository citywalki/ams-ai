declare module 'json-bigint' {
  interface JSONBigOptions {
    storeAsString?: boolean;
    alwaysParseAsBig?: boolean;
    constructor?: new (value: string | number) => bigint;
  }

  interface JSONBig {
    parse(text: string): unknown;
    stringify(obj: unknown): string;
  }

  function JSONBig(options?: JSONBigOptions): JSONBig;
  export = JSONBig;
}

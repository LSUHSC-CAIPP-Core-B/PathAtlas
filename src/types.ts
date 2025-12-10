export type RequireOne<T, Keys extends keyof T = keyof T> = {
  [Key in Keys]: Partial<Pick<T, Exclude<Keys, Key>>> & Required<Pick<T, Key>> & Omit<T, Keys>;
}[Keys];

export type DeepReadonly<T> = T extends (infer R)[]
  ? DeepReadonlyArray<R>
  : T extends Function
    ? T
    : T extends object
      ? DeepReadonlyObject<T>
      : T;

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

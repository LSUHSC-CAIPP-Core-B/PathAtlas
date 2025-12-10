
export type RequireOne<T, Keys extends keyof T = keyof T> = {
    [Key in Keys]: Partial<Pick<T, Exclude<Keys, Key>>>
        & Required<Pick<T, Key>>
        & Omit<T, Keys>
}[Keys];

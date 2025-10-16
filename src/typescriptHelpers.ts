type ExcludeFromTuple<T extends readonly unknown[], E> = T extends readonly [
    infer F,
    ...infer R
]
    ? [F] extends [E]
        ? ExcludeFromTuple<R,E>
        : [F, ...ExcludeFromTuple<R,E>]
    : [];
type ExcludeFromArray<T extends readonly unknown[], E> = T extends readonly [
    unknown,
    ...unknown[]
]
    ? ExcludeFromTuple<T,E>
    : NonNullable<T[number]>[];

export const filterDefined = function <T extends ReadonlyArray<unknown>>(g: T) {
    return g.flatMap((v) => (v === undefined ? [] : [v])) as ExcludeFromArray<T, undefined>;
};

export const getEntries = <SomeRecord extends Record<PropertyKey, unknown>>(
    arg: SomeRecord
) => 
    Object.entries(arg) as {
        [P in keyof SomeRecord]: [P, SomeRecord[P]];
    }[keyof SomeRecord][];

export const getKeys = <SomeRecord extends Record<PropertyKey, unknown>>(
    arg: SomeRecord
) => getEntries(arg).map((v) => v[0]);

export const getValues = <SomeRecord extends Record<PropertyKey, unknown>>(
    arg: SomeRecord
) => getEntries(arg).map((v) => v[1]);

export const fromEntries = <TupleArray extends ReadonlyArray<readonly [PropertyKey, unknown]>>(entries: TupleArray) => {
    return Object.fromEntries(entries) as {
        [TupleObject in TupleArray[number] as TupleObject[0]]: TupleObject[1]
    };
};
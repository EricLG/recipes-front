export interface Option<T> {
    id: T;
    label: string;
}

export function toOptions<T extends string|number>(translations: Record<T, string>, order?: T[]): Option<T>[] {
    const keys = order ?? (Object.keys(translations) as T[]);
    return keys.map(k => ({ id: k, label: translations[k] }));
}

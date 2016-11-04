/**
 * Created by YS on 2016/11/4.
 */
declare interface ReadableStream{}

declare namespace Immutable {
    export module Record {
        type IRecord<T> = T & TypedMap<T>;

        interface TypedMap<T> extends Map<string, any> {
            set(key: string, value: any): T & TypedMap<T>
        }

        interface Class<T> {
            new (): IRecord<T>;
            new (values: T): IRecord<T>;

            (): IRecord<T>;
            (values: T): IRecord<T>;
        }
    }

    export function Record<T>(defaultValues: T, name?: string): Record.Class<T>;
}

/**
 * Created by YS on 2016/11/4.
 */

declare namespace NodeRestful{
    export interface Params{
        offset?:number,
        limit?:number,
        sort?:string
    }
}

declare namespace Loopback{
    export interface Params{
        where:{
            [searchkey:string]:string | {
                like?:string
            }
        }
        offset?:number,
        limit?:number,
        order?:string
    }
}
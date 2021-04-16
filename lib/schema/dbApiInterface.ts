export interface IDbApi<T> {
    addOne(data: T) : Promise<T>;
    addMany(data: Array<T>) : Promise<Array<T>>;
    updateOne(query: any, data: T) : Promise<T>;
    updateById(id: string| number, data: T) : Promise<T>;
    updateMany(query: any, data: T) : Promise<Array<T>>;
    findOneById(id: string|number) : Promise<T>;
    findOne(query: any) : Promise<T>;
    findAll(query?: any, sort?: any) : Promise<Array<T>>;
    findCount(query?: any) : Promise<number>;
    findList(options: {
        query?: any; 
        page: number; 
        pageSize: number;
        sort?: any;
    }): Promise<any[]>;
    deleteById(id: string | number) : Promise<T>;
    deleteOne(query: any) : Promise<T>;
    clean() : Promise<boolean>;
}
export interface dbApiInterface<T> {
    addOne(data: T) : Promise<T>;
    addMany(data: Array<T>) : Promise<Array<T>>;
    updateOne(query: any, data: T) : Promise<T>;
    updateById(id: string| number, data: T) : Promise<T>;
    updateMany(query: any, data: T) : Promise<Array<T>>;
    findOneById(id: string|number) : Promise<T>;
    findOne(query: any) : Promise<T>;
    findAll(query?: any) : Promise<Array<T>>;
    deleteById(id: string | number) : Promise<T>;
    deleteOne(query: any) : Promise<T>;
}
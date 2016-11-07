/**
 * Created by YS on 2016/11/4.
 */

export interface GridStore{
    grids:Map<string,GridInstanceStore<any>>
}

export interface GridInstanceStore<Model>{
    modelPath:string[]
    viewSchema:any
    editSchema?:any
    createSchema?:any
}
/**
 * Created by YS on 2016/11/4.
 */

export interface ActionDef<Model>{
    name:string,
    displayName:string,
    static:boolean,
    enabled:(data:Model)=>boolean,
    data:(data:Model)=>any
}

export interface GridStore{
    grids:Map<string,GridInstanceStore<any>>
}

export interface GridInstanceStore<Model>{
    modelPath:string[]
    viewSchema:any
    editSchema?:any
    createSchema?:any
    actions:ActionDef<Model>[]
}
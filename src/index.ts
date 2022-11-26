import _compile from './compile';
//import { Tpipe } from './pipe';
export {default as w, SHOW_QUIT_MESSAGE} from './watch';
export {default as p} from './parallel';
export {default as sw} from './switch';
export {default as nr} from './nr';
export {default as repeat} from './repeat';

export const DEBUG = {v: false, w: false};

export type Data = {data: any, ctx: Ctx};
export type F = ((arg0: Data) => any);
export type Callable = Generator|AsyncGenerator|FD|CallableArray;
export type CallableArray = Callable[];
export type FD = (data: Data)=>Promise<any>;
export type SETUP = {single: FD, multiple: FD[]};
export type PluginBase = (pipes: FD[]) => FD;

//export type Pipe ={pipe: FD[], done: (err?: boolean)=>void}; 
export type Pipe ={pipe: FD[]|null}; 

export type Arg = {pipe: FD[]/*, done: (err?: boolean)=>void*/};
export type Plugin = {[key: string]: FP};
type FPipe = (arg: FArray) => FArray;
export type FP = AsyncGenerator<Pipe, Pipe, Pipe>|((arg0: Pipe) => Promise<Pipe>);
//type F = FD|FArray;
export type FArray = (FPipe|FArray)[];
export type Namespace = Record<string,Generator|AsyncGenerator|((arg0: Data)=>any)>;
type Close = (err?: boolean, data?: any)=>boolean;
type Ctx = {close: Close, promise?: Promise<any>};

export function g(t: string){
    const x = _g(t);
    x.next("");
    return x;
}

export function *_g(t: string): Generator<string, string|null, Data|string>{
    const arr = ['', ...t.split(',')];
    let v = '';
    for(const i of arr){
        if(i.startsWith('throw') || i.endsWith('!')) throw new Error(i);
        else{
            if(v === '') v = i;
            else v = v + i;
            
            const value = yield v;
            if(typeof value === 'string')
                v = value;
            else
                v = value.data;
        }
    }
    return null;
}

export function i(data: any){
    return {data: data, ctx: {close: ()=>{
        return true;
    }}};
}

type Options = {
    namespace: Namespace,
    plugins?: Plugin
}

export const compile = (raw: string, options?: Options) => {
    const opts = {
        plugins: {},
        namespace: {},
        ...options
    };
    
    const compiled = _compile(raw, opts);
    return (data?: any) => compiled(i(data));
};

export const run = async (raw: string, options?: Options, data?: Data) => {
    try{
        const compiled = compile(raw, options);
        return await compiled(data);
    }catch(err){
        if(err instanceof Error && err.message.startsWith("Key Error")) throw err;
        return false;
    }
};

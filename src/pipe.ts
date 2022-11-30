import { Data, DEBUG, type F, type FD } from ".";

export type C = Generator|AsyncGenerator|F|string|Tpipe;
export type Tpipe = C[];
export type Pipe = (tasks: F|Tpipe) => (data: Data) => Promise<any>;
export type PipeArray = Tpipe[];

export const pipe =  (tasks: FD[]) => async (data: Data) => {
    if(data.data === null) return null;
    
    let close;
    if(data.ctx) close = data.ctx.close;

    try{
        for(const m of tasks){
            const v = await m(data);
            if(v === null) return null;
            data.data = v;
        }
        return data.data;
    }catch(err){
        if(DEBUG.v)
            // eslint-disable-next-line no-console
            console.log(err);
        throw err;
    }
};
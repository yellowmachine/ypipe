import { Data, FD } from '.';

type SWF = (data: any)=>number|boolean;

export default (f: SWF) => (pipes: FD[]) => async (data: Data) => {

    const v = f(data);
    
    if(typeof v === 'boolean'){
        if(v) return await pipes[0](data);
        else return null;
    }else{
        return await pipes[v](data); 
    }
};

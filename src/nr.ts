import { Next, FD } from '.';

export type MODE = "buffer"|"nobuffer"|"custom";

export default ({mode, size}: {mode?: MODE, size?: number} = {mode: "nobuffer"}) => {
    let exited = true;
    const buffer: Next[] = [];

    return async function (next: Next, pipe: FD[]){
        if(exited){
            exited = false;
            let ret;
            do{
                try{
                    ret = await next();
                    const _next = buffer.pop();
                    if(_next) next = _next;
                }catch(err){
                    //
                }
            }
            while(buffer.length > 0);
            exited = true;
            return ret;
        }else{
            if(size === undefined || buffer.length < size)
                buffer.push(next);
            return null;
        }
    };
}; 

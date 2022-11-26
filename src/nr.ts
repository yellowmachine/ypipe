import { Pipe } from '.';

export type MODE = "buffer"|"nobuffer"|"custom";

export default ({mode, size}: {mode?: MODE, size?: number} = {mode: "nobuffer"}) => {
    let exited = true;
    const buffer: Pipe[] = [];

    return async function *(pipe: Pipe){
        if(exited){
            exited = false;
            do{
                yield pipe;
                const x = buffer.pop();
                if(x) pipe = x;
            }
            while(buffer.length > 0);
            exited = true;
        }else{
            if(size === undefined || buffer.length < size)
                buffer.push(pipe);
            return null;
        }
    };
}; 

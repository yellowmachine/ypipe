import { Data, FD } from '.';
export type MODE = "buffer"|"nobuffer"|"custom";
export type BFUNC = null|((arg: BufferData[]) => BufferData[]);

type Resolve = (null|((arg0: (any)) => void));
type Reject = (null|(() => void));
type BufferData = {resolve: Resolve, reject: Reject, data: Data, pipe: FD[]};

function createResolve(){
    let innerResolve: Resolve = null;
    let innerReject: Reject = null;

    const p: Promise<any> = new Promise((_resolve, _reject) => {
        innerResolve = _resolve;
        innerReject = _reject;
    });

    function resolve(v: boolean){
        if(innerResolve) innerResolve(v);
    }

    function reject(){
        if(innerReject) innerReject();
    }

    return {resolve, reject, promise: p};
}

type Arg = {pipe: FD[], data: Data, done: (err?: boolean)=>void};

export default ({mode, size}: {mode?: MODE, size?: number} = {mode: "nobuffer"}) => {
    let exited = true;
    const buffer: BufferData[] = [];
    
    return async ({pipe, data, done}: Arg) => {
        function _done(err=false){
            exited = true;
            if(err){
                if(buffer.length > 0){
                    const {reject} = buffer.pop() as BufferData;
                    if(reject) reject();
                }
            }else{
                if(buffer.length > 0){
                    const {resolve} = buffer.pop() as BufferData;
                    if(resolve) resolve(true);
                }
            }
            done(err);
        }
        if(!exited){
            if(mode === "buffer" && (size === undefined || buffer.length < size - 1)){
                const x = createResolve();
                buffer.push({...x, data, pipe: pipe});
                try{
                    await x.promise; 
                }catch(err){
                    if(buffer.length > 0){
                        const {reject} = buffer.pop() as BufferData;
                        if(reject) reject();
                    }
                    throw err;        
                }
            }else{
                return null;
            }
        }else{
            exited = false;
            return {pipe, data, done: _done};
        }
};
};

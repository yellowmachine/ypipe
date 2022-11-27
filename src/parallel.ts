import { FD, Next, Data } from '.';

export default (mode: "all"|"race"|"allSettled" = "all", 
                map: ((data: Data)=>any)|null = null) => async (next: Next, pipes: FD[]) => {
    
    const promises: Promise<any>[] = [];   

    pipes = pipes || [];
    for(const pipe of pipes){
        //if(map) data = {ctx: data.ctx, data: map(data.data)};
        promises.push(next([pipe]));
    }
    try{
        let result;
        if(mode === "all"){
            result = await Promise.all(promises);
        } 
        //else if (mode === "any") return await Promise.any(promises);
        else if (mode === "race") result = await Promise.race(promises);
        else if (mode === "allSettled") result = await Promise.allSettled(promises);
        return result;
    }catch(err){
        const msg = err instanceof Error ? err.message: "";
        throw new Error(msg);
    }
};

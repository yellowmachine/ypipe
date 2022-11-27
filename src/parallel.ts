import { Data, FD } from '.';

export default (mode: "all"|"race"|"allSettled" = "all", 
                map: ((data: Data)=>any)|null = null) => (pipes: FD[]) => async (data: Data) => {
    
    const promises: Promise<any>[] = [];   

    pipes = pipes || [];
    for(const t of pipes){
        if(map) data = {ctx: data.ctx, data: map(data.data)};
        promises.push(t(data));
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
        throw new Error(data.data + msg);
    }
};

import { Data, FD } from '.';

export default (mode: "all"|"race"|"allSettled" = "all", 
                map: ((data: Data)=>any)|null = null) => (pipes: FD[]) => async (data: Data) => {
    
    const promises: Promise<any>[] = [];   

    for(const t of pipes){
        if(map) data = {ctx: data.ctx, data: map(data.data)};
        promises.push(t(data));
    }
    try{
        if(mode === "all"){
            return await Promise.all(promises);
        } 
        //else if (mode === "any") return await Promise.any(promises);
        else if (mode === "race") return await Promise.race(promises);
        else if (mode === "allSettled") return await Promise.allSettled(promises);
    }catch(err){
        const msg = err instanceof Error ? err.message: "";
        throw new Error(data.data + msg);
    }
    return false;
};

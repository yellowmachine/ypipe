import { FD, Next } from '.';

export default (mode: "all"|"race"|"allSettled" = "all") => async (next: Next, pipes: FD[]) => {
    
    const promises: Promise<any>[] = [];   

    for(const pipe of pipes){
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

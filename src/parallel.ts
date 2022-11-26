import { Pipe, Data } from '.';

export default (mode: "all"|"race"|"allSettled" = "all", 
                map: ((data: Data)=>any)|null = null)  => async ({pipe: pipes, done}: Pipe) => {
    

    async function parallel(data: Data){

        const promises: Promise<any>[] = [];   
    
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
            done();
            return result;
        }catch(err){
            done(true);
            const msg = err instanceof Error ? err.message: "";
            throw new Error(data.data + msg);
        }
    }

    return {pipe: [parallel], done};
};

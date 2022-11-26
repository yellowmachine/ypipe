import { Data, FD } from '.';

export default (n: number) => (pipe: FD[]) => async (data: Data) => {
    
    const initialData = data.data;
    
    for(;;){        
        try{
            return await pipe[0]({...data, data: initialData}); 
        }catch(err){
            n--;
            if(n === 0) throw err;
        }    
    } 
};

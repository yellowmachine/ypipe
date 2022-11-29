import { Next, FD, Data } from '.';

export default (n: number) => async (next: Next, pipe: FD[], data: Data) => {
    do{
        try{
            n--;
            return await next();
        }catch(err){
            //
        }
    }while(n > 0);
    return null;
}; 

import { Next } from '.';

export default (n: number) => async (next: Next) => {
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

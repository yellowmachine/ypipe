import { Next } from '.';

export default (n: number) => async (next: Next) => {
    do{
        try{
            return await next();
        }catch(err){
            n--;
        }
    }while(n > 0);
    return null;
}; 

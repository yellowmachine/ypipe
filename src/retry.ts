import { Next } from '.';

export default (n: number) => async (next: Next) => {
    do{
        try{
            return await next();
        }catch(err){
            n--;
            if(n === 0) throw err;
        }
    }while(n > 0);
    
}; 

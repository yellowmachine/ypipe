import { Pipe } from '.';

export default (n: number) => ({pipe, done}: Pipe) => {
    for(;;){
        try{
            return {pipe, done};
        }catch(err){
            done(true);
            n--;
            if(n === 0) throw err;
        }    
    } 
};


import { Pipe } from '.';

export default (n: number) => (pipe: Pipe) => {
    for(;;){
        try{
            return pipe;
        }catch(err){
            //done();
            n--;
            if(n === 0) return {pipe: [], done: pipe.done};
        }    
    } 
};

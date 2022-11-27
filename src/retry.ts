import { Pipe } from '.';

export default (n: number) => {
    /*function *f(pipe: Pipe){
        do{
            n--;
            pipe = yield pipe;
        }while(n > 0);
        return null;
    }
    return f({pipe: []});
    */
    function *f(){
        let pipe: Pipe = yield;
        do{
            n--;
            pipe = yield pipe;
        }while(n > 0);
        return null;
    }
    return f();
}; 

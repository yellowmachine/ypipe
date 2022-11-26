import { Pipe } from '.';

export default (n: number) => {
    return function *(pipe: Pipe){
        do{
            n--;
            yield pipe;
        }while(n > 0);
        return null;
    };
}; 

import { Pipe } from '.';

export default (n: number) => {
    const initial = n;
    return ({pipe}: Pipe) => {
        function _done(err=false){
            if(err){
                n--;
                if(n === 0) throw err;
                return {pipe, done: _done};
            }else{
                n = initial;
            }
        }
        return {pipe, done: _done};
    };
}; 

import { FD, Next } from '.';
import parallel from './parallel';
import {pipe as s} from './pipe';

const repeat = (arr: FD[], n: number) => Array(n).fill(arr).flat();

export default (n: number) => async (next: Next, pipe: FD[]) =>  
    parallel()(next, repeat([s(pipe)], n));
//next(repeat(pipe, n));

import { Pipe } from '.';
import parallel from './parallel';

const repeat = (arr: Pipe["pipe"], n: number) => Array(n).fill(arr).flat();

export default (n: number) => async ({pipe}: Pipe) =>  
    parallel()({pipe: repeat(pipe, n)});

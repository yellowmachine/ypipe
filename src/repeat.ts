import { FD, Next } from '.';

const repeat = (arr: FD[], n: number) => Array(n).fill(arr).flat();

export default (n: number) => async (next: Next, pipe: FD[]) =>  next(repeat(pipe, n));

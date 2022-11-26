import { Data, FD } from '.';

export default (n: number) => (pipes: FD[]) => async (data: Data) => {
    const promises: Promise<boolean>[] = [];

    while(n--){
        const p = pipes[0](data);
        promises.push(p);
    }
    return await Promise.all(promises);
};

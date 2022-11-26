import { Data, FD } from '.';

export default (sep: string) => (pipes: FD[]) => async (data: Data) => {

    const arr: any[] = await pipes[0](data);
    return arr.join(sep);
};

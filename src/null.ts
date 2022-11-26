import { Data, FD } from '.';

export default () => (pipe: FD[]) => async (data: Data) => {
    if(data.data === null) return null;
    return await pipe[0](data);
};

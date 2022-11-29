import { watch as chwatch } from 'chokidar';
import { emitKeypressEvents } from 'node:readline';

import { FD, Next, Pipe, type Data} from '.';

export const SHOW_QUIT_MESSAGE = {v: false};
export const DEBUG = {v: false};

emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

export default (files: string[]) => async (next: Next, pipe: FD[] ) => {

    const main = (data: Data) => {
        const quit = data.ctx.close;

        const q = 'q';
        const h = (ch: string) => {
            if(ch === q){
                close();
            }
        };
        process.stdin.on('keypress', h);        

        let resolve: (null|((arg0: (any)) => void)) = null;
        let reject: (null|(() => void)) = null;

        const p: Promise<any> = new Promise((_resolve, _reject) => {
            resolve = _resolve;
            reject = _reject;
        });

        let exited = false;
        function close(err = false){
            if(!exited){
                quit();
                exited = true;
                process.stdin.pause();
                process.stdin.removeListener("keypress", h);
                if(err){
                    if(reject) reject();
                }
                else if(resolve) resolve(data.data);
                if(watcher)
                    watcher.close();
            }
            return true;
        }

        async function exitedRun(){
            while(!exited){   
                await run();
            }
        }

        async function run(){
            try{
                data = {data: data.data, ctx: {close}};
                await next(pipe, data);
                if(SHOW_QUIT_MESSAGE.v)
                    // eslint-disable-next-line no-console
                    console.log("Press " + q + " to quit!");
            }catch(err){
                //if(err instanceof Error && err.message.startsWith("exit")) throw err;
                if(DEBUG.v && err instanceof Error && !err.message.startsWith("no log"))
                    // eslint-disable-next-line no-console
                    console.log(err);
                //throw err;
            }
        }

        let watcher: null | ReturnType<typeof chwatch> = null;
        if(!DEBUG.v){
            watcher = chwatch(files, {ignoreInitial: true}).
                on('all', (event, path) => {
                    // eslint-disable-next-line no-console
                    //console.log(event, path);
                    run();
                });
            run();
        }else{
            exitedRun();
        }
        return p;
    };

    return {pipe: [main]};
};

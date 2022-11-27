import { type Namespace, type Plugin, type FD, type Data, Next } from '.';
import { parse, ParsedArray } from './parse';
import {pipe as s} from './pipe';

import p from './parallel';
import nr from './nr';
//import retry from './retry';
//import _catch from './catch';
import repeat from './repeat';

const wrap = (m: FD|AsyncGenerator|Generator) => {
    if(typeof m === 'function'){
        return async (data: Data) => {
            const response = await m(data);
            data.data = response;
            return response;
        };
    }else{
        return async (data: Data) => {
            const response = await m.next(data);
            data.data = response.value;
            return response.value;
        };                                                      
    }

};

export default (raw: string, opts: {namespace: Namespace, plugins: Plugin}) => {

    const rootParsed = parse(raw);
    
    function _compile(parsed: ParsedArray){

        const buildAtom = (a: string) => {
            const m = opts.namespace[a];
            if(m === undefined) 
                throw new Error("Key Error: namespace error: " + a + ",(it could be a missing plugin)");
            return m;
        };

        const buildArray = (arr: ParsedArray): FD => {

            const pipes = arr.c.map(sub=>{
                if(sub.type === 'array'){
                    const f = buildArray(sub);
                    /*if(arr.retryType === '?'){
                        f = _catch(arr.retry || 1)([f]);
                    }else if(arr.retryType === '!'){
                        f = retry(arr.retry || 1)([f]);
                    }
                    if(arr.repeat)
                        f = repeat(arr.repeat)([f]);
                    */
                    return f;
                }else{
                    const f = wrap(buildAtom(sub.name));
                    /*if(sub.catched) f = _catch(1)([f]);
                    if(sub.plugins.length > 0){
                        const composed = compose(sub.plugins);
                        f = composed([f]);
                    }
                    */
                    return f;
                }
            });

            const arrPlugins = arr.plugins.map(name => {
                if(name === 'nr'){
                    return nr();
                }else if(/^\d+$/.test(name)){
                    return repeat(parseInt(name));
                }else if(name === 'p'){
                    return p();
                }else{
                    const plugin = opts.plugins[name];
                    if(plugin === undefined) throw new Error("Key Error: plugin namespace error: " + name);                    
                    return plugin;
                }
            });

            const x: Next;

            function next(i: number, data: Data): () => any{
                if(i === arrPlugins.length){
                    return () => s(pipes)(data);
                }
                const plugin = arrPlugins[i];
                return (): any => {
                    return plugin({next: next(i+1, data)});
                };
            }

            return async (data: Data) => {
                return await next(0, data)();
            };
        };

        function build(arr: ParsedArray): FD{
            return buildArray(arr);
        }
        return build(parsed);
    }
    return s([_compile(rootParsed)]);
};

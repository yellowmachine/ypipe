import { type Namespace, type Plugin, type FD, type Data, Arg, Pipe } from '.';
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

function done(){
    //
}

export default (raw: string, opts: {namespace: Namespace, plugins: Plugin}) => {

    const rootParsed = parse(raw);
    
    function _compile(parsed: ParsedArray){

        /*
        const pipePipe = (plugins: string[]) =>{
            const wrapped = plugins.map(name => {
                if(name === 'nr') return nr();
                else if(name === 'p') return p();
                else if(name === 's') return (x: Pipe)=>x;
                else if(/^\d+$/.test(name)) return repeat(parseInt(name));
                else {
                    const plugin = opts.plugins[name];
                    if(plugin === undefined) throw new Error("Key Error: plugin namespace error: " + name);
                    if(typeof plugin === 'function') return plugin;
                    else{
                        plugin.next();
                        return async (arg: Arg) =>  (await plugin.next(arg)).value;
                    }
                }
            });

            return async (pipe: Arg) => {
                for(const plugin of wrapped){
                    pipe = await plugin(pipe);
                    //if(pipe === null) return null;
                }
                return pipe;
            };
        };*/

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

            async function pipePipe(plugins: string[], pipe: Pipe, data: Data): Promise<any>{
                if(plugins.length === 0){
                    const _p = pipe.pipe;
                    if(_p) return await _p[0](data);
                }else{
                    const name = plugins[0];
                    if(/^\d+$/.test(name)){
                        const p = await repeat(parseInt(name))(pipe);
                        return pipePipe(plugins.slice(1), p, data);
                    }
                    //
                    //if(name === 'nr'){
                    //    const x = (await nr()(pipe).next()).value;

                    //}
                    //else if(name === 'p') return p();
                    //else if(name === 's') return (x: Pipe)=>x;
                    //else if(/^\d+$/.test(name)) return repeat(parseInt(name));
                    //
                    const plugin = opts.plugins[name];
                    if(plugin === undefined) throw new Error("Key Error: plugin namespace error: " + name);                    
                    if(typeof plugin === 'function'){
                        pipe = await plugin(pipe);
                        return pipePipe(plugins.slice(1), pipe, data);
                    }
                    else{
                        let _err;
                        for(;;){
                            pipe = (await plugin.next(pipe)).value;
                            if(pipe === null) throw _err;
                            if(pipe.pipe === null) return null;
                            try{
                                return pipePipe(plugins.slice(1), pipe, data);
                            }catch(err){
                                _err = err;
                            }
                        }
                    }
                }
            }

            return async (data: Data) => {
                return pipePipe(arr.plugins, {pipe: pipes/*, done*/}, data);
            };
        };

        function build(arr: ParsedArray): FD{
            return buildArray(arr);
        }
        return build(parsed);
    }
    return s([_compile(rootParsed)]);
};

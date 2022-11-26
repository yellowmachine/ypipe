import { type Namespace, type Plugin, type FD, type Data, FP, Arg } from '.';
import { parse, ParsedArray } from './parse';
import {pipe as s} from './pipe';

import p from './parallel';
import nr from './nr';
import retry from './retry';
import _catch from './catch';
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

function done(err=false){
    //
}

export default (raw: string, opts: {namespace: Namespace, plugins: Plugin}) => {

    const rootParsed = parse(raw);
    
    function _compile(parsed: ParsedArray){

        const pipePipe = (plugins: string[]) =>{
            const wrapped = plugins.map(name => {
                /*
                if(name === 'p') return p();
                else if(name === 's') return s;
                else if(name === 'nr') return  nr();
                else if(/^\d+$/.test(name)){
                    return repeat(parseInt(name));
                }
                else {*/
                    const plugin = opts.plugins[name];
                    if(plugin === undefined) throw new Error("Key Error: plugin namespace error: " + name);
                    if(typeof plugin === 'function') return plugin;
                    else{
                        plugin.next();
                        return (arg: Arg) =>  plugin.next(arg).value;
                    //}
                }
            });
            return async (pipe: Arg) => {
                for(const plugin of wrapped){
                    pipe = plugin(pipe);
                    //if(pipe === null) return null;
                }
                return pipe;
                //const response = await s(pipe.pipe);
                //pipe.done();
                //return response;
            };
        }; 

        /*
        function compose(plugins: string[]){
            if(plugins.length === 0) return s;
            return (f: FD[]) => {
                for(const name of plugins.reverse()){
                    let plugin;
                    if(name === 'p') plugin = p();
                    else if(name === 's') plugin = s;
                    else if(name === 'nr') plugin = nr();
                    else if(/^\d+$/.test(name)){
                        plugin = repeat(parseInt(name));
                    }
                    else{
                        plugin = opts.plugins[name];
                        if(plugin === undefined) throw new Error("Key Error: plugin namespace error: " + name);
                    }
                    f = [plugin(f)];     
                }
                return f[0];
            } ;
        }
        */

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
            return async (data: Data) => {
                const {pipe, done: _done} = await pipePipe(arr.plugins)({pipe: pipes, data, done});
                try{
                    const v = await pipe[0](data);
                    _done();
                    return v;
                }catch(err){
                    _done(true);
                    throw err;
                }  
            };
        };

        function build(arr: ParsedArray): FD{
            return buildArray(arr);
        }
        return build(parsed);
    }
    return s([_compile(rootParsed)]);
};

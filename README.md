# ypipe

You can compile and run tasks. Example of expressions:

```ts
"a|b"  // a then b
"'[a,c|b]"  // in parallel a and c|b
"'[a,b,c]"  // in parallel a and b and c
"3'[a|b]"   // repeat 3 times a|b
"3'^[a|b]"  // repeat 3 times with no reentrance a|b (only when b finishes then can be other execution. Default mode is no buffer)
//given { plugins: {buffer: nr({mode: "buffer", size: 2})} }
"3'buffer'[a|b]" // repeat 3 times, with a buffer of size 2
"a[b|c]2!x"      // a then b|c. If b or c throws, it is retried at most two times or the error is thrown. If no error is thrown, then x
"a[b|c]?x"       // a then b|c. If b or c throws, then it is catched and null is go through the pipe
"w'^'[b,a|c]x"   // watch some files and with no reentrance, in parallel b and a|c. When finishes x (x is passed an array of values [result of b, result of c])
```

Example of compiling and running:

```ts
const {run, compile} = require("ypipe");
const { w } = require("ypipe-watch");

function a({data}){
    return ...
}
...

const options = {
    namespace: {a, b, c}, 
    plugins: {w: w(["./tests/*.js", "./schema/*.*"])}
};

await run("w'[a|'[b,c]]", options, initialData);

//or
const f = compile("w'[a|'[b,c]]", options);

//then
await f("some initial data");
await f("some other data");
```

## Producer / Consumer

A producer / consumer takes some data from previous producer and return some data. But it's not necessary to do process data.

```ts
function myProducerConsumer({data, ctx}){
    if(data === 'x') return 'yuju';
    if(...) ctx.close(); //that closes for example a closer watch
    return null; // that stops the pipeline
}
```

```ctx``` is a special object with a method ```close``` that you can call to close closest plugin. The plugin watch that watches files and run a pipe when there's a change, can be closed this way.

## Plugins

A plugin is a function like this:

```ts
export default (var_a: string, var_b: number, /*etc..*/) => async (next: Next, pipe: FD[], data: Data ) => {

//Example:
//watch plugin
export default (files: string[]) => async (next: Next, pipe: FD[], data: Data ) => {

// next goes to next plugin and return a promise with the result of the pipeline of producer/consumers. If the plugin is complex like parallel, you will need de array of pipes passed to the plugin, and maybe the data in that moment of the pipeline
```

```ts
// Example of non reentrant plugin

import { Next } from '.';

export type MODE = "buffer"|"nobuffer";

export default ({mode, size}: {mode?: MODE, size?: number} = {mode: "nobuffer"}) => {
    let exited = true;
    const buffer: Next[] = [];

    return async function (next: Next){
        if(exited){
            exited = false;
            let ret;
            for(;;){
                ret = await next();
                const _next = buffer.pop();
                if(_next) next = _next;
                else break;
            }
            exited = true;
            return ret;
        }else{
            if(size === undefined || buffer.length < size)
                buffer.push(next);
            return null;
        }
    };
}; 
```

```ts
//Example of parallel plugin

import { FD, Next } from '.';

export default (mode: "all"|"race"|"allSettled" = "all") => async (next: Next, pipes: FD[]) => {
    
    const promises: Promise<any>[] = [];   

    for(const pipe of pipes){
        promises.push(next([pipe]));
    }
    try{
        let result;
        if(mode === "all"){
            result = await Promise.all(promises);
        } 
        //else if (mode === "any") return await Promise.any(promises);
        else if (mode === "race") result = await Promise.race(promises);
        else if (mode === "allSettled") result = await Promise.allSettled(promises);
        return result;
    }catch(err){
        const msg = err instanceof Error ? err.message: "";
        throw new Error(msg);
    }
};
```

A real [example](https://github.com/yellowmachine/example-ypipe): 

```js
const {compile} = require("ypipe")
const { w } = require("ypipe-watch");
const npm = require('npm-commands')
const {docker} = require('./docker')
const {dgraph} = require('./dgraph')
const config = require("./config")

function test(){
    npm().run('tap');
}

const {up, down} = docker({name: "my-container-dgraph-v2.9", 
                           image: "dgraph/standalone:master", 
                           port: "8080"
                        })

const dql = dgraph(config)

async function main() {
    const t = `up[
                    w'[ dql? | test ]
                    down
                 ]`;
    const f = compile(t, {
                            namespace: {up, dql, test, down}, 
                            plugins: {w: w(["./tests/*.js", "./schema/*.*"])}
        });
    await f();
}

main()
```
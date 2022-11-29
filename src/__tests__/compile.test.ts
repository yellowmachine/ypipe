import watch from '../watch';
import { DEBUG, compile, g, Data } from '../index';
import join from '../join';
import nr from '../nr';

DEBUG.v = false;

test("run a|b", async ()=>{
    const a = g('a');
    const b = g('b');

    const t = "a|b";
    const cmp = compile(t, {
        namespace: {a, b}
    });

    const result = await cmp("");
    expect(result).toBe('ab');
});

test("run a|b a!", async ()=>{
    
    const a = g('a!');
    const b = g('b');

    const t = "a|b";
    const cmp = compile(t, {
        namespace: {a, b}
    });

    await expect(cmp("")).rejects.toThrow("a!");

});

test("run a,c|b a!", async ()=>{
    const a = g('a!');
    const b = g('b');
    const c = g('c');

    const t = "'[a,c|b]";
    const cmp = compile(t, {
        namespace: {a, b, c}
    });

    await expect(cmp("")).rejects.toThrow(/^(cb?)?a!/);
});


test("run a,b,c", async ()=>{
    const a = g('a');
    const b = g('b');
    const c = g('c');

    const t = "'[a,b,c]";
    const cmp = compile(t, {
        namespace: {a, b, c}
    });

    const result = await cmp("");
    expect(result).toEqual(["a", "b", "c"]);
});


test("run a,b,c!", async ()=>{
    const a = g('a');
    const b = g('b');
    const c = g('c!');

    const t = "'[a,b,c]";
    const cmp = compile(t, {
        namespace: {a, b, c}
    });

    await expect(cmp("")).rejects.toThrow(/^a?b?c!/);
});

test("run 3'[a|b]", async ()=>{
    const a = g('a,a2,a3');
    const b = g('b,b2,b3');

    const t = "3'[a|b]";
    const cmp = compile(t, {
        namespace: {a, b}
    });

    const result = await cmp("");
    expect(result).toEqual(["ab", "a2b2", "a3b3"]);
});

test("run 3'^[a|b]", async ()=>{
    const a = g('a,a2,a3');
    const b = g('b,b2,b3');

    const t = "3'^[a|b]";
    const cmp = compile(t, {
        namespace: {a, b}
    });

    const result = await cmp("");
    expect(result).toEqual(["aba2b2a3b3", null, null]);
});

test.skip("run 3'buffer'[a|b]", async ()=>{
    const a = g('a,a2,a3');
    const b = g('b,b2,b3');

    const t = "3'buffer'[a|b]";
    const cmp = compile(t, {
        namespace: {a, b},
        plugins: {buffer: nr({mode: "buffer", size: 2})}
    });

    const result = await cmp("");
    expect(result).toEqual(["ab", "aba2b2", null]);
});

test("run a[b|c]2!x", async ()=>{

    const a = g("a,q,y,z");
    const b = g("b!");
    const c = g("c,c2,c3");
    const x = g("x,k,m");

    const t = "a[b|c]2!x";
    const cmp = compile(t, {
        namespace: {a, b, c, x}
    });
    const result = await cmp("");
    expect(result).toEqual("undefinedcx");
});

test("run a[b|c]?x", async ()=>{

    const a = g("a,q,y,z");
    const b = g("b!");
    const c = g("c!");
    const x = g("x,k,m");

    const t = "a[b|c]?x";
    const cmp = compile(t, {
        namespace: {a, b, c, x}
    });
    const result = await cmp("");
    expect(result).toEqual(null);
});

test("run w'^'[b,c]x", async ()=>{

    const a = g("a");
    const b = g("b");
    const c = (data: Data) => {data.ctx.close(false);};
    const x = g("x");

    const t = "w'^'[b,a|c]x";
    const cmp = compile(t, {
        namespace: {a, b, c, x},
        plugins: {w: watch(["*.js"])}
    });

    const result = await cmp("");
    expect(result).toEqual("ax");
});

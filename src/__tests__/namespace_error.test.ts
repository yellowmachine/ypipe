import {DEBUG as wDebug} from '../watch';
import { DEBUG, g, compile } from '../index';

DEBUG.v = false;
wDebug.v = false;

test("plugin namespace error", async ()=> {
    
    const a = g('a');
    const e = g('e');

    const t = "a|w'[e]";
    const cmp = () => compile(t, {
        namespace: {a, e}
    });

    expect(cmp).toThrow(/^Key Error: plugin namespace error: w.*/);
});

test("namespace error", async ()=> {

    const t = "a";
    const cmp = () => compile(t, {
        namespace: {}
    });

    expect(cmp).toThrow(/^Key Error: namespace error: a.*/);
});
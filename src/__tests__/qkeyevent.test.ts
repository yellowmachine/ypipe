import watch, {DEBUG as wDebug} from '../watch';
import { DEBUG, g, compile } from '../index';

DEBUG.v = false;
wDebug.v = false;

test("closing w with keypress q compact mode", async ()=> {
    
    const a = g('a');
    const e = g('e');
    function b(){
        process.stdin.emit("keypress", 'q');
        return null;
    }

    const t = "a|w'[b]e";
    const cmp = compile(t, {
        namespace: {a, b, e},
        plugins: {w: watch(["*.js"])}
    });

    const path = await cmp("");
    expect(path).toEqual('ae');
});
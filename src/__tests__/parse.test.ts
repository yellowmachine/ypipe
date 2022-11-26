import { DEBUG } from '../index';
import { parse, nextToken, TOKEN, matchToken, tokens } from '../parse';

DEBUG.v = false;

const consume = (t: string) => {
    return [...nextToken(t)].map(x => x.value);
};

test('match token name a[', ()=>{
  const r = matchToken(tokens[TOKEN.NAME], "a[");
  expect(r).toEqual({
    value: 'a',
    opts: ["a", ""]
  });
});

test('match token name a3[', ()=>{
  const r = matchToken(tokens[TOKEN.NAME], "a3[");
  expect(r).toEqual({
    value: 'a3',
    opts: ["a3", ""]
  });
});

test('match token name a3?[', ()=>{
  const r = matchToken(tokens[TOKEN.NAME], "a3?[");
  expect(r).toEqual({
    value: 'a3?',
    opts: ["a3", "?"]
  });
});

test("match token plugin a'[", ()=>{
  const r = matchToken(tokens[TOKEN.PLUGIN], "a'[");
  expect(r).toEqual({
    value: "a'",
    opts: ["a"]
  });
});

test("match token plugin a'b3'k'[", ()=>{
  const r = matchToken(tokens[TOKEN.PLUGIN], "a'b3'k'[");
  expect(r).toEqual({
    value: "a'",
    opts: ["a"]
  });
});

test("match token name w'k'a3?[", ()=>{
  const r = matchToken(tokens[TOKEN.NAME], "w'k'a3?[");
  expect(r).toEqual({
    value: "w",
    opts: ["w", ""]
  });
});

test("match token plugin ^w'k'a3[", ()=>{
  const r = matchToken(tokens[TOKEN.NR], "^w'k'a3[");
  expect(r).toEqual({
    value: "^",
    opts: []
  });
});

test("next token", ()=>{
    const t = "a,^b|c[e3";
    const tokens = consume(t);
    expect(tokens).toEqual(["a", ",", "^", "b", "|", "c", "[", "e3"]);
});

test("next token c^[e", ()=>{
    const t = "c^[e";
    const tokens = consume(t);
    expect(tokens).toEqual(["c", "^", "[", "e"]);
});

test("next token []", ()=>{
    const t = "a[b]";
    const tokens = consume(t);
    expect(tokens).toEqual(["a", "[", "b", "]"]);
});

test("next token a|b", ()=>{
    const t = "a|b";
    const tokens = consume(t);
    expect(tokens).toEqual(["a", "|", "b"]);
});

test("order of plugins", ()=>{
  const t = "k'm'p'x'a";
  const p = parse(t);
  const arr = p.c[0];
  const plugins = arr.type === 'array'? arr.c[0].plugins:[];
  expect(plugins).toEqual(['k', 'm', 'p', 'x']);
});

test("parse atom a?", ()=>{
  const t = "a?";
    const p = parse(t);
    expect(p).toEqual(
      {
        type: 'array',
        plugins: ['s'],
        c: [
          {
            type: "array",
            plugins: ['s'],
            c: 
              [
                {
                  type: "atom",
                  name: "a",
                  catched: true,
                  plugins: []
                }
              ]
          }
        ]
      }
    );
});

test("parse", ()=>{
    const t = "a|b";
    const p = parse(t);
    expect(p).toEqual(
    {
        plugins: ['s'],
        c: 
        [
            {
                plugins: ['s'],
                c: [
                {name: "a", type: "atom", catched: false, plugins: []},
                {name: "b", type: "atom", catched: false, plugins: []}
            
                ], 
                type: "array"
            }
        ], 
        type: "array"
    }
    );
});

test("parse a|w[b]e", ()=>{
    const t = "a|w'[b]e";
    const p = parse(t);

    expect(p).toEqual(
        {
            "type": "array",
            plugins: ['s'],
            "c": [
              {
                "type": "array",
                plugins: ['s'],
                "c": [
                  {
                    "type": "atom",
                    "name": "a",
                    plugins: [],
                    catched: false
                  },
                  {
                    "type": "array",
                    plugins: ['w'],
                    "c": [
                      {
                        "type": "array",
                        plugins: ['s'],
                        "c": [
                          {
                            "type": "atom",
                            "name": "b",
                            plugins: [],
                            catched: false
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "type": "atom",
                    "name": "e",
                    plugins: [],
                    catched: false
                  }
                ]
              }
            ]
          }
    );
});

test("parse '[b,c]", ()=>{
  const t = "'[b,c]";
  const p = parse(t);

  expect(p).toEqual(
    {
      "type": "array",
      "c": [
        {
          "type": "array",
          "c": [
            {
              "type": "array",
              "c": [
                {
                  "type": "array",
                  "c": [
                    {
                      "type": "atom",
                      "name": "b",
                      "catched": false,
                      "plugins": []
                    }
                  ],
                  "plugins": [
                    "s"
                  ]
                },
                {
                  "type": "array",
                  "c": [
                    {
                      "type": "atom",
                      "name": "c",
                      "catched": false,
                      "plugins": []
                    }
                  ],
                  "plugins": [
                    "s"
                  ]
                }
              ],
              "plugins": [
                "p"
              ]
            }
          ],
          "plugins": [
            "s"
          ]
        }
      ],
      "plugins": [
        "s"
      ]
    }
  );
});

test("parse k'[^c?]", ()=>{
  const t = "k'[^c?]";
  const p = parse(t);

  expect(p).toEqual(
    {
      "type": "array",
      "c": [
        {
          "type": "array",
          "c": [
            {
              "type": "array",
              "c": [
                {
                  "type": "array",
                  "c": [
                    {
                      "type": "atom",
                      "name": "c",
                      "catched": true,
                      "plugins": ["nr"]
                    }
                  ],
                  "plugins": [
                    "s"
                  ]
                }
              ],
              "plugins": [
                "k"
              ]
            }
          ],
          "plugins": [
            "s"
          ]
        }
      ],
      "plugins": [
        "s"
      ]
    }
  );
});

test("parse a[b|c]2?x", ()=>{
  const t = "a[b|c]2?x";
  const p = parse(t);

  expect(p).toEqual(
    {
      "type": "array",
      "c": [
        {
          "type": "array",
          "c": [
            {
              "type": "atom",
              "name": "a",
              "catched": false,
              "plugins": []
            },
            {
              "type": "array",
              "c": [
                {
                  "type": "array",
                  "c": [
                    {
                      "type": "atom",
                      "name": "b",
                      "catched": false,
                      "plugins": []
                    },
                    {
                      "type": "atom",
                      "name": "c",
                      "catched": false,
                      "plugins": []
                    }
                  ],
                  "plugins": [
                    "s"
                  ]
                }
              ],
              "plugins": [],
              retry: 2,
              retryType: "?"
            },
            {
              "type": "atom",
              "name": "x",
              "catched": false,
              "plugins": []
            }
          ],
          "plugins": [
            "s"
          ]
        }
      ],
      "plugins": [
        "s"
      ]
    }
  );
});
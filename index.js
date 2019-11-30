


import { layoutFormula, renderFormulaLayout, loadKatexFontFaces } from '@flurrux/math-layout-engine';



const interpolateNodes = (corr, t) => {
    const a = corr.from;
    const b = corr.to;

    const positionLerpFunc = corr.interpolatePosition || interpolateVector2;
    const colorLerpFunc = corr.interpolateColor || (() => "white");
    const colorGetter = view(lensPath(["style", "color"]));
    const widthLerpFunc = corr.interpolateWidth || interpolate;
    return {
        ...a,
        position: positionLerpFunc(a.position, b.position, t),
        style: {
            ...a.style,

            color: colorLerpFunc(colorGetter(a), colorGetter(b), t)
        },
        dimensions: {
            ...a.dimensions,
            width: widthLerpFunc(a.dimensions.width, b.dimensions.width, t)
        }
    }
};
const getInterpolatedFormula = (correspondenceMap, t) => {
    return {
        type: "mathlist",
        items: correspondenceMap.map(corr => interpolateNodes(corr, t)),
        style: {
            type: "D",
            fontSize: 40
        }
    }
};

const fadeIn = node => {
    return {
        from: node, to: node,
        interpolateColor: (a, b, t) => `rgba(255, 255, 255, ${t})`
    }
};





const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");


const main = () => {
    const canvasCenter = [canvas.width / 2, canvas.height / 2];
    const style = {
        type: "D",
        fontSize: 40,
        color: "white",
        preventPixelSnapping: true
    };

    /*
    //a*(b+c)
    const formula1 = {
        ...layoutFormula({
            type: "mathlist",
            style,
            items: [
                { type: "ord", value: "a" },
                { type: "bin", value: "*" },
                { type: "open", value: "(" },
                { type: "ord", value: "b" },
                { type: "bin", value: "+" },
                { type: "ord", value: "c" },
                { type: "close", value: ")" }
            ]
        }),
        position: canvasCenter
    };
    //a*b + a*c
    const formula2 = {
        ...layoutFormula({
            type: "mathlist",
            style,
            items: [
                { type: "ord", value: "a" },
                { type: "bin", value: "*" },
                { type: "ord", value: "b" },
                { type: "bin", value: "+" },
                { type: "ord", value: "a" },
                { type: "bin", value: "*" },
                { type: "ord", value: "c" }
            ]
        }),
        position: canvasCenter
    };
    const items1 = formula1.items;
    const items2 = formula2.items;
    const nodeCorrespondence = [
        { from: items1[0], to: items2[0] },
        { 
            from: items1[0], 
            to: items2[4],
            interpolatePosition: (a, b, t) => [
                interpolate(a[0], b[0], t),
                upDownSin(normalizeClamped(0.2, 0.95, t)) * 40
            ]
        },
        { from: items1[1], to: items2[1] },
        { 
            from: items1[1], 
            to: items2[5],
            interpolatePosition: (a, b, t) => [
                interpolate(a[0], b[0], t),
                upDownSin(normalizeClamped(0.1, 0.85, t)) * 40
            ]
        },
        { from: items1[3], to: items2[2] },
        { from: items1[5], to: items2[6] },
        { from: items1[4], to: items2[3] },
        {
            from: items1[2], to: setPosition([-40, 0])(items1[2]),
            interpolateColor: (a, b, t) => `rgba(255, 255, 255, ${1 - t})`
        },
        {
            from: items1[6], to: setPosition([200, 0])(items1[6]),
            interpolateColor: (a, b, t) => `rgba(255, 255, 255, ${1 - t})`
        }
    ];
    */


    const preProcess = pipe(layoutFormula, setPosition([0, 0]), globalizePositions);

    const node1 = pipe(preProcess, alignSubNodeToGlobalPosition(canvasCenter, ["items", 1]))({
        type: "mathlist", style,
        items: [
            {
                type: "fraction",
                numerator: { type: "ord", value: "a" },
                denominator: { type: "ord", value: "b" },
            },
            { type: "bin", value: "+" },
            {
                type: "fraction",
                numerator: { type: "ord", value: "c" },
                denominator: { type: "ord", value: "d" },
            }
        ]
    });
    const node2 = pipe(preProcess, alignSubNodeToGlobalPosition(canvasCenter, ["items", 1]))({
        type: "mathlist", style,
        items: [
            {
                type: "fraction",
                numerator: { 
                    type: "mathlist",
                    items: [
                        { type: "ord", value: "a" },
                        { type: "bin", value: "*" },
                        { type: "ord", value: "d" }
                    ]
                },
                denominator: {
                    type: "mathlist",
                    items: [
                        { type: "ord", value: "b" },
                        { type: "bin", value: "*" },
                        { type: "ord", value: "d" }
                    ]
                }
            },
            { type: "bin", value: "+" },
            {
                type: "fraction",
                numerator: { 
                    type: "mathlist",
                    items: [
                        { type: "ord", value: "b" },
                        { type: "bin", value: "*" },
                        { type: "ord", value: "c" }
                    ]
                },
                denominator: {
                    type: "mathlist",
                    items: [
                        { type: "ord", value: "b" },
                        { type: "bin", value: "*" },
                        { type: "ord", value: "d" }
                    ]
                }
            }
        ]
    });
    let node3 = pipe(preProcess)({
        type: "fraction", style,
        numerator: { 
            type: "mathlist",
            items: [
                { type: "ord", value: "a" },
                { type: "bin", value: "*" },
                { type: "ord", value: "d" },
                { type: "bin", value: "+" },
                { type: "ord", value: "b" },
                { type: "bin", value: "*" },
                { type: "ord", value: "c" },
            ]
        },
        denominator: {
            type: "mathlist",
            items: [
                { type: "ord", value: "b" },
                { type: "bin", value: "*" },
                { type: "ord", value: "d" }
            ]
        }
    });
    node3 = translateGlobalPositionedFormulaTree(
        subtractVectors(
            canvasCenter, [
                view(lensPath(["numerator", "items", 3, "position", 0]))(node3),
                view(lensPath(["rule", "position", 1]))(node3)
            ]
        )
    )(node3);

    const nodeCorrespondence1 = [
        { 
            from: node1.items[0].numerator, 
            to: node2.items[0].numerator.items[0] 
        },
        { 
            from: node1.items[0].denominator, 
            to: node2.items[0].denominator.items[0] 
        },
        { 
            from: node1.items[0].rule, 
            to: node2.items[0].rule
        },
        fadeIn(node2.items[0].denominator.items[1]),
        {
            from: node1.items[2].denominator,
            to: node2.items[0].denominator.items[2]
        },
        fadeIn(node2.items[0].numerator.items[1]),
        {
            from: node1.items[2].denominator,
            to: node2.items[0].numerator.items[2]
        },

        { from: node1.items[1], to: node2.items[1] },

        { 
            from: node1.items[2].numerator, 
            to: node2.items[2].numerator.items[2] 
        },
        { 
            from: node1.items[2].denominator, 
            to: node2.items[2].denominator.items[2] 
        },
        { 
            from: node1.items[2].rule, 
            to: node2.items[2].rule
        },
        fadeIn(node2.items[2].denominator.items[1]),
        {
            from: node1.items[0].denominator,
            to: node2.items[2].denominator.items[0]
        },
        fadeIn(node2.items[2].numerator.items[1]),
        {
            from: node1.items[0].denominator,
            to: node2.items[2].numerator.items[0]
        },
    ];
    const nodeCorrespondence2 = [
        ...[0, 1, 2].map(ind => {
            return {
                from: node2.items[0].numerator.items[ind],
                to: node3.numerator.items[ind]
            }
        }),
        ...[0, 1, 2].map(ind => {
            return {
                from: node2.items[2].numerator.items[ind],
                to: node3.numerator.items[4 + ind]
            }
        }),
        {
            from: node2.items[1],
            to: node3.numerator.items[3]
        },
        ...[0, 1, 2].map(ind => {
            return {
                from: node2.items[0].denominator.items[ind],
                to: node3.denominator.items[ind]
            }
        }),
        ...[0, 1, 2].map(ind => {
            return {
                from: node2.items[2].denominator.items[ind],
                to: node3.denominator.items[ind]
            }
        }),
        {
            from: node2.items[0].rule,
            to: node3.rule,
            interpolateWidth: (a, b, t) => interpolate(a, b / 2, t)
        },
        {
            from: node2.items[2].rule,
            to: node3.rule,
            interpolatePosition: (a, b, t) => [
                interpolate(a[0], b[0] + node3.rule.dimensions.width / 2, t),
                interpolate(a[1], b[1], t)
            ],
            interpolateWidth: (a, b, t) => interpolate(a, b / 2, t)
        },
    ];

    let t = 0;

    const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        const node = setPosition([0, 0])(getInterpolatedFormula(t < 1 ? nodeCorrespondence1 : nodeCorrespondence2, t % 1));
        renderFormulaLayout(canvas, ctx, node); 
        ctx.restore();
    };
    render();

    document.body.insertAdjacentHTML("beforeend", `<input type="range" min="0" max="1.999" step="0.001" value="0" />`);
    document.querySelector("input").addEventListener("input", e => {
        t = parseFloat(e.srcElement.value);
        render();
    });
};
loadKatexFontFaces().then(main);
const format = require("string-template");

// const core = `#g{gNum} #foo{fooNum} .d {
//     fill: hsla({hue}, 70%, 70%, 100%);
//   }
//   #g{gNum} #foo{fooNum} #v {
//     background-color: hsla({hue}, 50%, 92%, 100%);
//   }
//   #g{gNum} #foo{fooNum} .h,
//   #g{gNum} .h{fooNum} {
//     fill: hsla({hue}, 50%, 92%, 100%);
//   }`;

const core = `#g{gNum} #foo{fooNum} .d {
  fill: hsla({hue}, 70%, 70%, 100%);
}
#g{gNum} #foo{fooNum} #v {
  background-color: hsla({hue}, 50%, 50%, 100%);
}
#g{gNum} #foo{fooNum} .h,
#g{gNum} .h{fooNum} {
  fill: hsla({hue}, 50%, 50%, 100%);
}`;

const targetHues = [
  [213, 213, 213, 268, 268, 268, 213, 213, 213],
  [213, 213, 213, 268, 268, 268, 268, 268, 213],
  [213, 213, 213, 80, 80, 80, 80, 213, 213],
  [213, 213, 213, 80, 295, 80, 295, 80, 213],
  [213, 213, 295, 80, 80, 80, 80, 80, 213],
  [213, 213, 213, 80, 108, 108, 213, 213, 213],
  [213, 80, 295, 80, 80, 108, 80, 213, 213],
  [213, 213, 80, 80, 108, 108, 213, 213, 213],
  [213, 213, 213, 80, 213, 80, 213, 213, 213],
];

let targetHuesTransformed = [];
const ENTRIES_PER_ROW = 3;
const ENTRIES_PER_COL = 3;
// for (let i = 0; i < targetHues.length; i++) {
//   for (let j = 0; j < targetHues[i].length; j++) {
//     const popWillieRow = Math.floor(i / ENTRIES_PER_ROW);
//     const popWillieCol = Math.floor(j / ENTRIES_PER_COL);
//   }
// }
let popWillieRow = 0;
let popWillieCol = 0;
for (let popWillieRow = 0; popWillieRow < 3; popWillieRow++) {
  for (let popWillieCol = 0; popWillieCol < 3; popWillieCol++) {
    // Here are within a particular pop willie
    let currArray = [];
    const startRowIdx = popWillieRow * 3;
    const startColIdx = popWillieCol * 3;
    for (let rowInPopWillie = 0; rowInPopWillie < 3; rowInPopWillie++) {
      for (let colInPopWillie = 0; colInPopWillie < 3; colInPopWillie++) {
        const hue = targetHues[startRowIdx + rowInPopWillie][startColIdx + colInPopWillie];
        console.log("WOAH!", hue);
        currArray.push(hue);
      }
    }
    targetHuesTransformed.push(currArray);
  }
}

let gs = [];
for (let i = 1; i <= 9; i++) {
  gs.push(i);
}
let foos = [];
for (let i = 0; i < 9; i++) {
  foos.push(i);
}
let style = "";
const hues = [];
for (let i = 0; i < 9; i++) {
  const g = gs[i];
  for (let j = 0; j < 9; j++) {
    const f = foos[j];
    let hue;
    if (targetHuesTransformed.length > 0) {
      hue = targetHuesTransformed[i][j];
    } else {
      hue = Math.floor(360 * Math.random());
    }
    hues.push(hue);
    const currStyle = format(core, { gNum: g, fooNum: f, hue });
    style += currStyle;
  }
}
console.log(style);
console.log(JSON.stringify(hues));

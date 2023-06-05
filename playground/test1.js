//if vs else if
// let x = 3;

// if (x < 10) {
//   console.log("ten");
// }
// if (x < 100) {
//   console.log("hun");
// }
// if (x < 1000) {
//   console.log("thou");
// }
/////////////////////////////////////////
//includes vs for-loop+ if
// let p = [1, 2, 3, 4];

// // p.includes(5);

// // if (p.includes(4)) {
// //   console.log("Hi");
// // }

// for (let i = 0; i < p.length; i++) {
//   if (p.includes(4)) {
//     console.log("Hi");
//   }
// }
// console.log(p.includes(4));
////////////////////////////////////
//find
// let p = [1, 2, 3, 4];

// let k = p.find(function (params) {
//   if (params == 5) {
//     return params;
//   }
// });

// console.log(k);
///////////////////////////////
const myArray = [
  "tom",
  "huck",
  "hamlet",
  "horetio",
  "harry",
  "ron",
  "alaska",
  "theodor",
  "finch",
  "violet",
  "macbeth",
  "othello",
  "rodrigo",
];

//
const shuffled = myArray.sort(function (a, b) {
  const random = 0.5 - Math.random();
  if (random < 0) {
    return -1;
  } else if (random > 0) {
    return 1;
  } else {
    return 0;
  }
});

// console.log(shuffled, "shuffled");
// console.log(myArray, "myArray");

//
// let countex = 0;
// for (let i = 0; i < shuffled.length; i++) {
//   //   const element = shuffled[i];
//   if (myArray.includes(shuffled[i])) {
//     countex = countex + 1;
//   }
// }
// console.log(countex, "countex");

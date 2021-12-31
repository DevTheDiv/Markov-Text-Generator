


let fs = require("fs");
let Markov = require( "./dist/Markov/Markov");




let text = fs.readFileSync("./examples/example.txt", "utf-8").toLowerCase();

let split = 2;

let m = new Markov();




// the length of the parts to ingest(
let length = 4;

// train with the data provided
let i = 0;

let progress = 0;

let passes = 1;
let pass = 1;


while(true) {
    console.log(`=====  Passes: ${pass}/${passes}  Progress: ${progress}%  |  Memories: ${m.indexers.length}  |  Itteration: ${i}  =====`);

    i += Math.round(length / 2);

    if(i > text.length / split)  {
        pass += 1;
        i = 0;
    };
    if(pass > passes) break;

    // calculate our progression
    progress = Math.round((i / (text.length / split)) * 100);



    let part = text.slice( i - length, i);

    if(part.length >= length) {
        m.ingest(part);
    }

}



let finalized = m.generate("berry", 120);

console.log("final: ", `|| ${finalized} ||`);


console.log("Done");
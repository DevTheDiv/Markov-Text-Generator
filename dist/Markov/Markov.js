

let mathjs = require("mathjs");
let math = mathjs;

class Markov {

    tokens = [];


    // indexers are unique pattern (each index in the indexer corresponds with the "memory")
    indexers = [];

    // this will be our markov matrix
    memories = [[]];

    
    constructor() {

    }



    _tokenize(data){

        let tokenized = [];

        for(let token of data){
            // check if token exists or not
            let tokenIndex = this.tokens.findIndex(_token => _token === token);
            // collect token if it does not exist
            if(tokenIndex === -1) {
                this.tokens.push(token);
                tokenized.push(this.tokens.length -1);
            } else {

                tokenized.push(tokenIndex);
            }
        }

        return tokenized;
    }

    _revtokenize(token) {
        return token.map(d => this.tokens[d]);
    }

    
    _findMemory(data){



        for(let i = 0; i < this.indexers.length; i++){ 
            
    
            if(data.length !== this.indexers[i].length) continue;

            let a = data;
            let b = this.indexers[i];



            let found = !mathjs.max(mathjs.abs( mathjs.subtract(a, b)));
    
            if(found) {
                return i;
            }            
        }
        return -1;
    }

    _createMemory(data){
        this.indexers.push(data);

        let size = this.indexers.length;

        // remember this corresponds with the indexers
        this.memories = mathjs.resize(this.memories, [size, size],0);

        return this.indexers.length - 1;
    }

    _findAndCreateMemory(data){
        let mem = this._findMemory(data);

        if(mem === -1) {
            mem = this._createMemory(data);
        }
        return mem;
    }

    _associateMemories(a,b){
        this.memories[a][b] += 1;
    }


    ingest(data){
        console.log("Ingesting: ", data);
        // creates or finds token based on ingested data
        let tokens = this._tokenize(data);
        console.log(tokens);

        
        let patterns = extractPatterns(tokens);

        for(let p of patterns) {

            let a = p[0];
            let b = p[1];

            let aindex = this._findAndCreateMemory(a);
            let bindex = this._findAndCreateMemory(b);
            
            this._associateMemories(aindex, bindex);
        }
    }


    nextPossible(data){


        let tokens = data;

        // split up the data in parts
        let parts = [];
        let matches = [];
        let possibles = [];



        // tokens = tokens.slice(tokens.length - this.memories.length);
        for(let i = 0; i < tokens.length; i++){
            let part = tokens.slice(i);


            if(!part.length) continue;



            
            let index = this._findMemory(part, true);




            if(index === -1) continue;

            parts.push(part);
            matches.push(index);
            possibles.push(this.memories[index]);
        }

        // console.log(parts);

        
        // console.log(matches);
        // console.log(possibles); 



        let ods = [];

        let tokes = [];


        for(let p of possibles){
            let max = mathjs.max(p);
            let _p = mathjs.divide(p, max);
            if (!ods.length) ods = _p;
            else mathjs.add(ods, _p);
            
            let i = p.indexOf(max);

            tokes.push(
                this._revtokenize(this.indexers[i]).join("")
            );
        }

        let max = mathjs.max(ods);
        let i = ods.indexOf(max);

        // return ods[i]; 

        // let bmax =  mathjs.max(possibles[0]);
        // let bi = possibles[0].indexOf(bmax)
        // return possibles[bi];

        return mathjs.pickRandom(tokes);

    }


    generate(data, length = 1){


        console.log(data);


        
        let d = data;

        // let finalized = this._tokenize(d);

        // let out = this.nextPossible(finalized)



        for(let i = 0; i < length; i++) {
            let finalized = this._tokenize(d);

            let out = this.nextPossible(finalized)
            d += out;


        }

        return d;

        // console.log("final: ", `|| ${d} ||`);

    }


    export(){
        let { tokens, indexers, memories } = this;
        return {
            tokens, indexers, memories
        }
    }

    import (data){
        let { tokens, indexers, memories } = data;
        this.tokens = tokens;
        this.indexers = indexers;
        this.memories = memories;
    }

}


function extractPatterns(data){
    let patterns = [];

    for(let i = 0; i < data.length; i++){
        let base = [...data];
        let _b = base.splice(i); 
        let b = _b.length ? [_b[0]] : [];
        let a = base;

        // we need them to have a length in order to be stored
        if(!a.length || !b.length) continue;


        patterns.push([a,b]);
    }
    // console.log(patterns);

    return patterns;
}



module.exports = Markov;

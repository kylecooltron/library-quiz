

/*

Special notes in regards to validating "Traditional" question types (text input):

There are some cases which are impossible to distinguish given the current way the spreadsheet is set up.

Example:
  "In what river was Jesus baptized?"
  And the answer is "River Jordan"
  If someone types the word "River" it will return correct.

  Mandating exact match is obvioously not a good idea, seeing as some answers are:
  "That her barrel of flour and cruse of oil would not fail until the famine ended"

  My original thought was to not count words that are also contained in the question text.
  However, sometimes the entire answer is contained in the question text.

  Such as: "Did the wise men who followed the star of Bethlehem come from the east or the west?"

  "east" would be eliminated as a valid answer.

  SOLUTIONS:
  A) set up another column with KEYWORDS that are used for answer checking instead of looking through
  the actual text the user sees as the "correct answer" after submiting their guess.
  So the user would still see CORRECT ANSWER WAS: "River Jordan", but the keyword list would only be "Jordan"

  B) set up another column which indicates a matching style: exact, keyword, anyword, etc.


*/


export function checkAnswer(player_guess, correct_answer, question_type) {
  /*
  * This function is a little convoluted, but it gets the job done.
  */

  //default is false
  let correct = false;


  if(question_type === "Traditional"){

  // set both guess and answer to lowercase
  let guess = player_guess.toLowerCase();
  let answer = correct_answer.toLowerCase();

  // if it's an exact match
  if(guess === answer){
    correct = true;

  // if we remove whitespace/return/tabs and it's an exact match
  }else if (guess.trim() === answer.trim()) {
    correct = true;

  // otherwise
  }else{

    // get rid of any symbols or filler words
    guess = guess.replace(/[^a-zA-Z0-9 ]/g, "");
    guess = guess.replace(/\b(?:the|it is|we all|an?|by|to|you|[mh]e|she|they|we...)\b/ig, '');
    answer = answer.replace(/[^a-zA-Z0-9 ]/g, "");
    answer = answer.replace(/\b(?:the|it is|we all|an?|by|to|you|[mh]e|she|they|we...)\b/ig, '');
    
    // split up guess words into a list
    for(let word of guess.split(" ")){
      // correct if answer contains any of the words we guessed (that aren't filler words)
      if(answer.split(" ").includes(word)){
        // make sure the word is more than one letter for it to count
        if(answer.split(" ").find(e => e === word).length > 1){
          correct = true;
        }
      }
    }

    // if we still haven't determined it's correct
    if(!correct){

      // assume correctness
      let defaultcorrect = true;

      // get rid of anything that is not a number
      let guessNumbers = guess.match(/[-+]?[0-9]*\.?[0-9]+/g);
      
      // stop this method if we didn't find numbers in the string
      if(guessNumbers == null){
        defaultcorrect = false;
      }else{
        if(guessNumbers.length === 0){
          defaultcorrect = false;
        }
      }

      if(defaultcorrect){
        // for every number (groups of numbers) in our guess
        for(let number of guessNumbers){
          // if the answer doesn't include the word version of that number
          if(!answer.includes(stringifyNumber(number))){
            // cancel default correctness
            defaultcorrect = false;
          }
        }
      }
  
      if(defaultcorrect === true){
        correct = true;
      }else{


        // split answer/guess into lists of words
        let guess_words = guess.split(" ");
        let answer_words = answer.split(" ");

        // loop through every possible match up of words against eachother
        guess_words.forEach( gword => {
          answer_words.forEach( aword => {

            // trim whitespace
            let gz_word = gword.trim();
            let az_word = aword.trim();

            // break each word into list of letters
            let guess_letters = gz_word.split("");
            let answer_letters = az_word.split("");

            // set default mininum requirement for matching letters
            let min_required_match_letters = 1;

            // if the answer has only two letters
            if(answer_letters.length <=2 ){
              // both must be matched
              min_required_match_letters = answer_letters.length;
            }else{
              // otherwise 80 percent of the answer letters must be found in the guess
              min_required_match_letters = Math.round(answer_letters.length * 0.80);
            }

            // if the guess word is longer than the answer word, make the minimum match requirement 
            // 80 percent of the guessed letters to make sure people don't just type "abcdefghijklmnopqrstuvwxyz"
            if(min_required_match_letters < Math.round(guess_letters.length * 0.80) ){
              min_required_match_letters = Math.round(guess_letters.length * 0.80);
            }


            // matchrange allows some letters to be out of order
            let matchrange = 0.7;

            // if this word is 4 digits
            if(answer_letters.length === 4){
              if(answer_letters.every(function(element) {return typeof element === 'number';})){
  
                // each digit must match exactly (because it's probably a date)
                min_required_match_letters = 4;
                // ensure digits are in exact order
                matchrange = 0;
              }
            }

            // initialize defaults
            let matching_letters = 0;
            let halfmatch = 0;
            let indx = 0;

            // for every guess letter
            for(let letter of guess_letters){
              let lookIndex = answer_letters.findIndex((item) => item === letter);
              // if it's found in the answer word
              if(lookIndex !== -1){
                // count it as a match
                matching_letters += 1;
                // if it's not in the exact right place
                if(lookIndex !== indx){
                  // count a half match
                  halfmatch += 1;
                }
                // get rid of that letter so we can't match it a second time
                answer_letters.slice(lookIndex, 1);
              }
              // increment index
              indx += 1;
            }

            if( matchrange !== 0){
              // five letter words have to be 50 percent in the right order
              if(matching_letters <=5){
                matchrange = 0.5;
              }
              // four letters or less can't have a single letter off I decided
              if(matching_letters <=4){
                // might as well be zero
                matchrange = 0.1;
              }
            }
            
            // if this word passes the match and order thresholds
            if(matching_letters >= min_required_match_letters && halfmatch <= matching_letters*matchrange){
              correct = true;
            }

            
          });
        });

        

      }
    }

    // if we still don't have a match
    if(!correct){

      let guessNumbers = guess.match(/[-+]?[0-9]*\.?[0-9]+/g);
      if(guessNumbers){
      guessNumbers.forEach(guessnum => {
        answer.split(" ").forEach(wordans => {
              // convert digits into english numbers and see if they are found in the answer
              if(numberToEnglish(guessnum).includes(wordans)){
                correct = true;
              }
        });
      });
    }

    }

    // if we still don't have a match
    if(!correct){
      let guessWords = guess.split(" ");
      guessWords.forEach(gword => {
          answer.split(" ").forEach(a_wordz => {
            // convert words into digits and see if they are found in the answer
            if(String(a_wordz) === String(text2num(gword))){
              correct = true;
            }
          })
      });
    }

  }
  }

  if(question_type === "Multiple Choice"){
    correct = (player_guess.toLowerCase().replace(/\s/g, '') === correct_answer.toLowerCase().replace(/\s/g, ''))
  }
  
  // when all is said and done return our conclusion
  return correct;
}



// methods used from stackoverflow  below - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


/**
 * Convert an integer to its words representation
 * 
 * @author Tibos (https://stackoverflow.com/users/1669279/tibos)
 * @source https://stackoverflow.com/questions/20425771/how-to-replace-1-with-first-2-with-second-3-with-third-etc
 */
 const special = ['zeroth','first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelvth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'];
 const deca = ['twent', 'thirt', 'fourt', 'fift', 'sixt', 'sevent', 'eight', 'ninet'];
 function stringifyNumber(n) {
   if (n < 20) return special[n];
   if (n%10 === 0) return deca[Math.floor(n/10)-2] + 'ieth';
   return deca[Math.floor(n/10)-2] + 'y ' + special[n%10];
 }


/**
 * Convert an integer to its words representation
 * 
 * @author McShaman (http://stackoverflow.com/users/788657/mcshaman)
 * @source http://stackoverflow.com/questions/14766951/convert-digits-into-words-with-javascript
 */
 function numberToEnglish(n, custom_join_character) {

  var string = n.toString(),
      units, tens, scales, start, end, chunks, chunksLen, chunk, ints, i, word, words;

  var and = custom_join_character || 'and';

  /* Is number zero? */
  if (parseInt(string) === 0) {
      return 'zero';
  }

  /* Array of units as words */
  units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

  /* Array of tens as words */
  tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  /* Array of scales as words */
  scales = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion', 'tredecillion', 'quatttuor-decillion', 'quindecillion', 'sexdecillion', 'septen-decillion', 'octodecillion', 'novemdecillion', 'vigintillion', 'centillion'];

  /* Split user arguemnt into 3 digit chunks from right to left */
  start = string.length;
  chunks = [];
  while (start > 0) {
      end = start;
      chunks.push(string.slice((start = Math.max(0, start - 3)), end));
  }

  /* Check if function has enough scale words to be able to stringify the user argument */
  chunksLen = chunks.length;
  if (chunksLen > scales.length) {
      return '';
  }

  /* Stringify each integer in each chunk */
  words = [];
  for (i = 0; i < chunksLen; i++) {

      chunk = parseInt(chunks[i]);

      if (chunk) {

          /* Split chunk into array of individual integers */
          ints = chunks[i].split('').reverse().map(parseFloat);

          /* If tens integer is 1, i.e. 10, then add 10 to units integer */
          if (ints[1] === 1) {
              ints[0] += 10;
          }

          /* Add scale word if chunk is not zero and array item exists */
          if ((word = scales[i])) {
              words.push(word);
          }

          /* Add unit word if array item exists */
          if ((word = units[ints[0]])) {
              words.push(word);
          }

          /* Add tens word if array item exists */
          if ((word = tens[ints[1]])) {
              words.push(word);
          }

          /* Add 'and' string after units or tens integer if: */
          if (ints[0] || ints[1]) {

              /* Chunk has a hundreds integer or chunk is the first of multiple chunks */
              if (ints[2] || (!i && chunksLen)) {
                  words.push(and);
              }

          }

          /* Add hundreds word if array item exists */
          if ((word = units[ints[2]])) {
              words.push(word + ' hundred');
          }

      }

  }

  return words.reverse().join(' ');

}

/**
 * Convert an word to an integer
 * 
 * @author Greg Hewgill and JavaAndCSharp(https://stackoverflow.com/users/893/greg-hewgill, https://stackoverflow.com/users/631193/javaandcsharp)
 * 
 * @source https://stackoverflow.com/questions/11980087/javascript-words-to-numbers
 */


var Small = {
  'zero': 0,
  'one': 1,
  'two': 2,
  'three': 3,
  'four': 4,
  'five': 5,
  'six': 6,
  'seven': 7,
  'eight': 8,
  'nine': 9,
  'ten': 10,
  'eleven': 11,
  'twelve': 12,
  'thirteen': 13,
  'fourteen': 14,
  'fifteen': 15,
  'sixteen': 16,
  'seventeen': 17,
  'eighteen': 18,
  'nineteen': 19,
  'twenty': 20,
  'thirty': 30,
  'forty': 40,
  'fifty': 50,
  'sixty': 60,
  'seventy': 70,
  'eighty': 80,
  'ninety': 90
};

var Magnitude = {
  'thousand':     1000,
  'million':      1000000,
  'billion':      1000000000,
  'trillion':     1000000000000,
  'quadrillion':  1000000000000000,
  'quintillion':  1000000000000000000,
  'sextillion':   1000000000000000000000,
  'septillion':   1000000000000000000000000,
  'octillion':    1000000000000000000000000000,
  'nonillion':    1000000000000000000000000000000,
  'decillion':    1000000000000000000000000000000000,
};

var a, n, g;

function text2num(s) {
  a = s.toString().split(/[\s-]+/);
  n = 0;
  g = 0;
  a.forEach(feach);
  return n + g;
}

function feach(w) {
  var x = Small[w];
  if (x != null) {
      g = g + x;
  }
  else if (w === "hundred") {
      g = g * 100;
  }
  else {
      x = Magnitude[w];
      if (x != null) {
          n = n + g * x
          g = 0;
      }
      else { 
          // do something
      }
  }
}


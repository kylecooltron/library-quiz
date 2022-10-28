
const special = ['zeroth','first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelvth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'];
const deca = ['twent', 'thirt', 'fourt', 'fift', 'sixt', 'sevent', 'eight', 'ninet'];
// This function was provided by Tibos on stack overflow https://stackoverflow.com/questions/20425771/how-to-replace-1-with-first-2-with-second-3-with-third-etc
function stringifyNumber(n) {
  if (n < 20) return special[n];
  if (n%10 === 0) return deca[Math.floor(n/10)-2] + 'ieth';
  return deca[Math.floor(n/10)-2] + 'y-' + special[n%10];
}

export function checkAnswer(player_guess, correct_answer, question_type) {

  //default is false
  let correct = false;

  if(question_type === "Traditional"){

  let guess = player_guess.toLowerCase();
  let answer = correct_answer.toLowerCase();

  if(answer.includes(guess)){
    correct = true;
  }else{
    // get rid of any symbols or filler words
    guess.replace(/[^a-zA-Z0-9 ]/g, "");
    guess.replace(/\b(?:the|it is|we all|an?|by|to|you|[mh]e|she|they|we...)\b/ig, '');
    answer.replace(/[^a-zA-Z0-9 ]/g, "");
    answer.replace(/\b(?:the|it is|we all|an?|by|to|you|[mh]e|she|they|we...)\b/ig, '');

    for(let word of guess.split(" ")){
      // correct if answer contains any of the words we guessed (that aren't filler words)
      if(answer.split(" ").includes(word)){
        // make sure the word is more than one letter
        if(answer.split(" ").find(word).length > 1){
          correct = true;
        }
      }
    }

    if(!correct){
      let defaultcorrect = true;
      let guessNumbers = guess.match(/[-+]?[0-9]*\.?[0-9]+/g);
      if(guessNumbers == null){
        defaultcorrect = false;
      }else{
        if(guessNumbers.length === 0){
          defaultcorrect = false;
        }
      }
      if(defaultcorrect){
        for(let number of guessNumbers){
          if(!answer.includes(stringifyNumber(number))){
            defaultcorrect = false;
          }
        }
      }
  
      if(defaultcorrect === true){
        correct = true;
      }else{
        let guess_letters = guess.split("");
        let answer_letters = answer.split("");
        let min_required_match_letters = 1;
        if(answer_letters.length <=2 ){
          min_required_match_letters = answer_letters.length;
        }else{
          min_required_match_letters = Math.round(answer_letters.length * 0.80);
        }
        if(min_required_match_letters < Math.round(guess_letters.length * 0.80) ){
          min_required_match_letters = Math.round(guess_letters.length * 0.80);
        }

        if(answer_letters.length === 4){
          if(answer_letters.every(function(element) {return typeof element === 'number';})){
            min_required_match_letters = 4;
          }
        }

        let matching_letters = 0;
        for(let letter of guess_letters){
          let lookIndex = answer_letters.findIndex((item) => item === letter);
          if(lookIndex !== -1){
            matching_letters += 1;
            answer_letters.slice(lookIndex, 1);
          }
        }
        if(matching_letters >= min_required_match_letters){
          correct = true;
        }
      }
    }
  }
  }

  if(question_type === "Multiple Choice"){
    correct = (player_guess.toLowerCase().replace(/\s/g, '') === correct_answer.toLowerCase().replace(/\s/g, ''))
  }
  
  return correct;
}
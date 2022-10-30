

/*

Note: Using .TSV because answers contin commas

*/

function tsvToArray(str) {
  /*
  * parse tsv into array of arrays
  */
  let arrayAll = []
  let rows = str.slice(str.indexOf("\n") + 1).split("\n")
  for(const row of rows){
    arrayAll.push(row.split('\t'))
  }
  return arrayAll;
}


// Parse TSV
export function getSpreadsheetInfo (setQuestionsData, CHECK_FOR_COLUMNS) {

  fetch('/library-quiz/trivia_questions.tsv')
  .then((response) => response.text())
  .then((sheetsinfo) => {

      // column index used to sort by "childrens", "easy", etc.
      const question_difficulty_column_index = 3;
      // parse tsv
      let sheetsArray = tsvToArray(sheetsinfo);
      let validArray = sheetsArray.filter((row) => {
        return (
          row.length >= CHECK_FOR_COLUMNS 
          // validation to make sure columns 0-5 are not blank
        );
      });
      // sort list into seperate difficulties lists for faster question lookup
      let finalArray = [
        validArray.filter((row) => {
          return row[question_difficulty_column_index].toLowerCase() === "children";
        }),
        validArray.filter((row) => {
          return row[question_difficulty_column_index].toLowerCase() === "easy";
        }),
        validArray.filter((row) => {
          return row[question_difficulty_column_index].toLowerCase() === "medium";
        }),
        validArray.filter((row) => {
          return row[question_difficulty_column_index].toLowerCase() === "hard";
        })
      ]

      // returns questions as multidimensional array
      setQuestionsData(finalArray);
      return finalArray
  })
  .catch((err) => {
    console.log(err.message);
  });
    
}
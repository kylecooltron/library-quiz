

function csvToArray(str) {
  let arrayAll = []
  let rows = str.slice(str.indexOf("\n") + 1).split("\n")
  for(const row of rows){
    arrayAll.push(row.split('\t'))
  }
  return arrayAll;
}


// Parse CSV
export function getSpreadsheetInfo (setQuestionsData, CHECK_FOR_COLUMNS) {
  fetch('/library-quiz/trivia_questions.tsv')
  .then((response) => response.text())
  .then((sheetsinfo) => {

      // used to sort by "childrens", "easy", etc.
      const question_difficulty_column_index = 3;

      let sheetsArray = csvToArray(sheetsinfo);
      // sort list into difficulties and do some validation
      let validArray = sheetsArray.filter((row) => {
        return (
          row.length >= CHECK_FOR_COLUMNS 
          // extra validation to make sure columns 0-5 are not blank
 
        );
      });
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


      // returns questions an object of arrays
      setQuestionsData(finalArray)
      return finalArray
  })
  .catch((err) => {
    console.log(err.message);
  });
    
}
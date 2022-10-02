

function csvToArray(str) {
  let arrayAll = []
  let rows = str.slice(str.indexOf("\n") + 1).split("\n")
  for(const row of rows){
    arrayAll.push(row.split('\t'))
  }
  return arrayAll;
}

// Parse CSV
export function getSpreadsheetInfo (setQuestionsData) {
  fetch('/library-quiz/trivia_questions.tsv')
  .then((response) => response.text())
  .then((sheetsinfo) => {
      let sheetsArray = csvToArray(sheetsinfo);
      // returns questions an object of arrays
      setQuestionsData(sheetsArray)
      return sheetsArray
  })
  .catch((err) => {
    console.log(err.message);
  });
    
}
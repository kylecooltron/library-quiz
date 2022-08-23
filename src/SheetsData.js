
// GET questions data using Google Spreadsheets API

//https://docs.google.com/spreadsheets/d/1SD0JubOCZKs5Tv8dSZ2nOZv4sHCUfdTFcSH9X5AWhok/edit?usp=sharing


const spreadsheetID = "1SD0JubOCZKs5Tv8dSZ2nOZv4sHCUfdTFcSH9X5AWhok"
// const spreadsheetID2 = "2PACX-1vTT8TrZ1Mz976hXu6Y3RSrEfQz30W6Ex76ybL2YKaO997ArhenW5DLxQkIFROWX6mjlVfPo_KpuL4d5"
// const accessToken = "ya29.A0AVA9y1soky2N9gjsmvWWl8vy62GNlifogO6l4pjIG6fOUbOaWpnsNp3fCS_OUWiRp9Ld6LLqNAQspf3w7Rch7-1Lr0CsPW9GBAmUDQDdC9CeqA9m-q9xulGxuweIU6B4E4A743O5Om7CnZgNw6iAwqzhHV1VUQaCgYKATASATASFQE65dr80msHOEoIKBqbkw1qBPzhIQ0165"
const apiKey = "AIzaSyDWY32LVY2NipCPBN350NTd_xBOShOYWZg"

export function getSpreadsheetInfo (setQuestionsData) {
  fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetID}/values/Sheet1?key=${apiKey}`,{
    method: "GET",
    headers: 
    {
      "Content-Type": "application/json"
      // Authorization: `Bearer ${accessToken}`,
    }
  }
  ).then((response) => response.json())
    .then((sheetsinfo) => 
    {
      // returns questions an object of arrays
      setQuestionsData(sheetsinfo)
      return sheetsinfo
    })
    .catch((err) => {
      console.log(err.message);
    });
}

const endpoint = getEndpointUrl();
const bulkInsertData =
  "insert into patient (name, dateofbirth) values ('Sara Brown', '1901-01-01'), ('John Smith', '1941-01-01'), ('Jack Ma', '1961-01-30'), ('Elon Musk', '1999-01-01');";
const errorMessageBulkElement = document.getElementById("errorMessageBulk");
const errorMessageSQLElement = document.getElementById("errorMessageSQL");
const bulkDataElement = document.getElementById("bulkData");
const sqlQueryElement = document.getElementById("sqlQuery");

window.onload = () => {
  errorMessageBulkElement.innerHTML = "";
  errorMessageSQLElement.innerHTML = "";
  bulkDataElement.value = bulkInsertData;
};

// Get the endpoint URL
function getEndpointUrl() {
  const baseUrl = window.location.origin;
  const endpointURL =
    baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1")
      ? localEndpoint
      : productionEndpoint;
  return endpointURL;
}

// Handle GET requests
function handleGetRequest(query) {
  const encodedQuery = encodeURIComponent(query); // Fix encoding

  const xhr = new XMLHttpRequest();
  xhr.open("GET", `${endpoint}${encodedQuery}`, true);
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4) {
      const res = JSON.parse(xhr.responseText);
      if (xhr.status == 200) {
         const formattedData = res.data.map(patient => ({
          ...patient,
          dateOfBirth: patient.dateOfBirth.split("T")[0]  // ✅ Remove time from date
        }));
        
        errorMessageSQLElement.innerHTML = JSON.stringify(formattedData, null, 2);
        
        // errorMessageSQLElement.innerHTML = JSON.stringify(res.data);
      } else {
        errorMessageSQLElement.innerHTML = res.message;
      }
    }
  };
  xhr.send();
}


// handle POST requests
function handlePostRequest(data) {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", endpoint, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4) {
      const res = JSON.parse(xhr.responseText);
      errorMessageSQLElement.innerHTML = res.message;
    }
  };
  xhr.send(data);
}

// Handle bulk INSERT
function handleBulkSubmit(e) {
  e.preventDefault();
  handlePostRequest(bulkInsertData);
}

// Handle custom SQL queries either SELECT or INSERT
function handleSQLSubmit(e) {
  e.preventDefault();
  const sqlQuery = sqlQueryElement.value.toLowerCase().trim();
  console.log("✅ Encoded Query (Sent to Backend):", sqlQuery); // Log encoded query

  if (sqlQuery.startsWith("select")) {
    handleGetRequest(sqlQuery);
  } else if (sqlQuery.startsWith("insert into")) {
    // used ChatGPT to replace the new line characters with a space
    const formattedQuery = sqlQuery.replace(/\n/g, " ");
    handlePostRequest(formattedQuery);
  } else if (
    sqlQuery.startsWith("update") ||
    sqlQuery.startsWith("delete") ||
    sqlQuery.startsWith("create") ||
    sqlQuery.startsWith("drop") ||
    sqlQuery.startsWith("alter")
  ) {
    errorMessageSQLElement.innerHTML = forbiddenSqlQuery;
  } else {
    errorMessageSQLElement.innerHTML = invalidSqlQuery;
  }
}

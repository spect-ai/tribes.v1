function getStatusCode(status) {
  const reverseStatusMapping = {
    Open: 100,
    "In progress": 105,
    "In review": 200,
    Closed: 205,
    Paid: 300,
  };
  return reverseStatusMapping[status];
}

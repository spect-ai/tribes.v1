function getStatusCode(status) {
  const reverseStatusMapping = {
    Open: 100,
    Assigned: 102,
    "In Progress": 105,
    Submitted: 110,
    "In Review": 200,
    Closed: 205,
    Paid: 300,
  };
  return reverseStatusMapping[status];
}

function areEqualArrays(array1, array2) {
  if (array1.length === array2.length) {
    return array1.every((element) => {
      if (array2.includes(element)) {
        return true;
      }

      return false;
    });
  }

  return false;
}

async function isValidToken(tokenAddress, chainId) {
  var addressQuery = new Moralis.Query("Addresses");
  addressQuery.equalTo("address", tokenAddress);
  addressQuery.equalTo("chainId", chainId);
  addressQuery.equalTo("type", "erc20");
  const token = await addressQuery.first();
  return token ? true : false;
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function mapParseObjectToObject(parseObj) {
  return JSON.parse(JSON.stringify(parseObj));
}

function arrayHasSameElements(array1, array2) {
  logger.info(`array1: ${JSON.stringify(array1)}`);
  logger.info(`array2: ${JSON.stringify(array2)}`);
  if (array1?.length !== array2?.length) return false;
  for (const element of array1) {
    if (!array2.includes(element)) return false;
  }
  return true;
}

function objectHasSameElements(obj1, obj2) {
  logger.info(`obj1: ${JSON.stringify(obj1)}`);
  logger.info(`obj2: ${JSON.stringify(obj2)}`);
  if (Object.keys(obj1).length !== Object.keys(obj2).length) return false;
  for (const key of Object.keys(obj1)) {
    if (obj1[key] !== obj2[key]) return false;
  }
  return true;
}

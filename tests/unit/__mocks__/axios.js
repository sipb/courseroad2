import users from './../data/users';

function find(documents, values) {
  return documents.filter(function(document) {
    for(attribute in values) {
      if(document[attribute] !== values[attribute]) {
        return false;
      }
    }
    return true;
  });
}

function findOne(documents, values) {
  for(var d = 0; d < documents.length; d++) {
    var matches = true;
    for(attribute in values) {
      if(documents[d][attribute] !== values[attribute]) {
        matches = false;
      }
    }
    if(matches) {
      return documents[d];
    }
  }
  return undefined;
}

module.exports = {
  get: jest.fn(function(url, headers) {
    const urlParts = url.split("/");
    const query = urlParts.slice(3).join("/");
    return new Promise(function(resolve, reject) {
      if(query == "verify/") {
        if(headers.Authorization === undefined) {
          reject('Forbidden 403');
        }
        const token = headers.Authorization.split(':')[1];
        const user = findOne(users, { access_token: token });
        if(user !== undefined) {
          resolve({
            data: {
              current_semester: user.current_semester,
              success: true
            }
          });
        } else {
          resolve({
            data: {
              success: false
            }
          });
        }
      } else {
        reject('Unknown function');
      }
    });
  }),
  post: jest.fn(function(url, params, headers) {
    console.log("Trying to post " + url + " with " + JSON.stringify(params));
  })
}

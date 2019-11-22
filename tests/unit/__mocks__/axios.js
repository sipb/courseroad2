import moment from 'moment';
const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS000Z';

import users from './../data/users';
import roads from './../data/roads';

console.log(roads);

function find(documents, values) {
  return documents.filter(function(document) {
    for(var attribute in values) {
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
    for(var attribute in values) {
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

function objectSlice(obj, attributes) {
  var newObj = {};
  for(var a = 0; a < attributes.length; a++) {
    var attr = attributes[a];
    newObj[attr] = obj[attr];
  }
  return newObj;
}

function getUserFromHeaders(headers) {
  if(headers === undefined || headers.Authorization === undefined) {
    return 'Authorization Error';
  }
  const token = headers.Authorization.split('Bearer ')[1];
  const user = findOne(users, { access_token: token });
  return user;
}

function getUserFromHeadersPromise(headers, resolve, reject) {
  const user = getUserFromHeaders(headers);
  if(user === 'Authorization Error') {
    reject('Forbidden 403');
  } else if (user === undefined) {
    resolve({
      data: {
        success: false
      },
      status: 200
    });
  } else {
    return user;
  }
}

module.exports = {
  get: jest.fn(function(url, headers) {
    console.log(url);
    const urlParts = url.split('/');
    const queryParts = urlParts.slice(3);
    const query = queryParts.slice(0, queryParts.length-1).join('/');
    var parameterString = queryParts[queryParts.length-1];
    var parameters = {};
    if (parameterString.length != 0) {
      if (parameterString[0] != '?') {
        return Promise.reject("Bad parameters in url");
      }
      parameterString = parameterString.substring(1);
      var parameterDefinitions = parameterString.split("&");
      for (var p = 0; p < parameterDefinitions.length; p++) {
        var equality = parameterDefinitions[p].split("=");
        if (equality.length != 2) {
          return Promise.reject("Bad parameters in url");
        }
        parameters[equality[0]] = equality[1];
      }
    }
    return new Promise(function(resolve, reject) {
      if(query == 'verify') {
        const user = getUserFromHeadersPromise(headers.headers, resolve, reject);
        if (user == undefined) {
          return;
        }
        resolve({
          data: {
            current_semester: user.current_semester,
            success: true
          },
          status: 200
        });
      } else if(query == 'sync/roads') {
        const user = getUserFromHeadersPromise(headers.headers, resolve, reject);
        if (user == undefined) { return; }
        const userRoads = roads[user.username];
        if (parameters.id === undefined) {
          var roadData = {};
          for(var roadID in userRoads) {
            roadData[roadID] = objectSlice(userRoads[roadID], ['changed', 'name', 'agent']);
          }
          resolve({
            data: {
              files: roadData,
              success: true
            },
            status: 200
          });
        } else {
          var roadRequested = userRoads[parameters.id];
          console.log(roadRequested);
          resolve({
            data: {
              file: roadRequested,
              success: true
            },
            status: 200
          })
        }

      }
      else {
        reject('Unknown function');
      }
    });
  }),
  post: jest.fn(function(url, params, headers) {
    const urlParts = url.split('/');
    const query = urlParts.slice(3).join('/');
    const user = getUserFromHeaders(headers.headers);
    if(user === 'Authorization Error') {
      return Promise.reject('Forbidden 403');
    } else if(user === undefined) {
      return Promise.resolve({ data: { success: false }});
    }
    return new Promise(function(resolve, reject) {
      if(query === 'sync/sync_road/') {
        const username = user.username;
        const roadID = params.id;
        delete params.id;
        delete params.override;
        Object.assign(roads[username][roadID], params);
        resolve({
          status: 200,
          data: {
            success: true,
            result: 'update_remote',
            changed: moment().format(DATE_FORMAT)
          }
        })
      } else {
        reject("Unknown function");
      }
    });
  })
}

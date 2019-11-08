import moment from 'moment';
const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS000Z';

import users from './../data/users';
import roads from './../data/roads';


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
  console.log(user);
  if(user === 'Authorization Error') {
    console.log("Rejecting authorization error");
    reject('Forbidden 403');
  } else if (user === undefined) {
    console.log('User was undefined');
    resolve({
      data: {
        success: false
      }
    });
  } else {
    return user;
  }
}

module.exports = {
  get: jest.fn(function(url, headers) {
    console.log(url);
    const urlParts = url.split('/');
    const query = urlParts.slice(3).join('/');
    return new Promise(function(resolve, reject) {
      if(query == 'verify/') {
        const user = getUserFromHeadersPromise(headers.headers, resolve, reject);
        console.log(user);
        resolve({
          data: {
            current_semester: user.current_semester,
            success: true
          }
        });
        console.log("I just resolved");
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
      }
    });
  })
}

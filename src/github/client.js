var https = require('https');
var Repository = require('./model/repository.js');

function GithubClient(url, privateToken) {
  this.url = url
  this.privateToken = privateToken

  this.createRepo = function(repoName, isPrivate) {
    console.log('----------------github client createRepo called ----------------')
    var path = '/user/repos/';
    var options = this._getRequestOptions('POST', path);

    return new Promise(function(resolve, reject) {
      var req = https.request(options, function(res) {
        let data = '';
        res.setEncoding('utf8');
        console.log(`create repo ${repoName} returned STATUS: ${res.statusCode}`);
        res.on('data', function (chunk) {
          data += chunk;
        });

        res.on('end', () => {
          if(res.statusCode === 201) {
            resolve(new Repository(JSON.parse(data).name, JSON.parse(data).clone_url));
          } else {
            reject({
             'message': `Unable to create repo with name ${repoName}`
            })
          }
        });
      });

      req.on('error', error => {
        reject({
         'message': 'Error while creating repo'
        })
      })
      req.write(JSON.stringify(
        {
          "name": repoName,
          "private": isPrivate
        }
      ));
      req.end()
    });
  }

  this._getRequestOptions = function (method, path) {
    return {
      host: this.url,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'token' + this.privateToken
      }
    };
  }
}

module.exports = GithubClient;
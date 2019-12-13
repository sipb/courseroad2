#!/usr/bin/python3
from cgi import FieldStorage
from configparser import ConfigParser
from json import dumps, loads
from os import path
from requests import get

args = FieldStorage()

error = 'Status: 400 Bad Request\n'
content = 'Content-Type: application/json\n\n'

if 'kerb' not in args:
    output = {"error": "kerb was not specified"}
    print(error + content)
    print(dumps(output))
else:
    c = ConfigParser()
    try:
        with open(path.join(path.dirname(path.realpath(__file__)), 'credentials.ini')) as fp:
            c.read_file(fp)
        response = get('https://mit-people-v3.cloudhub.io/people/v3/people/{0}'.format(args['kerb'].value), headers={'client_id': c['Credentials']['ID'], 'client_secret': c['Credentials']['Secret']})
        if response.status_code != 200:
            output = {"error": "could not get user data"}
            print(error + content)
            print(dumps(output))
        else:
            data = loads(response.text)
            if data['item']['affiliations'][0]['type'] != "student":
                output = {"error": "user is not a student"}
                print(error + content)
                print(dumps(output))
            else:
                year = data['item']['affiliations'][0]['classYear']
                if year == "G":
                    output = {"error": "user is a graduate student (currently unhandled)"}
                    print(error + content)
                    print(dumps(output))
                else:
                    year = int(year)
                    year = year - 1
                    output = {"year": year}
                    print(content)
                    print(dumps(output))
    except Exception:
        output = {"error": "could not read credentials"}
        print(error + content)
        print(dumps(output))

#syntax: ./deploy.sh [dev or prod] [kerberos]
npm run build-$1
scp -r -o GSSAPIAuthentication=yes -o GSSAPIDelegateCredentials=yes dist $2@athena.dialup.mit.edu:
if [ "$1" = "prod" ]; then
  echo -n "You are about to deploy to the production site, are you sure? (y/n)? "
  read answer
  if [ "$answer" != "${answer#[Yy]}" ] ;then
    ssh $2@athena.dialup.mit.edu -K 'aklog athena sipb && cp -r dist/* /mit/courseroad/web_scripts/courseroad/ && rm -r dist'
  else
    echo cancelled
  fi
elif [ "$1" = "dev" ]; then
  ssh $2@athena.dialup.mit.edu -K 'aklog athena sipb && cp -r dist/* /mit/courseroad/web_scripts/courseroad/dev/ && rm -r dist'
else
  echo "Invalid build location"
fi

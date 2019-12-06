#To run this script you must have 'aklog' written in ~/.bash_environment (or the environment file for whatever
#shell you use) and 'sipb' and 'athena' written in ~/.xlog (both of these files should be in your athena locker).
#Otherwise, you will not have permission to access the courseroad locker, even if you are on courseroad-dev.
#If you have not done the above, use deploy.sh instead.
#syntax: ./one_step_deploy.sh [dev or prod] [kerberos]
npm run build-$1
if [ "$1" = "prod" ]; then
  echo -n "You are about to deploy to the production site, are you sure? (y/n)? "
  read answer
  if [ "$answer" != "${answer#[Yy]}" ] ;then
    scp -r dist/* $2@athena.dialup.mit.edu:/mit/courseroad/web_scripts/courseroad/
  else
    echo cancelled
  fi
elif [ "$1" = "dev" ]; then
    scp -r dist/* $2@athena.dialup.mit.edu:/mit/courseroad/web_scripts/courseroad/dev/
else
  echo "Invalid build location"
fi
npm run build-$1
scp -r dist $2@athena.dialup.mit.edu: $3
if ["$1" -eq "dev"]; then
  ssh $2@athena.dialup.mit.edu $3 'aklog athena sipb && mv dist/* /mit/courseroad/web_scripts/courseroad/dev/'
else
  ssh $2@athena.dialup.mit.edu $3 'aklog athena sipb && mv dist/* /mit/courseroad/web_scripts/courseroad/'
fi

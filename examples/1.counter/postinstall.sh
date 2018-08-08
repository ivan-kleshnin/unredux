mkdir -p node_modules
mkdir -p node_modules/.bin
rm -rf node_modules/.bin/webpack
ln -s ../../../../node_modules/.bin/webpack node_modules/.bin/webpack
rm -rf node_modules/vendors
ln -s ../../../vendors node_modules/vendors


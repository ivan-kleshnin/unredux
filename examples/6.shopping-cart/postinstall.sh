mkdir -p node_modules
mkdir -p node_modules/.bin
rm -rf node_modules/.bin/webpack
ln -s ../../../../node_modules/.bin/webpack node_modules/.bin/webpack
rm -rf node_modules/framework
ln -s ../../../vendors/framework node_modules/framework
rm -rf node_modules/shims
ln -s ../../../vendors/shims node_modules/shims

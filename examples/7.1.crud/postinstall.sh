mkdir -p node_modules
mkdir -p node_modules/.bin
rm -rf node_modules/.bin/webpack
ln -s ../../../../node_modules/.bin/webpack node_modules/.bin/webpack
rm -rf node_modules/framework
ln -s ../../../vendors/framework node_modules/framework
rm -rf node_modules/shims
ln -s ../../../vendors/shims node_modules/shims
rm -rf node_modules/client
ln -s ../client node_modules/client
rm -rf node_modules/common
ln -s ../common node_modules/common
rm -rf node_modules/server
ln -s ../server node_modules/server

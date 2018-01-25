mkdir node_modules
mkdir node_modules/.bin
ln -sFfn ../../../../node_modules/.bin/webpack ./node_modules/.bin/webpack
ln -sFfn ../../../vendors/framework ./node_modules/framework
ln -sFfn ../../../vendors/shims ./node_modules/shims
ln -sFfn ../client ./node_modules/client
ln -sFfn ../common ./node_modules/common
ln -sFfn ../server ./node_modules/server

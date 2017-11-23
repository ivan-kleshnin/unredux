mkdir node_modules
mkdir node_modules/.bin
ln -sFfn ../../../../node_modules/.bin/webpack ./node_modules/.bin/webpack
ln -sFfn ../../../vendors/framework ./node_modules/framework
ln -sFfn ../../../vendors/selfdb ./node_modules/selfdb
ln -sFfn ../../../vendors/ramda ./node_modules/ramda
ln -sFfn ../../../vendors/rxjs ./node_modules/rxjs
ln -sFfn ../client ./node_modules/client
ln -sFfn ../common ./node_modules/common
ln -sFfn ../server ./node_modules/server

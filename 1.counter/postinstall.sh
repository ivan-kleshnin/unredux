mkdir node_modules
mkdir node_modules/.bin
ln -sFfn ../../../node_modules/.bin/webpack ./node_modules/.bin/webpack
ln -sFfn ../../vendors/ramda ./node_modules/ramda
ln -sFfn ../../vendors/rxjs ./node_modules/rxjs
ln -sFfn ../../vendors/unredux ./node_modules/unredux

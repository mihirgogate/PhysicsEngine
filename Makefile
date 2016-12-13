.PHONY: default

default:
	watch -n 0.1 'make build'

build:
	browserify main.js -o build.js

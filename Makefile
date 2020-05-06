DOCKER=/usr/local/bin/docker
<<<<<<< HEAD
IMG=splinter
SKEL=/Users/mhoskins/src/dotfiles
=======
IMAGE=splinter
>>>>>>> b5d4d52... get port and config from envrc

build:
	$(DOCKER) build . -t $(IMAGE):latest

run:
	$(DOCKER) run --rm -v $(PWD):/app -p ${PORT}:${PORT} \
		-e IP="0.0.0.0" \
<<<<<<< HEAD
		-e CONF="${CONF}" $(IMG)

prettier:
	npm install -D eslint prettier
	npx install-peerdeps --dev eslint-config-airbnb
	npm install -D eslint-config-prettier eslint-plugin-prettier
	cp $(SKEL)/.prettier* .
	cp $(SKEL)/.eslint* .
	cp $(SKEL)/.cfignore .
=======
		-e CONFIG="${CONFIG}" $(IMAGE)
>>>>>>> b5d4d52... get port and config from envrc

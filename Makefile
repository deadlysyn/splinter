DOCKER=/usr/local/bin/docker
IMG=splinter
SKEL=/Users/mhoskins/src/dotfiles

build:
	$(DOCKER) build . -t $(IMAGE):latest

run:
	$(DOCKER) run --rm -v $(PWD):/app -p ${PORT}:${PORT} \
		-e IP="0.0.0.0" \
		-e CONF="${CONF}" $(IMG)

prettier:
	npm install -D eslint prettier
	npx install-peerdeps --dev eslint-config-airbnb
	npm install -D eslint-config-prettier eslint-plugin-prettier
	cp $(SKEL)/.prettier* .
	cp $(SKEL)/.eslint* .
	cp $(SKEL)/.cfignore .

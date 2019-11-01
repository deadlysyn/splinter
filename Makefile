DOCKER=/usr/local/bin/docker
IMAGE=splinter

build:
	$(DOCKER) build . -t $(IMAGE):latest

run:
	$(DOCKER) run --rm -v $(PWD):/app -p ${PORT}:${PORT} \
		-e IP="0.0.0.0" \
		-e CONFIG="${CONFIG}" $(IMAGE)

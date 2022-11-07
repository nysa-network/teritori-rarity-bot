
TAG=latest

docker-deploy: docker-build docker-push

docker-build:
	docker build -t nysanetwork/teritori-rarity-bot:$(TAG) .

docker-push:
	docker push nysanetwork/teritori-rarity-bot:$(TAG)

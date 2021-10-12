
build:
	sam build --parallel \
		--cached \
		--region us-east-2


deploy:
	sam deploy \
		--stack-name logs-processor \
		--s3-bucket 158097016125.us-east-2.sam.code \
		--s3-prefix logs-processor \
		--capabilities CAPABILITY_NAMED_IAM \
		--no-fail-on-empty-changeset \
		--no-progressbar

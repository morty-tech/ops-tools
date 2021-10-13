
build:
	sam build \
		--parallel \
		--cached \
		--region us-east-2


deploy:
	sam deploy \
		--stack-name ops-tools \
		--s3-bucket 158097016125.us-east-2.sam.code \
		--s3-prefix ops-tools \
		--capabilities CAPABILITY_NAMED_IAM \
		--no-fail-on-empty-changeset \
		--no-progressbar

deploy-build:
	sam deploy \
		--stack-name ops-tools-build \
		--capabilities CAPABILITY_NAMED_IAM \
		--no-fail-on-empty-changeset \
		--no-progressbar \
		--template-file infra/codebuild.cfn.yaml

# forms_runtime deployment

This app serves hosted and embedded forms for `*.forms.semblia.com` without adding always-on load to the DigitalOcean droplet.

## Local dev

```powershell
pnpm --filter forms_runtime dev
```

Open `http://localhost:3007/f/customer-feedback?projectId=project_mock`. Local dev starts in mock mode, so the page renders without `api_v2` runtime endpoints.

## AWS resources

- CloudFront distribution for `*.forms.semblia.com`
- Lambda Function URL origin with Origin Access Control
- Lambda Node.js 22.x, ARM64, 256 MB, 10 second timeout
- CloudWatch logs with 7 day retention
- Reserved Lambda concurrency cap of 20
- Optional ACM wildcard certificate ARN for `*.forms.semblia.com`

Before the first 10 paying customers, do not add API Gateway, WAF, provisioned concurrency, or a separate AWS database unless traffic or abuse data proves the need.

## CDK commands

Mock-mode synth:

```powershell
cd apps/forms_runtime
pnpm build
pnpm cdk synth
```

Production-mode synth:

```powershell
cd apps/forms_runtime
pnpm build
pnpm cdk synth `
  -c formsRuntimeMode=api `
  -c formsRuntimeBaseDomain=forms.semblia.com `
  -c formsRuntimeApiBaseUrl=https://api.semblia.com/v2 `
  -c formsRuntimeSigningSecret=<32-plus-character-secret> `
  -c formsRuntimeProjectId=<temporary-default-project-id> `
  -c formsRuntimeCertificateArn=<us-east-1-acm-certificate-arn>
```

Deploy uses the same context arguments with `cdk deploy`.

## DNS

After deploy, create a wildcard DNS record:

```text
*.forms.semblia.com CNAME <CloudFront distribution domain>
```

The domain can remain registered at Name.com; only the authoritative DNS zone needs the wildcard CNAME and certificate validation records.

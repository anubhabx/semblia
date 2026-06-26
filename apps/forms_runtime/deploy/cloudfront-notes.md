# CloudFront policy

CloudFront terminates TLS for `*.forms.semblia.com` and forwards requests to the Lambda Function URL origin.

## Original host

The Lambda Function URL must keep its own origin `Host` header for Origin Access Control. A CloudFront Function copies the viewer hostname into:

```text
x-semblia-original-host
```

`forms_runtime` resolves the viewer host from that header first, then falls back to `Host` for local development and direct tests. Until api_v2 exposes host-based runtime resolution, the runtime also accepts a forwarded `projectId` query parameter, a default `FORMS_RUNTIME_PROJECT_ID`, or a `FORMS_RUNTIME_PROJECT_ID_BY_HOST` JSON map.

## GET and HEAD

- Cache only `GET` and `HEAD`.
- Use origin response caching: `public, s-maxage=60, stale-while-revalidate=300`.
- Include `x-semblia-original-host` in the cache key.
- Forward the `projectId` bridge query and `?submitted=1`; keep them in the cache key with the original host.
- Do not forward cookies for the hosted forms runtime.

## POST submissions

- Allow all methods on the default behavior so form submissions can reach Lambda.
- Do not cache `POST`.
- Forward request body, `projectId`, `content-type`, `origin`, `x-semblia-original-host`, `x-semblia-original-user-agent`, `x-semblia-original-forwarded-for`, `x-semblia-signature`, `x-semblia-timestamp`, and `idempotency-key`.
- Keep canonical validation, idempotency, submission writes, analytics, and notification fanout in `api_v2`.

## Future static assets

If the hosted renderer gets dedicated static assets, serve content-hashed filenames with long immutable cache headers. Keep uncached or short-cache HTML separate from long-cache assets.

# Coolify + Cloudflare Multi-Domain Setup (Root + 2-Letter Subdomains)

This guide sets up:
- `copymyui.com` (root domain) on your app
- all 2-letter locale subdomains (for example `ru.copymyui.com`, `zh.copymyui.com`, `de.copymyui.com`)
- wildcard TLS from Cloudflare Origin CA
- routing in Coolify without breaking unrelated subdomains

## 1) Prerequisites

- Domain is on Cloudflare DNS.
- App is running in Coolify (Traefik proxy).
- You can SSH to your server as a user with `sudo`.

---

## 2) Cloudflare DNS

In Cloudflare dashboard:
1. Open `Websites` -> your zone -> `DNS` -> `Records`.
2. Ensure these records exist and are **Proxied**:
   - `A` -> `@` -> `<YOUR_SERVER_IP>`
   - `A` -> `*` -> `<YOUR_SERVER_IP>`
3. Remove conflicting records for the same hostnames if they point elsewhere.

---

## 3) Cloudflare Origin Certificate (Wildcard)

In Cloudflare:
1. Open `SSL/TLS` -> `Origin Server` -> `Create Certificate`.
2. Choose Cloudflare-generated key.
3. Add hostnames:
   - `copymyui.com`
   - `*.copymyui.com`
4. Create certificate.
5. Save both outputs safely:
   - certificate PEM
   - private key PEM

---

## 4) Install Certificate on Coolify Proxy Host

SSH to server and run:

```bash
sudo mkdir -p /data/coolify/proxy/certs
sudo mkdir -p /data/coolify/proxy/dynamic
```

Create files:

```bash
sudo nano /data/coolify/proxy/certs/copymyui-origin.crt
sudo nano /data/coolify/proxy/certs/copymyui-origin.key
```

Paste the Cloudflare cert/key into those files.

Set permissions:

```bash
sudo chmod 644 /data/coolify/proxy/certs/copymyui-origin.crt
sudo chmod 600 /data/coolify/proxy/certs/copymyui-origin.key
```

Validate SAN:

```bash
sudo openssl x509 -in /data/coolify/proxy/certs/copymyui-origin.crt -noout -subject -issuer -ext subjectAltName
```

Expected SAN includes:
- `DNS:copymyui.com`
- `DNS:*.copymyui.com`

---

## 5) Tell Traefik to Use This Certificate

Create dynamic TLS config:

```bash
sudo nano /data/coolify/proxy/dynamic/01-custom-origin-cert.yml
```

Paste:

```yaml
tls:
  certificates:
    - certFile: /traefik/certs/copymyui-origin.crt
      keyFile: /traefik/certs/copymyui-origin.key
```

---

## 6) Coolify App Domain Configuration

In Coolify app `Configuration`:
1. In `Domains`, keep only explicit app domains (for example `https://copymyui.com`).
2. Do **not** add `https://*.copymyui.com` in app Domains.

Why: Coolify will generate `Host(\`*.domain\`)` / `HostSNI(\`*.domain\`)` rules, and Traefik rejects them.

---

## 7) Route Only 2-Letter Subdomains to the App

Create dynamic routing file:

```bash
sudo nano /data/coolify/proxy/dynamic/02-copymyui-subdomains.yml
```

Paste:

```yaml
http:
  middlewares:
    cmui-redirect-https:
      redirectScheme:
        scheme: https
    cmui-gzip:
      compress: {}

  routers:
    cmui-subdomains-http:
      rule: "HostRegexp(`^[a-z]{2}\\.copymyui\\.com$`) && PathPrefix(`/`)"
      entryPoints:
        - http
      middlewares:
        - cmui-redirect-https
      service: noop@internal

    cmui-subdomains-https:
      rule: "HostRegexp(`^[a-z]{2}\\.copymyui\\.com$`) && PathPrefix(`/`)"
      entryPoints:
        - https
      middlewares:
        - cmui-gzip
      service: https-0-hsnfh916myw3p9dk57voqan9@docker
      tls: {}
```

Important:
- Replace `https-0-hsnfh916myw3p9dk57voqan9@docker` with your actual app HTTPS service name if different.
- This pattern matches only 2-letter subdomains, so unrelated subdomains are not hijacked.

How to discover your service name:

```bash
sudo docker ps --format '{{.Names}}' | while read -r c; do
  out="$(sudo docker inspect "$c" --format '{{range $k,$v := .Config.Labels}}{{println $k "=" $v}}{{end}}' | grep 'traefik.http.routers.https-0.*.service' || true)"
  [ -n "$out" ] && echo "=== $c ===" && echo "$out"
done
```

Use the value on the right side of `...service = ...` and append `@docker`.

---

## 8) Reload Proxy + Redeploy App

```bash
sudo docker restart coolify-proxy
```

In Coolify UI:
1. Save app config.
2. Redeploy the app.

In Cloudflare:
1. `SSL/TLS` -> `Overview` -> set mode to `Full (strict)`.

---

## 9) Verification

```bash
curl -I https://copymyui.com
curl -I https://ru.copymyui.com
curl -I https://zh.copymyui.com
```

Certificate check by SNI:

```bash
echo | openssl s_client -connect <YOUR_SERVER_IP>:443 -servername zh.copymyui.com 2>/dev/null | openssl x509 -noout -subject -issuer -ext subjectAltName
```

---

## 10) Troubleshooting Quick Map

- `526 Invalid SSL certificate`:
  - origin certificate for subdomain not loaded by Traefik
  - wrong cert/key path
  - cert parsing error in proxy logs

- `no available server`:
  - router points to missing/wrong service
  - app container is down
  - wrong load balancer port

- `HostSNI(\`*.domain\`) is not a valid hostname`:
  - wildcard was added in Coolify app Domains and generated invalid labels
  - remove wildcard from app Domains and use `HostRegexp` dynamic route instead

Useful log command:

```bash
sudo docker logs coolify-proxy --since 10m | grep -Ei 'HostSNI|acme|could not determine solvers|failed to find any PEM|error'
```


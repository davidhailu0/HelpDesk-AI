# Getting Started Guide

## Section 1: Creating an Account

Visit our [signup page](https://example.com/signup) to create a free account using your email or GitHub login.  
Once registered, verify your email to activate all features.

## Section 2: Generating an API Key

After logging in, navigate to the **Developer Dashboard → API Keys**.  
Click **“Generate New Key”** to create an API key.  
Keep this key secure and do not share it publicly.

## Section 3: Making Your First Request

Use the API key to authenticate your first request:

```bash
curl -X POST https://api.example.com/v1/query \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"query": "Hello world"}'
```

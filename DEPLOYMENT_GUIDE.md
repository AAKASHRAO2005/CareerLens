# CareerLens — Deployment Guide

This guide details how to deploy the CareerLens Placement Intelligence Platform to live production environments.

---

## 1. Frontend Deployment Options (Next.js 15)

The Next.js frontend can be deployed in under 2 minutes to either **Vercel** or **AWS Amplify Hosting**.

### Option A: Vercel (Recommended for Next.js)
1. Go to [https://vercel.com/new](https://vercel.com/new) and log in with your GitHub account.
2. Under **Import Git Repository**, select **`AAKASHRAO2005/CareerLens`**.
3. In the project configuration:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select **`frontend`**
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. *(Optional)* Add Environment Variables if your backend is deployed:
   - `NEXT_PUBLIC_API_BASE_URL`: Your API Gateway HTTP URL (e.g., `https://xyz.execute-api.us-east-1.amazonaws.com`)
   - `NEXT_PUBLIC_APP_ENV`: `production`
5. Click **Deploy**. Vercel will build and assign an instant public HTTPS URL (e.g., `https://careerlens.vercel.app`).

---

### Option B: AWS Amplify Hosting (Native AWS)
CareerLens includes a root [`amplify.yml`](../amplify.yml) build specification.
1. Sign in to the [AWS Management Console](https://console.aws.amazon.com/amplify).
2. Choose **Host web app** and connect your GitHub repository **`AAKASHRAO2005/CareerLens`** (Branch: `main`).
3. Amplify automatically detects `amplify.yml` and the `frontend/` directory.
4. Click **Save and deploy**. Amplify will provision, build, and host the app on CloudFront CDN.

---

## 2. Serverless Backend Deployment (AWS CloudFormation / SAM)

The backend is 100% serverless, defined in [`infrastructure/template.yaml`](../infrastructure/template.yaml):
- **Authentication**: Amazon Cognito User Pool & Web Client
- **Database**: Amazon DynamoDB Single-Table (`CareerLensData`, On-Demand, 3 GSIs)
- **Object Storage**: Amazon S3 Private Resume Vault (SSE-S3 encrypted)
- **API**: Amazon API Gateway HTTP API with Cognito JWT Authorizer
- **Compute**: 7 AWS Lambda Functions (Node.js 22.x)

### Deploying via GitHub Actions (Automated CI/CD)
The repository includes [`.github/workflows/ci-cd.yml`](../.github/workflows/ci-cd.yml).
To enable automated deployments on every `git push`:
1. Navigate to your GitHub repo: **Settings → Secrets and variables → Actions**.
2. Add the following repository secrets:
   - `AWS_ACCESS_KEY_ID`: Your IAM User Access Key
   - `AWS_SECRET_ACCESS_KEY`: Your IAM User Secret Key
   - `AWS_REGION`: `us-east-1` (or your preferred region)
3. Push to `main`. GitHub Actions will automatically run all 152 unit tests and deploy the AWS SAM stack.

### Deploying Manually via AWS SAM CLI
```bash
# 1. Install AWS SAM CLI if not installed:
# https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html

# 2. Build the serverless application
sam build --template-file infrastructure/template.yaml

# 3. Deploy to AWS
sam deploy --guided
```
SAM will prompt you for:
- Stack Name: `careerlens-stack`
- AWS Region: `us-east-1`
- Confirm changes before deploy: `Y`
- Allow SAM CLI IAM role creation: `Y`

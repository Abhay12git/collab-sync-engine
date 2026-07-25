# AWS App Runner & ECS Fargate Deployment Guide

This guide walks you through deploying **Collab Sync Engine** to **AWS App Runner / ECS (Fargate)** with containerized builds and managed MongoDB (Atlas or AWS DocumentDB).

---

## Architecture Overview

```
                      ┌─────────────────────────────────┐
                      │   AWS App Runner / ECS Frontend │
                      │   (Nginx Container on Port 80)  │
                      └────────────────┬────────────────┘
                                       │
                               HTTPS / WSS
                                       │
                      ┌────────────────▼────────────────┐
                      │   AWS App Runner / ECS Backend  │
                      │  (Node.js Container Port 5000)  │
                      └────────────────┬────────────────┘
                                       │
                                       │ MongoDB Protocol
                      ┌────────────────▼────────────────┐
                      │  MongoDB Atlas / AWS DocumentDB │
                      └─────────────────────────────────┘
```

---

## Step 1: Provision Managed Database (MongoDB Atlas or DocumentDB)

1. Sign up for [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free Tier available) or create an **AWS DocumentDB** cluster in your VPC.
2. Create a database named `collab-sync` and create a database user (e.g., `admin`).
3. Copy your connection string:
   ```
   mongodb+srv://admin:<password>@collab-cluster.mongodb.net/collab-sync?retryWrites=true&w=majority
   ```
4. Whitelist IP addresses: set `0.0.0.0/0` (Allow access from anywhere) so AWS App Runner / ECS tasks can connect.

---

## Step 2: Push Docker Images to AWS ECR (Elastic Container Registry)

### 2.1 Create ECR Repositories via AWS CLI
```bash
aws ecr create-repository --repository-name collab-sync-backend
aws ecr create-repository --repository-name collab-sync-frontend
```

### 2.2 Authenticate & Push Images
```bash
# Set your AWS Account ID & Region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="us-east-1"

# Authenticate Docker to AWS ECR
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Build & Tag Backend
docker build -f infrastructure/Dockerfile.backend -t collab-sync-backend:latest .
docker tag collab-sync-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/collab-sync-backend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/collab-sync-backend:latest

# Build & Tag Frontend
docker build -f infrastructure/Dockerfile.frontend -t collab-sync-frontend:latest .
docker tag collab-sync-frontend:latest $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/collab-sync-frontend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/collab-sync-frontend:latest
```

---

## Step 3: Deploy Backend to AWS App Runner

1. Go to the **AWS App Runner Console** and click **Create Service**.
2. **Source**: Select **Container Registry** -> **Amazon ECR**.
3. **Container Image**: Select `collab-sync-backend:latest`.
4. **Service Configuration**:
   - **Service Name**: `collab-sync-backend-service`
   - **Port**: `5000`
   - **CPU & Memory**: `1 vCPU / 2 GB RAM`
5. **Environment Variables**:
   - `PORT` = `5000`
   - `MONGO_URI` = `mongodb+srv://admin:<password>@collab-cluster.mongodb.net/collab-sync`
   - `JWT_SECRET` = `your_super_secret_jwt_key_here`
   - `NODE_ENV` = `production`
6. Click **Create & Deploy**.
7. Note down the backend public URL provided by AWS App Runner (e.g., `https://backend-xyz.us-east-1.awsapprunner.com`).

---

## Step 4: Deploy Frontend to AWS App Runner

1. Go to the **AWS App Runner Console** and click **Create Service**.
2. **Source**: Select **Container Registry** -> **Amazon ECR**.
3. **Container Image**: Select `collab-sync-frontend:latest`.
4. **Service Configuration**:
   - **Service Name**: `collab-sync-frontend-service`
   - **Port**: `80`
   - **CPU & Memory**: `1 vCPU / 2 GB RAM`
5. Click **Create & Deploy**.
6. Note down the frontend public URL (e.g., `https://editor-xyz.us-east-1.awsapprunner.com`).

---

## Step 5: Verify Deployment

1. Open the frontend App Runner URL in your browser: `https://editor-xyz.us-east-1.awsapprunner.com`.
2. Register a new user account.
3. Create a document, copy the URL, and share it with 2 or 3 team members to verify real-time collaboration on AWS!

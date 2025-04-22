# RadioX Production Infrastructure

## Architecture Overview

### Components
- **Frontend**: React SPA served via CDN
- **Backend API**: Node.js Express application
- **Processing Service**: Node.js service for audio processing
- **Database**: MongoDB with replica set
- **Cache**: Redis for session and data caching
- **Storage**: AWS S3 for media files
- **CDN**: CloudFront for static assets and media delivery
- **Load Balancer**: Application Load Balancer for API traffic

### Environment Diagram
```
                                  ┌─────────────┐
                                  │   CloudFront│
                                  │     CDN     │
                                  └──────┬──────┘
                                         │
                                         ▼
┌─────────────┐                  ┌─────────────┐
│    S3       │◄─────────────────┤   Frontend  │
│  Storage    │                  │  React SPA  │
└─────────────┘                  └──────┬──────┘
                                         │
                                         ▼
                                  ┌─────────────┐
                                  │    Load     │
                                  │  Balancer   │
                                  └──────┬──────┘
                                         │
                     ┌───────────────────┴───────────────────┐
                     │                                       │
               ┌─────▼─────┐                           ┌─────▼─────┐
               │  Backend  │                           │ Processing │
               │   API     │◄─────────────────────────►│  Service   │
               └─────┬─────┘                           └─────┬─────┘
                     │                                       │
        ┌────────────┴────────────┐               ┌─────────┴────────────┐
        │                         │               │                      │
  ┌─────▼─────┐            ┌──────▼────┐    ┌─────▼─────┐         ┌──────▼────┐
  │ MongoDB   │            │   Redis   │    │ MongoDB   │         │   Redis   │
  │ Primary   │◄──────────►│  Cache    │    │ Replica   │◄────────┤  Cache    │
  └───────────┘            └───────────┘    └───────────┘         └───────────┘
```

## Infrastructure Specifications

### Compute Resources

#### Frontend
- **Service**: AWS S3 + CloudFront
- **Region**: us-east-1 (primary), eu-west-1 (secondary)
- **Cache Policy**: 
  - HTML: 1 hour
  - JS/CSS: 1 week
  - Images: 1 month

#### Backend API
- **Service**: AWS ECS Fargate
- **Instance Type**: 2 vCPU, 4GB RAM
- **Min Instances**: 2
- **Max Instances**: 10
- **Auto-scaling**: CPU > 70% for 3 minutes
- **Regions**: us-east-1 (primary), eu-west-1 (DR)

#### Processing Service
- **Service**: AWS ECS Fargate
- **Instance Type**: 4 vCPU, 8GB RAM
- **Min Instances**: 2
- **Max Instances**: 8
- **Auto-scaling**: Queue depth > 10 for 2 minutes
- **Regions**: us-east-1 (primary), eu-west-1 (DR)

### Database

#### MongoDB
- **Service**: MongoDB Atlas
- **Tier**: M30 (dedicated)
- **Configuration**: 3-node replica set
- **Regions**: us-east-1 (primary), eu-west-1 (secondary)
- **Backup**: Daily automated backups, 30-day retention
- **Monitoring**: MongoDB Atlas monitoring + Prometheus

#### Redis
- **Service**: AWS ElastiCache
- **Instance Type**: cache.m5.large
- **Configuration**: 2-node with automatic failover
- **Regions**: us-east-1 (primary), eu-west-1 (DR)
- **Backup**: Daily snapshots, 7-day retention

### Storage

#### S3 Buckets
- **Media Bucket**: radiox-media-prod
  - **Lifecycle**: Transition to IA after 30 days
  - **Versioning**: Enabled
  - **Encryption**: AES-256
  - **CORS**: Configured for frontend domains

- **Backup Bucket**: radiox-backups-prod
  - **Lifecycle**: Transition to Glacier after 90 days
  - **Versioning**: Enabled
  - **Encryption**: AES-256

### Networking

#### VPC Configuration
- **CIDR Block**: 10.0.0.0/16
- **Subnets**:
  - Public: 10.0.1.0/24, 10.0.2.0/24
  - Private (App): 10.0.3.0/24, 10.0.4.0/24
  - Private (Data): 10.0.5.0/24, 10.0.6.0/24
- **Security Groups**:
  - ALB: HTTP/HTTPS from internet
  - App: HTTP from ALB only
  - Data: MongoDB/Redis from App only

#### DNS Configuration
- **Domain**: radiox.com
- **Subdomains**:
  - app.radiox.com -> CloudFront
  - api.radiox.com -> ALB
  - admin.radiox.com -> CloudFront (Admin SPA)
- **SSL**: AWS Certificate Manager, auto-renewal

### Monitoring & Logging

#### Monitoring
- **Service**: Prometheus + Grafana
- **Metrics Collection**: 15-second intervals
- **Retention**: 30 days
- **Dashboards**:
  - System Overview
  - API Performance
  - Database Performance
  - User Activity
  - Error Rates

#### Logging
- **Service**: ELK Stack
- **Log Shipping**: Filebeat
- **Retention**: 90 days
- **Log Levels**:
  - Production: INFO and above
  - Error tracking: Full stack traces

#### Alerting
- **Service**: AlertManager
- **Notification Channels**:
  - Email
  - Slack
  - PagerDuty
- **Alert Severity Levels**:
  - Critical: PagerDuty + Slack
  - Warning: Slack
  - Info: Email digest

### Security

#### Network Security
- **WAF**: AWS WAF with OWASP top 10 protection
- **DDoS Protection**: AWS Shield Standard
- **IP Restrictions**: Admin access restricted by IP

#### Data Security
- **Encryption in Transit**: TLS 1.2+
- **Encryption at Rest**: All data and backups
- **Key Management**: AWS KMS

#### Access Control
- **IAM**: Role-based with least privilege
- **Secrets**: AWS Secrets Manager
- **MFA**: Required for all admin accounts

## Deployment Strategy

### Blue-Green Deployment
1. Deploy new version to "green" environment
2. Run smoke tests on "green"
3. Switch traffic from "blue" to "green"
4. Monitor for issues
5. If successful, "blue" becomes staging for next release

### Rollback Procedure
1. Switch traffic back to "blue" environment
2. Run verification tests
3. Investigate issues in "green"

## Disaster Recovery

### RTO and RPO
- **Recovery Time Objective (RTO)**: 1 hour
- **Recovery Point Objective (RPO)**: 15 minutes

### Backup Strategy
- **Database**: 
  - Daily full backups
  - Point-in-time recovery with oplog
- **Media Files**: 
  - Versioned in S3
  - Cross-region replication

### DR Scenarios
1. **Single AZ Failure**:
   - Auto-failover to other AZs
   - No manual intervention required

2. **Region Failure**:
   - Promote secondary region
   - Update DNS to point to DR region
   - Estimated recovery time: 30-45 minutes

## Capacity Planning

### Current Requirements
- **Expected Users**: 10,000 DAU
- **API Requests**: 1M/day
- **Storage Growth**: 50GB/month
- **Database Size**: 100GB initial

### Scaling Plan
- **6-Month Projection**: 25,000 DAU
- **12-Month Projection**: 50,000 DAU
- **Scaling Triggers**:
  - CPU > 70% for 10 minutes
  - Memory > 80% for 10 minutes
  - Response time > 500ms for 5 minutes

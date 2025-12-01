# Jenkins CI/CD Setup - Zomato DevOps Pipeline

Complete guide for setting up Jenkins for automated CI/CD of the Zomato application.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Jenkins Installation](#jenkins-installation)
- [Jenkins Configuration](#jenkins-configuration)
- [Pipeline Setup](#pipeline-setup)
- [Credentials Configuration](#credentials-configuration)
- [Running the Pipeline](#running-the-pipeline)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before setting up Jenkins, ensure you have:

✅ **Jenkins Server** (can be local, EC2, or cloud-hosted)
- Minimum 2GB RAM, 2 vCPUs
- Java 11 or 17 installed
- Docker installed (for building images)

✅ **GitHub Repository**
- Repository: `harsh-raj04/Zomato-devops-pipeline`
- GitHub Personal Access Token (for webhooks)

✅ **AWS EC2 Instance** (already created via Terraform)
- Public IP: `3.108.112.197`
- SSH key: `~/.ssh/zomato-deploy-key.pem`

✅ **Required Tools on Jenkins Server**
- Git
- Docker
- Ansible
- Node.js & npm (for building frontend/backend)

---

## Jenkins Installation

### Option 1: Install on Ubuntu/Debian

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Java (required for Jenkins)
sudo apt install openjdk-17-jdk -y
java -version

# Add Jenkins repository
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Install Jenkins
sudo apt update
sudo apt install jenkins -y

# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Check status
sudo systemctl status jenkins

# Get initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### Option 2: Run Jenkins with Docker

```bash
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts

# Get initial admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### Option 3: Install on macOS

```bash
brew install jenkins-lts
brew services start jenkins-lts

# Get password
cat /usr/local/var/jenkins/secrets/initialAdminPassword
```

---

## Initial Jenkins Configuration

1. **Access Jenkins**
   - Open browser: `http://localhost:8080` (or your Jenkins server IP)
   - Enter the initial admin password

2. **Install Suggested Plugins**
   - Choose "Install suggested plugins"
   - Wait for installation to complete

3. **Create Admin User**
   - Username: `admin` (or your choice)
   - Password: (strong password)
   - Email: your email

4. **Install Additional Plugins**
   
   Go to **Manage Jenkins** → **Plugins** → **Available Plugins**
   
   Install these plugins:
   - ✅ **Git Plugin** (for GitHub integration)
   - ✅ **Pipeline** (for Jenkinsfile support)
   - ✅ **Docker Pipeline** (for Docker operations)
   - ✅ **SSH Agent Plugin** (for Ansible/SSH deployments)
   - ✅ **Ansible Plugin** (optional but helpful)
   - ✅ **Slack Notification** (optional, for notifications)

---

## Credentials Configuration

Go to **Manage Jenkins** → **Credentials** → **System** → **Global credentials**

### 1. GitHub Credentials

**Type:** Username with password

- **ID:** `github-credentials`
- **Username:** Your GitHub username
- **Password:** GitHub Personal Access Token
  - Generate at: https://github.com/settings/tokens
  - Required scopes: `repo`, `admin:repo_hook`

### 2. EC2 SSH Key

**Type:** SSH Username with private key

- **ID:** `ec2-ssh-key`
- **Username:** `ubuntu`
- **Private Key:** Enter directly
  - Copy content from `~/.ssh/zomato-deploy-key.pem`
  - Or upload the file

### 3. Docker Hub Credentials (Optional for Phase 4)

**Type:** Username with password

- **ID:** `dockerhub-credentials`
- **Username:** Your Docker Hub username
- **Password:** Your Docker Hub password or access token

---

## Pipeline Setup

### 1. Create Pipeline Job

1. Go to Jenkins Dashboard
2. Click **New Item**
3. Enter name: `Zomato-DevOps-Pipeline`
4. Select **Pipeline**
5. Click **OK**

### 2. Configure Pipeline

**General Settings:**
- ✅ Check "GitHub project"
- Project URL: `https://github.com/harsh-raj04/Zomato-devops-pipeline/`

**Build Triggers:**
- ✅ Check "GitHub hook trigger for GITScm polling"
  - This enables automatic builds on push

**Pipeline Configuration:**
- Definition: **Pipeline script from SCM**
- SCM: **Git**
- Repository URL: `https://github.com/harsh-raj04/Zomato-devops-pipeline.git`
- Credentials: Select `github-credentials`
- Branch: `*/main`
- Script Path: `Jenkinsfile`

Click **Save**

### 3. Configure GitHub Webhook

1. Go to your GitHub repository
2. Navigate to **Settings** → **Webhooks** → **Add webhook**
3. Configure:
   - Payload URL: `http://YOUR_JENKINS_URL:8080/github-webhook/`
   - Content type: `application/json`
   - Events: "Just the push event"
   - Active: ✅
4. Click **Add webhook**

---

## Environment Variables

Update these in `Jenkinsfile` or configure in Jenkins:

```groovy
environment {
    EC2_HOST = '3.108.112.197'  // Your EC2 public IP
    EC2_USER = 'ubuntu'
    PROJECT_NAME = 'zomato-app'
}
```

To set globally in Jenkins:
1. **Manage Jenkins** → **System**
2. Scroll to **Global properties**
3. Check **Environment variables**
4. Add variables

---

## Pipeline Stages Overview

Our Jenkinsfile includes these stages:

1. **Checkout** - Clone code from GitHub
2. **Install Dependencies** - npm install for backend and frontend (parallel)
3. **Run Tests** - Execute test suites (placeholder for now)
4. **Build Docker Images** - Build backend and frontend containers
5. **Push to Registry** - Push images to Docker Hub (optional)
6. **Deploy to EC2** - Run Ansible playbook to deploy
7. **Health Check** - Verify services are running

---

## Running the Pipeline

### Manual Trigger

1. Go to your pipeline job
2. Click **Build Now**
3. Watch the build progress in **Console Output**

### Automatic Trigger

- Push code to GitHub `main` branch
- Jenkins will automatically start building

### Build Status

- **Blue** = Success ✅
- **Red** = Failed ❌
- **Yellow** = Unstable ⚠️
- **Gray** = Not built yet

---

## Testing the Setup

### 1. Test Credentials

```bash
# SSH to EC2 from Jenkins server
ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@3.108.112.197 "echo 'SSH works!'"
```

### 2. Test Docker

```bash
# On Jenkins server
docker --version
docker ps
```

### 3. Test Ansible

```bash
# On Jenkins server
ansible --version
cd ansible
ansible-playbook ping.yml
```

---

## Troubleshooting

### Issue: "Permission denied" for Docker

**Solution:** Add Jenkins user to docker group

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Issue: "Host key verification failed" for EC2

**Solution:** Add to Jenkins global SSH configuration

```bash
# As jenkins user
sudo su - jenkins
ssh-keyscan -H 3.108.112.197 >> ~/.ssh/known_hosts
```

Or in `Jenkinsfile`, use:
```groovy
sshagent([SSH_CREDENTIALS_ID]) {
    sh 'ssh -o StrictHostKeyChecking=no ubuntu@${EC2_HOST} ...'
}
```

### Issue: Node.js not found

**Solution:** Install Node.js on Jenkins server

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### Issue: Ansible not found

**Solution:** Install Ansible

```bash
sudo apt update
sudo apt install ansible -y
# Or
pip3 install ansible
```

### Issue: Build fails on test stage

**Solution:** Tests are placeholders. Either:
- Add actual tests to your application
- Or skip test stage by commenting it out in Jenkinsfile

---

## Pipeline Improvements (Future)

### Add Slack Notifications

1. Install **Slack Notification Plugin**
2. Configure Slack workspace and webhook
3. Uncomment Slack code in Jenkinsfile `post` section

### Add Email Notifications

```groovy
post {
    failure {
        mail to: 'your-email@example.com',
             subject: "Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
             body: "Build failed. Check ${env.BUILD_URL}"
    }
}
```

### Add AWS ECR Integration (Phase 4)

- Push images to AWS ECR instead of Docker Hub
- Use IAM roles for authentication

### Add Code Quality Checks

- SonarQube integration
- Code coverage reports
- Security scanning

---

## Monitoring Pipeline

### View Build History

- Dashboard → Your pipeline → **Build History**

### Console Output

- Click on build number → **Console Output**

### Pipeline Visualization

- Click on build → **Pipeline Steps**
- See visual representation of stages

---

## Best Practices

✅ **Use Declarative Pipeline** (already done in Jenkinsfile)
✅ **Parallel stages** for faster builds
✅ **Proper error handling** with post conditions
✅ **Credentials management** via Jenkins credentials store
✅ **Timeout settings** to avoid hanging builds
✅ **Build retention** to save disk space
✅ **Branch-specific deployments** (deploy only from main)

---

## Security Considerations

🔒 **Never commit credentials** to Git
🔒 **Use Jenkins credentials store** for secrets
🔒 **Restrict pipeline execution** to specific branches
🔒 **Use SSH keys** instead of passwords
🔒 **Enable CSRF protection** in Jenkins
🔒 **Keep Jenkins updated** for security patches

---

## Next Steps

After Jenkins is set up:

1. ✅ Test manual build
2. ✅ Push a commit and verify automatic build
3. ✅ Monitor deployment to EC2
4. ✅ Check application health at `http://3.108.112.197:3000`
5. 🚀 Proceed to **Phase 4**: AWS ECR, RDS, Load Balancer

---

## Useful Jenkins Commands

```bash
# Restart Jenkins
sudo systemctl restart jenkins

# View Jenkins logs
sudo journalctl -u jenkins -f

# Jenkins config location
/var/lib/jenkins/

# Reload configuration
curl -X POST http://localhost:8080/reload
```

---

## Additional Resources

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Pipeline Syntax Reference](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Ansible Plugin Docs](https://plugins.jenkins.io/ansible/)
- [Docker Pipeline Plugin](https://plugins.jenkins.io/docker-workflow/)

---

## Support

For issues or questions:
- Check Jenkins console logs
- Review this documentation
- Check GitHub repository issues
- Jenkins community forums

---

**Happy Building! 🚀**

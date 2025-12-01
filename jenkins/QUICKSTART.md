# Jenkins Quick Start Guide

Quick reference for setting up and running Jenkins CI/CD for Zomato application.

## 🚀 Quick Setup (5 minutes)

### 1. Install Jenkins (Ubuntu/Debian)

```bash
# Install Java
sudo apt update && sudo apt install openjdk-17-jdk -y

# Install Jenkins
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | \
  sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | \
  sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update && sudo apt install jenkins -y

# Start Jenkins
sudo systemctl start jenkins && sudo systemctl enable jenkins

# Get initial password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### 2. Access Jenkins

Open `http://localhost:8080` (or your server IP:8080)

### 3. Install Required Plugins

**Manage Jenkins** → **Plugins** → Install:
- Git Plugin
- Pipeline
- Docker Pipeline
- SSH Agent Plugin

### 4. Add Credentials

**Manage Jenkins** → **Credentials** → **Add**:

1. **GitHub** (Username with password)
   - ID: `github-credentials`
   - Token from: https://github.com/settings/tokens

2. **EC2 SSH Key** (SSH Username with private key)
   - ID: `ec2-ssh-key`
   - Username: `ubuntu`
   - Private Key: Content from `~/.ssh/zomato-deploy-key.pem`

### 5. Create Pipeline

1. **New Item** → `Zomato-DevOps-Pipeline` → **Pipeline**
2. Configure:
   - GitHub project: `https://github.com/harsh-raj04/Zomato-devops-pipeline`
   - Build Triggers: ✅ GitHub hook trigger
   - Pipeline: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository: `https://github.com/harsh-raj04/Zomato-devops-pipeline.git`
   - Credentials: `github-credentials`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`

3. **Save**

### 6. Setup GitHub Webhook

Repository → **Settings** → **Webhooks** → **Add webhook**:
- URL: `http://YOUR_JENKINS_IP:8080/github-webhook/`
- Content type: `application/json`
- Events: Just push events

### 7. Run First Build

Click **Build Now** and watch the magic! 🎉

---

## 📝 Pipeline Stages

```
Checkout → Install Dependencies → Run Tests → Build Docker → Deploy → Health Check
```

## 🔧 Update EC2 IP in Jenkinsfile

Edit `Jenkinsfile` line 14:
```groovy
EC2_HOST = 'YOUR_EC2_PUBLIC_IP'
```

## 📱 Testing

After build completes:
- Frontend: `http://3.108.112.197:3000`
- Backend: `http://3.108.112.197:4000/api/restaurants`

## 🐛 Common Issues

**Docker permission denied:**
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

**Node.js not found:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

**Ansible not found:**
```bash
sudo apt install ansible -y
```

---

For detailed documentation, see [jenkins/README.md](./README.md)

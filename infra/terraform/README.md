# Terraform Infrastructure - Zomato DevOps Pipeline

This directory contains Terraform configuration for provisioning AWS infrastructure for the Zomato application.

## 📁 File Structure

```
terraform/
├── provider.tf           # AWS provider and Terraform settings
├── variables.tf          # Input variables and defaults
├── network.tf           # VPC, subnet, internet gateway, route table
├── security.tf          # Security groups and firewall rules
├── ec2.tf               # EC2 instance configuration
├── outputs.tf           # Output values (IPs, URLs, SSH commands)
├── terraform.tfvars.example  # Example variables file
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites

1. **Install Terraform** (>= 1.0)
   ```bash
   brew install terraform
   # Or download from: https://www.terraform.io/downloads
   ```

2. **Configure AWS Credentials**
   ```bash
   aws configure
   # Enter your AWS Access Key ID, Secret Access Key, and region (ap-south-1)
   ```

3. **Create EC2 Key Pair**
   ```bash
   # Create new key pair
   aws ec2 create-key-pair --key-name zomato-deploy-key \
     --query 'KeyMaterial' --output text > ~/.ssh/zomato-deploy-key.pem
   
   # Set correct permissions
   chmod 400 ~/.ssh/zomato-deploy-key.pem
   ```

### Deployment Steps

1. **Copy and customize variables**
   ```bash
   cd infra/terraform
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

2. **Initialize Terraform**
   ```bash
   terraform init
   ```

3. **Preview changes**
   ```bash
   terraform plan
   ```

4. **Apply infrastructure**
   ```bash
   terraform apply
   # Review the plan and type 'yes' to confirm
   ```

5. **Get outputs**
   ```bash
   terraform output
   # Save the instance_public_ip for Ansible
   ```

## 📊 What Gets Created

- ✅ **VPC** - Isolated network (10.0.0.0/16)
- ✅ **Public Subnet** - For EC2 instance (10.0.1.0/24)
- ✅ **Internet Gateway** - Internet connectivity
- ✅ **Route Table** - Routes traffic to internet
- ✅ **Security Group** - Firewall rules (ports 22, 80, 443, 3000, 4000, 5432)
- ✅ **EC2 Instance** - Ubuntu 22.04 t3.micro with Docker pre-installed
- ✅ **Elastic IP** - Static public IP address

## 🔧 Configuration Variables

Edit `terraform.tfvars` to customize:

| Variable | Description | Default |
|----------|-------------|---------|
| `aws_region` | AWS region | `ap-south-1` |
| `environment` | Environment name | `dev` |
| `instance_type` | EC2 instance type | `t3.micro` |
| `key_name` | SSH key pair name | `zomato-deploy-key` |
| `allowed_ssh_cidr` | IPs allowed for SSH | `["0.0.0.0/0"]` |

## 📤 Important Outputs

After `terraform apply`, you'll get:

- `instance_public_ip` - Public IP of EC2 instance
- `ssh_command` - Ready-to-use SSH command
- `frontend_url` - Frontend application URL
- `backend_url` - Backend API URL
- `ansible_inventory` - Pre-formatted for Ansible

## 🔐 Security Notes

1. **SSH Access**: Update `allowed_ssh_cidr` in `terraform.tfvars` to your IP:
   ```bash
   # Get your public IP
   curl ifconfig.me
   # Add to terraform.tfvars: allowed_ssh_cidr = ["YOUR_IP/32"]
   ```

2. **AWS Credentials**: Never commit AWS credentials to git

3. **Key Pairs**: Keep `.pem` files secure and never commit them

4. **State Files**: `terraform.tfstate` contains sensitive data - consider remote state (S3 + DynamoDB) for production

## 🧹 Cleanup

To destroy all infrastructure:

```bash
terraform destroy
# Type 'yes' to confirm
```

## 🔄 Next Steps

After infrastructure is created:

1. Note the `instance_public_ip` from outputs
2. Proceed to Ansible configuration (`../../ansible/`)
3. Use the IP in Ansible inventory
4. Deploy application with Ansible playbook

## 💡 Troubleshooting

**Issue: "Error creating instance: InvalidKeyPair.NotFound"**
- Solution: Create the key pair first (see prerequisites)

**Issue: "Error launching source instance: VPCIdNotSpecified"**
- Solution: Run `terraform init` again

**Issue: SSH connection refused**
- Wait 2-3 minutes after `terraform apply` for user_data script to complete
- Check security group allows your IP
- Verify key file permissions: `chmod 400 ~/.ssh/your-key.pem`

## 📚 Resources

- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS EC2 User Guide](https://docs.aws.amazon.com/ec2/)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)

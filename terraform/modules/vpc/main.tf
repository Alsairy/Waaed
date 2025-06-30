module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = var.name
  cidr = var.cidr

  azs             = var.azs
  private_subnets = var.private_subnets
  public_subnets  = var.public_subnets

  enable_nat_gateway = var.enable_nat_gateway
  enable_vpn_gateway = var.enable_vpn_gateway

  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(var.tags, {
    "kubernetes.io/cluster/${var.name}" = "shared"
  })

  public_subnet_tags = {
    "kubernetes.io/cluster/${var.name}" = "shared"
    "kubernetes.io/role/elb"            = "1"
  }

  private_subnet_tags = {
    "kubernetes.io/cluster/${var.name}" = "shared"
    "kubernetes.io/role/internal-elb"   = "1"
  }
}

resource "aws_db_subnet_group" "default" {
  name       = "${var.name}-db-subnet-group"
  subnet_ids = module.vpc.private_subnets

  tags = merge(var.tags, {
    Name = "${var.name}-db-subnet-group"
  })
}

resource "aws_elasticache_subnet_group" "default" {
  name       = "${var.name}-cache-subnet-group"
  subnet_ids = module.vpc.private_subnets

  tags = var.tags
}

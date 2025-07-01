variable "vpc_id" {
  description = "ID of the VPC where to create security group"
  type        = string
}

variable "tags" {
  description = "A map of tags to add to all resources"
  type        = map(string)
  default     = {}
}

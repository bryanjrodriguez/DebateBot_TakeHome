variable "region" {
  default = "us-east-1"
}

variable "app_name" {
  default = "kopi-debate-api"
}

variable "container_port" {
  default = 8000
}

variable "image_tag" {
  description = "ECR image tag"
  default     = "latest"
}

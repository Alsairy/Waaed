{{/*
Expand the name of the chart.
*/}}
{{- define "waaed.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "waaed.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "waaed.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "waaed.labels" -}}
helm.sh/chart: {{ include "waaed.chart" . }}
{{ include "waaed.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "waaed.selectorLabels" -}}
app.kubernetes.io/name: {{ include "waaed.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "waaed.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "waaed.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Database connection string
*/}}
{{- define "waaed.databaseConnectionString" -}}
{{- if .Values.postgresql.enabled }}
{{- printf "Server=%s-postgresql;Database=%s;User Id=postgres;Password=%s;TrustServerCertificate=true" .Release.Name .Values.postgresql.auth.database .Values.postgresql.auth.postgresPassword }}
{{- else }}
{{- .Values.externalDatabase.connectionString }}
{{- end }}
{{- end }}

{{/*
Redis connection string
*/}}
{{- define "waaed.redisConnectionString" -}}
{{- if .Values.redis.enabled }}
{{- printf "%s-redis-master:6379" .Release.Name }}
{{- else }}
{{- .Values.externalRedis.connectionString }}
{{- end }}
{{- end }}

{{/*
Image name helper
*/}}
{{- define "waaed.image" -}}
{{- $registry := .Values.global.imageRegistry | default .Values.image.registry -}}
{{- $repository := .repository -}}
{{- $tag := .tag | default .Values.image.tag | default (.Chart.AppVersion | default "latest") -}}
{{- printf "%s/%s:%s" $registry $repository $tag -}}
{{- end }}


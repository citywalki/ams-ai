# AMS 数据库设计文档 (ERD)

## 概述

本文档定义了告警管理系统(AMS)的数据库实体关系图(ERD)。系统采用**多租户架构**，所有核心数据表都包含 `tenant_id` 字段实现行级数据隔离。

### 核心设计原则

1. **多租户隔离**: 所有核心表包含 `tenant_id`，通过外键关联到 `tenants` 表
2. **软删除**: 使用 `status` 字段而非物理删除
3. **审计追踪**: 所有表包含 `created_at`, `updated_at` 时间戳
4. **JSON扩展性**: 使用 JSONB 字段存储灵活配置和元数据
5. **性能优化**: 为查询频繁的字段建立索引
6. **配置与实现分离**: 策略配置存储在数据库，策略实现通过SPI机制匹配

---

## 实体关系图 (ERD)

```mermaid
erDiagram
    Tenant ||--o{ User : "1:N"
    Tenant ||--o{ Alarm : "1:N"
    Tenant ||--o{ AlarmPolicy : "1:N"
    Tenant ||--o{ NotificationChannel : "1:N"
    Tenant ||--o{ NotificationTemplate : "1:N"
    Tenant ||--o{ Notification : "1:N"
    Tenant ||--o{ AlarmComment : "1:N"
    Tenant ||--o{ AiAnalysisResult : "1:N"
    Tenant ||--o{ FabEquipment : "1:N"
    Tenant ||--o{ AuditLog : "1:N"
    
    Alarm ||--o{ AlarmComment : "1:N"
    Alarm ||--o{ Notification : "1:N"
    Alarm ||--o{ AiAnalysisResult : "1:N"
    
    User ||--o{ AlarmComment : "1:N"
    User ||--o{ AuditLog : "1:N"
    
    NotificationChannel ||--o{ Notification : "1:N"
    NotificationTemplate ||--o{ Notification : "1:N"
    
    Tenant {
        bigint id PK
        varchar(50) code UK
        varchar(100) name
        varchar(20) status
        jsonb config
        jsonb quota
        timestamp created_at
        timestamp updated_at
    }
    
    User {
        bigint id PK
        bigint tenant_id FK
        varchar(50) username
        varchar(100) email
        varchar(255) password_hash
        varchar(30) role
        varchar(20) status
        jsonb preferences
        timestamp last_login_at
        timestamp created_at
        timestamp updated_at
    }
    
    Alarm {
        bigint id PK
        bigint tenant_id FK
        varchar(255) title
        text description
        varchar(20) severity
        varchar(20) status
        varchar(100) source
        varchar(255) source_id
        varchar(255) fingerprint UK
        jsonb metadata
        timestamp occurred_at
        timestamp acknowledged_at
        timestamp resolved_at
        timestamp closed_at
        timestamp created_at
        timestamp updated_at
    }
    
    AlarmPolicy {
        bigint id PK
        bigint tenant_id FK
        varchar(100) name UK
        varchar(30) type
        boolean enabled
        jsonb conditions
        jsonb actions
        integer priority
        timestamp created_at
        timestamp updated_at
    }
    
    NotificationChannel {
        bigint id PK
        bigint tenant_id FK
        varchar(100) name
        varchar(30) type
        jsonb config
        boolean enabled
        integer priority
        integer rate_limit
        timestamp created_at
        timestamp updated_at
    }
    
    NotificationTemplate {
        bigint id PK
        bigint tenant_id FK
        varchar(100) name
        varchar(30) channel_type
        varchar(20) content_type
        text subject_template
        text body_template
        jsonb variables
        timestamp created_at
        timestamp updated_at
    }
    
    Notification {
        bigint id PK
        bigint tenant_id FK
        bigint alarm_id FK
        bigint channel_id FK
        bigint template_id FK
        varchar(20) status
        varchar(255) recipient
        varchar(500) subject
        text content
        timestamp sent_at
        text error_message
        integer retry_count
        timestamp created_at
        timestamp updated_at
    }
    
    AlarmComment {
        bigint id PK
        bigint tenant_id FK
        bigint alarm_id FK
        bigint user_id FK
        text content
        boolean is_internal
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }
    
    AiAnalysisResult {
        bigint id PK
        bigint tenant_id FK
        bigint alarm_id FK
        varchar(30) analysis_type
        jsonb result
        decimal(5,4) confidence
        varchar(100) model_name
        integer processing_time_ms
        timestamp created_at
        timestamp updated_at
    }
    
    FabEquipment {
        bigint id PK
        bigint tenant_id FK
        varchar(100) equipment_id
        varchar(200) equipment_name
        varchar(50) equipment_type
        varchar(50) fab_area
        varchar(50) bay
        varchar(20) status
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }
    
    AuditLog {
        bigint id PK
        bigint tenant_id FK
        bigint user_id FK
        varchar(100) action
        varchar(50) resource_type
        varchar(100) resource_id
        jsonb details
        varchar(45) ip_address
        text user_agent
        timestamp created_at
    }
```

---

## 核心实体定义

### 1. 租户表 (tenants)

业务线/租户的基础信息表，支持多租户架构。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGSERIAL | PRIMARY KEY | 自增主键 |
| code | VARCHAR(50) | UNIQUE NOT NULL | 业务线代码，如 `it_ops`, `fab_plant` |
| name | VARCHAR(100) | NOT NULL | 业务线名称 |
| status | VARCHAR(20) | DEFAULT 'ACTIVE' | 状态: ACTIVE, INACTIVE, SUSPENDED |
| config | JSONB | | 业务线专属配置 |
| quota | JSONB | | 资源配额配置 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

**索引**:
- `idx_tenants_code` ON tenants(code)
- `idx_tenants_status` ON tenants(status)

**示例配置**:
```json
{
  "notification_hours": "09:00-18:00",
  "timezone": "Asia/Shanghai",
  "default_severity_threshold": "HIGH",
  "allow_auto_resolve": true
}
```

**示例配额**:
```json
{
  "max_alarms_per_day": 10000,
  "max_users": 50,
  "storage_limit_mb": 1024,
  "notification_limit_per_day": 5000,
  "ai_analysis_limit_per_day": 1000
}
```

### 2. 用户表 (users)

系统用户表，支持多层级权限管理。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGSERIAL | PRIMARY KEY | 自增主键 |
| tenant_id | BIGINT | NOT NULL, FK → tenants(id) | 所属业务线 |
| username | VARCHAR(50) | NOT NULL | 用户名 |
| email | VARCHAR(100) | NOT NULL | 邮箱地址 |
| password_hash | VARCHAR(255) | NOT NULL | 密码哈希值 |
| role | VARCHAR(30) | NOT NULL | 角色: SUPER_ADMIN, TENANT_ADMIN, USER |
| status | VARCHAR(20) | DEFAULT 'ACTIVE' | 状态: ACTIVE, INACTIVE, LOCKED |
| preferences | JSONB | | 用户偏好设置 |
| last_login_at | TIMESTAMP | | 最后登录时间 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

**索引**:
- `idx_users_tenant_id` ON users(tenant_id)
- `idx_users_username_tenant` ON users(username, tenant_id) UNIQUE
- `idx_users_email_tenant` ON users(email, tenant_id) UNIQUE
- `idx_users_role_status` ON users(role, status)

**示例偏好设置**:
```json
{
  "notification_preferences": {
    "email": true,
    "dingtalk": false,
    "sms": true
  },
  "dashboard_view": "compact",
  "timezone": "Asia/Shanghai",
  "language": "zh_CN"
}
```

### 3. 告警表 (alarms)

核心告警数据表，存储所有告警信息。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGSERIAL | PRIMARY KEY | 自增主键 |
| tenant_id | BIGINT | NOT NULL, FK → tenants(id) | 所属业务线 |
| title | VARCHAR(255) | NOT NULL | 告警标题 |
| description | TEXT | | 告警详细描述 |
| severity | VARCHAR(20) | NOT NULL | 严重程度: CRITICAL, HIGH, MEDIUM, LOW, INFO |
| status | VARCHAR(20) | DEFAULT 'NEW' | 状态: NEW, ACKNOWLEDGED, IN_PROGRESS, RESOLVED, CLOSED |
| source | VARCHAR(100) | NOT NULL | 告警来源: prometheus, zabbix, custom, eap_mq, etc. |
| source_id | VARCHAR(255) | | 原始告警ID |
| fingerprint | VARCHAR(255) | UNIQUE | 告警指纹，用于去重 |
| metadata | JSONB | | 原始告警元数据 |
| occurred_at | TIMESTAMP | DEFAULT NOW() | 告警发生时间 |
| acknowledged_at | TIMESTAMP | | 确认时间 |
| resolved_at | TIMESTAMP | | 解决时间 |
| closed_at | TIMESTAMP | | 关闭时间 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

**索引**:
- `idx_alarms_tenant_id` ON alarms(tenant_id)
- `idx_alarms_status_severity` ON alarms(status, severity)
- `idx_alarms_created_at` ON alarms(created_at DESC)
- `idx_alarms_fingerprint_tenant` ON alarms(fingerprint, tenant_id) UNIQUE
- `idx_alarms_source_tenant` ON alarms(source, tenant_id)
- `idx_alarms_occurred_at` ON alarms(occurred_at DESC)

**示例元数据**:
```json
{
  "original_data": {
    "alertname": "HighCPUUsage",
    "instance": "server-01:9100",
    "job": "node-exporter",
    "severity": "warning"
  },
  "labels": {
    "environment": "production",
    "team": "infrastructure"
  },
  "annotations": {
    "summary": "CPU usage is above 90%",
    "description": "CPU usage on server-01 is at 95% for the last 5 minutes"
  }
}
```

### 4. 告警策略表 (alarm_policies)

告警处理策略配置表，支持前端配置和代码插件化策略框架。

**重要说明**: 策略插件匹配由代码层 StrategyFactory 根据 `tenant.code` 自动加载，无需在数据表中存储 plugin_name。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGSERIAL | PRIMARY KEY | 自增主键 |
| tenant_id | BIGINT | NOT NULL, FK → tenants(id) | 所属业务线 |
| name | VARCHAR(100) | NOT NULL | 策略名称 |
| type | VARCHAR(30) | NOT NULL | 策略类型: ROUTING, SILENCING, AGGREGATION, ESCALATION, CLASSIFICATION |
| enabled | BOOLEAN | DEFAULT true | 是否启用 |
| conditions | JSONB | NOT NULL | 条件配置 |
| actions | JSONB | NOT NULL | 动作配置 |
| priority | INTEGER | DEFAULT 0 | 优先级（数值越小优先级越高） |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

**索引**:
- `idx_policies_tenant_id` ON alarm_policies(tenant_id)
- `idx_policies_type_enabled` ON alarm_policies(type, enabled)
- `idx_policies_priority` ON alarm_policies(priority)
- `idx_policies_name_tenant` ON alarm_policies(name, tenant_id) UNIQUE

**示例条件配置**:
```json
{
  "operator": "AND",
  "rules": [
    {
      "field": "severity",
      "operator": "IN",
      "value": ["CRITICAL", "HIGH"]
    },
    {
      "field": "source",
      "operator": "EQ",
      "value": "prometheus"
    },
    {
      "field": "title",
      "operator": "CONTAINS",
      "value": "CPU"
    }
  ]
}
```

**示例动作配置**:
```json
{
  "type": "ROUTE_TO_TEAM",
  "target": "infrastructure-team",
  "notification_channels": ["email", "dingtalk"],
  "escalation_after_minutes": 30,
  "auto_acknowledge": false
}
```

### 5. 通知渠道表 (notification_channels)

通知发送渠道配置表。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGSERIAL | PRIMARY KEY | 自增主键 |
| tenant_id | BIGINT | NOT NULL, FK → tenants(id) | 所属业务线 |
| name | VARCHAR(100) | NOT NULL | 渠道名称 |
| type | VARCHAR(30) | NOT NULL | 渠道类型: EMAIL, SMS, DINGTALK, WECHAT_WORK, SLACK, WEBHOOK |
| config | JSONB | NOT NULL | 渠道配置 |
| enabled | BOOLEAN | DEFAULT true | 是否启用 |
| priority | INTEGER | DEFAULT 0 | 发送优先级 |
| rate_limit | INTEGER | | 每分钟发送限制 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

**索引**:
- `idx_channels_tenant_id` ON notification_channels(tenant_id)
- `idx_channels_type_enabled` ON notification_channels(type, enabled)

**邮件渠道配置示例**:
```json
{
  "smtp_host": "smtp.example.com",
  "smtp_port": 587,
  "username": "alerts@example.com",
  "password": "encrypted_password",
  "use_tls": true,
  "from_address": "alerts@example.com",
  "from_name": "AMS Alert System"
}
```

**钉钉渠道配置示例**:
```json
{
  "webhook_url": "https://oapi.dingtalk.com/robot/send",
  "access_token": "encrypted_token",
  "secret": "encrypted_secret",
  "at_mobiles": ["13800138000"],
  "at_all": false
}
```

### 6. 通知模板表 (notification_templates)

通知内容模板表。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGSERIAL | PRIMARY KEY | 自增主键 |
| tenant_id | BIGINT | NOT NULL, FK → tenants(id) | 所属业务线 |
| name | VARCHAR(100) | NOT NULL | 模板名称 |
| channel_type | VARCHAR(30) | NOT NULL | 渠道类型 |
| content_type | VARCHAR(20) | DEFAULT 'TEXT' | 内容类型: TEXT, HTML, MARKDOWN |
| subject_template | TEXT | | 主题模板（用于邮件等） |
| body_template | TEXT | NOT NULL | 内容模板 |
| variables | JSONB | | 变量定义 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

**索引**:
- `idx_templates_tenant_id` ON notification_templates(tenant_id)
- `idx_templates_channel_type` ON notification_templates(channel_type)

**模板示例 (Markdown)**:
```markdown
## 🚨 告警通知

**告警标题**: {{alarm.title}}
**严重程度**: {{alarm.severity}} 
**状态**: {{alarm.status}}
**发生时间**: {{alarm.occurred_at | format_time}}

**详细描述**:
{{alarm.description}}

**处理建议**:
{{#if alarm.metadata.annotations.solution}}
{{alarm.metadata.annotations.solution}}
{{else}}
请登录AMS系统查看详情并处理。
{{/if}}

[查看详情]({{system_url}}/alarms/{{alarm.id}})
```

### 7. 通知记录表 (notifications)

通知发送记录表，用于追踪通知状态。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGSERIAL | PRIMARY KEY | 自增主键 |
| tenant_id | BIGINT | NOT NULL, FK → tenants(id) | 所属业务线 |
| alarm_id | BIGINT | NOT NULL, FK → alarms(id) | 关联告警 |
| channel_id | BIGINT | NOT NULL, FK → notification_channels(id) | 发送渠道 |
| template_id | BIGINT | FK → notification_templates(id) | 使用的模板 |
| status | VARCHAR(20) | DEFAULT 'PENDING' | 状态: PENDING, SENDING, SENT, FAILED |
| recipient | VARCHAR(255) | NOT NULL | 接收者（邮箱、手机号、用户ID等） |
| subject | VARCHAR(500) | | 主题 |
| content | TEXT | | 内容 |
| sent_at | TIMESTAMP | | 发送时间 |
| error_message | TEXT | | 错误信息 |
| retry_count | INTEGER | DEFAULT 0 | 重试次数 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

**索引**:
- `idx_notifications_tenant_id` ON notifications(tenant_id)
- `idx_notifications_alarm_id` ON notifications(alarm_id)
- `idx_notifications_status_created` ON notifications(status, created_at)
- `idx_notifications_channel_id` ON notifications(channel_id)

### 8. 告警评论表 (alarm_comments)

告警处理过程中的评论和备注。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGSERIAL | PRIMARY KEY | 自增主键 |
| tenant_id | BIGINT | NOT NULL, FK → tenants(id) | 所属业务线 |
| alarm_id | BIGINT | NOT NULL, FK → alarms(id) | 关联告警 |
| user_id | BIGINT | NOT NULL, FK → users(id) | 评论用户 |
| content | TEXT | NOT NULL | 评论内容 |
| is_internal | BOOLEAN | DEFAULT false | 是否内部评论（用户不可见） |
| metadata | JSONB | | 元数据（附件信息等） |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

**索引**:
- `idx_comments_tenant_id` ON alarm_comments(tenant_id)
- `idx_comments_alarm_id` ON alarm_comments(alarm_id)
- `idx_comments_user_id` ON alarm_comments(user_id)
- `idx_comments_created_at` ON alarm_comments(created_at DESC)

### 9. AI分析结果表 (ai_analysis_results)

AI分析结果存储表。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGSERIAL | PRIMARY KEY | 自增主键 |
| tenant_id | BIGINT | NOT NULL, FK → tenants(id) | 所属业务线 |
| alarm_id | BIGINT | NOT NULL, FK → alarms(id) | 关联告警 |
| analysis_type | VARCHAR(30) | NOT NULL | 分析类型: CLASSIFICATION, ROOT_CAUSE, SIMILARITY, TREND, DEDUPLICATION |
| result | JSONB | NOT NULL | 分析结果 |
| confidence | DECIMAL(5,4) | | 置信度 (0-1) |
| model_name | VARCHAR(100) | | 模型名称 |
| processing_time_ms | INTEGER | | 处理时间（毫秒） |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

**索引**:
- `idx_ai_results_tenant_id` ON ai_analysis_results(tenant_id)
- `idx_ai_results_alarm_id` ON ai_analysis_results(alarm_id)
- `idx_ai_results_type_created` ON ai_analysis_results(analysis_type, created_at DESC)

**分析结果示例**:
```json
{
  "classification": {
    "primary_category": "INFRASTRUCTURE",
    "sub_category": "COMPUTE",
    "confidence": 0.92,
    "alternative_categories": [
      {"category": "NETWORK", "confidence": 0.07},
      {"category": "STORAGE", "confidence": 0.01}
    ]
  },
  "root_cause_analysis": {
    "likely_cause": "High CPU usage due to runaway process",
    "suggested_actions": ["Check process list", "Restart service"],
    "related_alarms": [123, 456]
  },
  "similarity": {
    "similar_alarm_ids": [789, 101],
    "similarity_score": 0.85
  }
}
```

### 10. 晶圆厂设备表 (fab_equipments) - 半导体专用

半导体晶圆厂设备信息表。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGSERIAL | PRIMARY KEY | 自增主键 |
| tenant_id | BIGINT | NOT NULL, FK → tenants(id) | 所属业务线 |
| equipment_id | VARCHAR(100) | NOT NULL | 设备ID |
| equipment_name | VARCHAR(200) | NOT NULL | 设备名称 |
| equipment_type | VARCHAR(50) | NOT NULL | 设备类型: LITHO, ETCH, IMPLANT, DEPOSITION, METROLOGY, CMP, CLEAN |
| fab_area | VARCHAR(50) | | 厂区 |
| bay | VARCHAR(50) | | 区域 |
| status | VARCHAR(20) | DEFAULT 'OPERATIONAL' | 状态: OPERATIONAL, MAINTENANCE, DOWN, ENGINEERING |
| metadata | JSONB | | 设备元数据 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

**索引**:
- `idx_equipment_tenant_id` ON fab_equipments(tenant_id)
- `idx_equipment_id_tenant` ON fab_equipments(equipment_id, tenant_id) UNIQUE
- `idx_equipment_type_status` ON fab_equipments(equipment_type, status)

**设备元数据示例**:
```json
{
  "vendor": "ASML",
  "model": "TWINSCAN NXT:2000i",
  "installation_date": "2024-01-15",
  "last_maintenance": "2025-12-01",
  "technical_parameters": {
    "throughput": "275 wph",
    "overlay": "< 1.5 nm",
    "focus": "< 20 nm"
  },
  "contact_person": {
    "name": "John Smith",
    "email": "john.smith@example.com",
    "phone": "+86 13800138000"
  }
}
```

### 11. 审计日志表 (audit_logs)

系统操作审计日志表。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGSERIAL | PRIMARY KEY | 自增主键 |
| tenant_id | BIGINT | | 所属业务线（可为空，表示全局操作） |
| user_id | BIGINT | | 操作用户（可为空，表示系统操作） |
| action | VARCHAR(100) | NOT NULL | 操作类型 |
| resource_type | VARCHAR(50) | NOT NULL | 资源类型: ALARM, USER, POLICY, CHANNEL, etc. |
| resource_id | VARCHAR(100) | | 资源ID |
| details | JSONB | | 操作详情 |
| ip_address | VARCHAR(45) | | IP地址 |
| user_agent | TEXT | | 用户代理 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |

**索引**:
- `idx_audit_logs_tenant_id` ON audit_logs(tenant_id)
- `idx_audit_logs_user_id` ON audit_logs(user_id)
- `idx_audit_logs_resource` ON audit_logs(resource_type, resource_id)
- `idx_audit_logs_created_at` ON audit_logs(created_at DESC)

---

## 策略插件化架构

### 策略配置层 vs 策略实现层

```
┌─────────────────────────────────────────────────────────────┐
│  策略配置层（数据库）                                         │
├─────────────────────────────────────────────────────────────┤
│  alarm_policies 表                                            │
│  - tenant_id: 业务线隔离                                      │
│  - type: 策略类型（ROUTING, CLASSIFICATION等）                │
│  - conditions: JSON格式的条件配置                             │
│  - actions: JSON格式的动作配置                               │
│                                                             │
│  示例: IT运维业务线的前端配置策略                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  策略实现层（代码）                                           │
├─────────────────────────────────────────────────────────────┤
│  StrategyFactory                                            │
│  - 根据 tenant.code 自动匹配策略实现                          │
│  - 支持 SPI 插件扩展                                         │
│                                                             │
│  示例: FabClassificationStrategy ("fab_plant"业务线专用)     │
└─────────────────────────────────────────────────────────────┘
```

### 策略匹配流程

1. **读取配置**: 从 `alarm_policies` 表读取 `tenant_id` 对应的策略配置
2. **选择实现**: `StrategyFactory` 根据 `tenant.code` 加载对应的 SPI 插件
3. **执行策略**: 策略实现使用配置中的 `conditions` 和 `actions` 执行逻辑

### 前端配置 vs 代码插件

| 方式 | 适用场景 | 存储位置 | 实现方式 |
|------|---------|---------|---------|
| **前端配置** | 通用策略（路由、静默等） | `alarm_policies` 表 | JSON 配置 |
| **代码插件** | 复杂逻辑（AI分类、根因分析） | Java SPI 类 | Java 代码 |

### 代码示例

```java
// 策略工厂 - 自动匹配
@Singleton
public class StrategyFactory {
    public AlarmClassificationStrategy getClassificationStrategy(Tenant tenant) {
        switch (tenant.getCode()) {
            case "fab_plant":
                return new FabClassificationStrategy();
            case "it_ops":
                return new ITClassificationStrategy();
            default:
                return new DefaultClassificationStrategy();
        }
    }
}

// 策略执行 - 使用数据库配置
public String classify(Alarm alarm, Tenant tenant) {
    // 1. 获取策略配置（从数据库）
    List<AlarmPolicy> policies = policyRepository.findByTenantAndType(
        tenant.getId(), 
        PolicyType.CLASSIFICATION
    );
    
    // 2. 获取策略实现（通过SPI）
    AlarmClassificationStrategy strategy = strategyFactory.getClassificationStrategy(tenant);
    
    // 3. 使用配置执行策略
    return strategy.classify(alarm, policies);
}
```

### 优势
1. **配置与实现分离**: 前端配置简单策略，复杂逻辑使用代码插件
2. **业务线定制**: 不同业务线可配置不同的策略实现
3. **热加载支持**: SPI 机制支持插件热加载，无需重启服务

---

## 数据库迁移策略

### Liquibase 变更日志结构

```
db/
├── changelog/
│   ├── db.changelog-master.yaml          # 主变更日志
│   ├── 001-initial-schema.yaml           # 初始schema
│   ├── 002-add-indexes.yaml              # 索引添加
│   ├── 003-seed-data.yaml                # 种子数据
│   └── 004-alter-tables.yaml             # 表结构变更
├── scripts/
│   ├── oracle-compatibility/             # Oracle兼容脚本
│   └── postgres-optimizations/           # PostgreSQL优化脚本
└── test-data/
    └── test-data.yaml                    # 测试数据
```

### 多数据库兼容性

1. **PostgreSQL 为主**: 所有功能首先保证在 PostgreSQL 上正常工作
2. **Oracle 兼容**: 通过 Liquibase 确保表结构和数据类型兼容
3. **差异处理**:
   - JSONB → CLOB (Oracle) + JSON约束
   - SERIAL → SEQUENCE + TRIGGER (Oracle)
   - 时区处理差异
   - 函数和索引语法差异

---

## 性能优化建议

### 索引策略

1. **租户级查询优化**:
   - 所有 `tenant_id` 字段建立索引
   - 组合索引: `(tenant_id, status)`, `(tenant_id, created_at)`

2. **告警查询优化**:
   - `alarms(status, severity, created_at)` 复合索引
   - `alarms(fingerprint)` 唯一索引用于去重
   - `alarms(occurred_at DESC)` 用于时间范围查询

3. **策略查询优化**:
   - `alarm_policies(tenant_id, type, enabled)` 复合索引
   - `alarm_policies(name, tenant_id)` 唯一索引

4. **通知查询优化**:
   - `notifications(status, created_at)` 用于查询待发送通知
   - `notifications(alarm_id)` 用于查询告警相关通知

### 分区策略（未来考虑）

当数据量达到一定规模时，可考虑按以下维度分区：
1. **按时间分区**: 按月或按季度分区告警表
2. **按租户分区**: 超大租户独立分区
3. **按状态分区**: 活跃告警和历史告警分区

### 缓存策略

1. **Hazelcast 分布式缓存**:
   - 租户配置缓存 (TTL: 1小时)
   - 策略配置缓存 (TTL: 30分钟)
   - 用户信息缓存 (TTL: 2小时)
   - 热点告警缓存 (TTL: 5分钟)

---

## 数据保留策略

| 表名 | 保留期限 | 清理策略 |
|------|---------|---------|
| alarms | 90天 | 移动到历史表，按需归档 |
| notifications | 30天 | 移动到历史表 |
| audit_logs | 180天 | 压缩归档 |
| ai_analysis_results | 30天 | 删除 |
| alarm_comments | 随告警保留 | 随告警一起归档 |

---

## 安全考虑

1. **数据隔离**: 应用层确保 `tenant_id` 过滤，数据库层通过外键约束
2. **敏感数据加密**:
   - 密码使用 bcrypt 哈希
   - 渠道配置中的密钥加密存储
   - 传输层使用 TLS
3. **访问控制**:
   - 数据库用户权限最小化原则
   - 只读副本用于报表查询
   - 连接池限制每个租户最大连接数

---

## 监控指标

1. **数据库性能**:
   - 查询响应时间 P95/P99
   - 连接池使用率
   - 索引命中率
   - 锁等待时间

2. **业务指标**:
   - 各租户告警数量/日
   - 通知发送成功率
   - AI分析平均处理时间
   - 数据增长趋势

---

## 附录

### A. 完整SQL建表语句示例

```sql
-- 租户表
CREATE TABLE tenants (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    config JSONB,
    quota JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tenants_code ON tenants(code);
CREATE INDEX idx_tenants_status ON tenants(status);

-- 用户表
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    preferences JSONB,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(username, tenant_id),
    UNIQUE(email, tenant_id)
);

CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_role_status ON users(role, status);

-- 告警表
CREATE TABLE alarms (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'NEW',
    source VARCHAR(100) NOT NULL,
    source_id VARCHAR(255),
    fingerprint VARCHAR(255) UNIQUE,
    metadata JSONB,
    occurred_at TIMESTAMP DEFAULT NOW(),
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alarms_tenant_id ON alarms(tenant_id);
CREATE INDEX idx_alarms_status_severity ON alarms(status, severity);
CREATE INDEX idx_alarms_created_at ON alarms(created_at DESC);
CREATE INDEX idx_alarms_fingerprint_tenant ON alarms(fingerprint, tenant_id);
CREATE INDEX idx_alarms_source_tenant ON alarms(source, tenant_id);
CREATE INDEX idx_alarms_occurred_at ON alarms(occurred_at DESC);

-- 告警策略表（注意：无 plugin_name 字段）
CREATE TABLE alarm_policies (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(30) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(name, tenant_id)
);

CREATE INDEX idx_policies_tenant_id ON alarm_policies(tenant_id);
CREATE INDEX idx_policies_type_enabled ON alarm_policies(type, enabled);
CREATE INDEX idx_policies_priority ON alarm_policies(priority);

-- 其他表类似...
```

### B. 数据库连接配置示例

```yaml
# PostgreSQL 配置
datasources:
  default:
    url: jdbc:postgresql://localhost:5432/ams_db
    driverClassName: org.postgresql.Driver
    username: ams_user
    password: ${DB_PASSWORD}
    maximum-pool-size: 20
    minimum-idle: 5
    connection-timeout: 30000
    validation-timeout: 5000
    
# Oracle 配置（兼容模式）
datasources:
  oracle:
    url: jdbc:oracle:thin:@localhost:1521:XE
    driverClassName: oracle.jdbc.OracleDriver
    username: ams_user
    password: ${ORACLE_PASSWORD}
    maximum-pool-size: 15
    minimum-idle: 3
```

### C. 参考文档

1. [PostgreSQL JSONB 文档](https://www.postgresql.org/docs/current/datatype-json.html)
2. [Liquibase 多数据库支持](https://docs.liquibase.com/workflows/liquibase-community/multiple-database-types.html)
4. [Quarkus 数据访问](https://quarkus.io/guides/hibernate-orm-panache)

---

*文档版本: 2.0.0*  
*最后更新: 2026年1月*  
*维护者: AMS 架构团队*

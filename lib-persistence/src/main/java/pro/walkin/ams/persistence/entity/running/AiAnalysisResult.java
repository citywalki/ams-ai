package pro.walkin.ams.persistence.entity.running;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import pro.walkin.ams.persistence.entity.BaseEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * AI分析结果实体
 *
 * <p>对应数据库表: ai_analysis_results
 */
@Entity
@Table(name = "ai_analysis_results")
public class AiAnalysisResult extends BaseEntity {

  /*
   * 关联告警
   */
  @ManyToOne
  @JoinColumn(name = "alarm_id")
  Alarm alarm;

  /*
   * 分析类型
   */
  @Column(name = "analysis_type")
  String analysisType;

  /*
   * 分析结果 (JSONB)
   */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "result")
  Map<String, Object> result;

  /*
   * 置信度
   */
  @Column(name = "confidence")
  BigDecimal confidence;

  /*
   * 模型名称
   */
  @Column(name = "model_name")
  String modelName;

  /*
   * 处理时间（毫秒）
   */
  @Column(name = "processing_time_ms")
  Integer processingTimeMs;

  /*
   * 创建时间
   */
  @Column(name = "created_at")
  LocalDateTime createdAt;

  /*
   * 更新时间
   */
  @Column(name = "updated_at")
  LocalDateTime updatedAt;
}

package pro.walkin.ams.persistence.entity.running;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Map;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
import pro.walkin.ams.persistence.entity.BaseEntity;

/**
 * 晶圆厂设备实体 - 半导体专用
 *
 * <p>对应数据库表: fab_equipments
 */
@Entity
@Table(name = "fab_equipments")
public class FabEquipment extends BaseEntity {

  /*
   * 创建时间
   */
  @Column(name = "created_at")
  @CreationTimestamp
  public Instant createdAt;
  /*
   * 更新时间
   */
  @Column(name = "updated_at")
  @UpdateTimestamp
  public Instant updatedAt;
  /*
   * 设备ID
   */
  @Column(name = "equipment_id")
  String equipmentId;
  /*
   * 设备名称
   */
  @Column(name = "equipment_name")
  String equipmentName;
  /*
   * 设备类型
   */
  @Column(name = "equipment_type")
  String equipmentType;
  /*
   * 晶圆厂区域
   */
  @Column(name = "fab_area")
  String fabArea;
  /*
   * Bay编号
   */
  @Column(name = "bay")
  String bay;
  /*
   * 设备状态
   */
  @Column(name = "status")
  String status;
  /*
   * 设备元数据 (JSONB)
   */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "metadata")
  Map<String, Object> metadata;
}

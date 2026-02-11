package pro.walkin.ams.core.processor;

import pro.walkin.ams.persistence.entity.running.Alarm;

/**
 * 告警处理器接口
 *
 * @param <T> 处理结果类型
 */
public interface AlarmProcessor<T> {

  /**
   * 处理告警
   *
   * @param alarm 告警实体
   * @return 处理结果
   */
  void process(Alarm alarm);

  /**
   * 获取处理器名称
   *
   * @return 处理器名称
   */
  String getName();

  /**
   * 获取处理器优先级（数值越小优先级越高）
   *
   * @return 优先级
   */
  default int getPriority() {
    return 100;
  }
}

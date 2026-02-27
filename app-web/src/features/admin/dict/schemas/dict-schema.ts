import { z } from 'zod';

// 分类表单 Schema
export const dictCategoryFormSchema = z.object({
  code: z.string().min(1, '分类编码不能为空').max(50, '分类编码最多50个字符'),
  name: z.string().min(1, '分类名称不能为空').max(100, '分类名称最多100个字符'),
  description: z.string().max(500, '描述最多500个字符').optional().or(z.literal('')),
  sort: z.number().int('排序必须是整数').min(0, '排序不能为负数'),
  status: z.number().int().min(0).max(1),
});

export type DictCategoryFormData = z.infer<typeof dictCategoryFormSchema>;

export const initialDictCategoryFormState: DictCategoryFormData = {
  code: '',
  name: '',
  description: '',
  sort: 0,
  status: 1,
};

// 字典项表单 Schema
export const dictItemFormSchema = z.object({
  categoryId: z.string().min(1, '分类ID不能为空'),
  parentId: z.string().optional().nullable(),
  code: z.string().min(1, '字典编码不能为空').max(50, '字典编码最多50个字符'),
  name: z.string().min(1, '字典名称不能为空').max(100, '字典名称最多100个字符'),
  value: z.string().max(200, '值最多200个字符').optional().or(z.literal('')),
  sort: z.number().int('排序必须是整数').min(0, '排序不能为负数'),
  status: z.number().int().min(0).max(1),
  remark: z.string().max(500, '备注最多500个字符').optional().or(z.literal('')),
});

export type DictItemFormData = z.infer<typeof dictItemFormSchema>;

export const initialDictItemFormState: DictItemFormData = {
  categoryId: '',
  parentId: null,
  code: '',
  name: '',
  value: '',
  sort: 0,
  status: 1,
  remark: '',
};

import { z } from 'zod';

export const sortDirectionSchema = z.enum(['asc', 'desc']);

export type SortDirection = z.infer<typeof sortDirectionSchema>;

export const paginationRequestSchema = z
  .object({
    limit: z.number().int().min(1).max(100).default(25),
    cursor: z.string().trim().min(1).max(512).optional(),
  })
  .strict();

export type PaginationRequest = z.infer<typeof paginationRequestSchema>;

export const filterScalarSchema = z.union([
  z.string(),
  z.number().refine(Number.isFinite),
  z.boolean(),
  z.null(),
]);

export type FilterScalar = z.infer<typeof filterScalarSchema>;

export const filterMapSchema = z.record(z.string().trim().min(1), filterScalarSchema);

export type FilterMap = z.infer<typeof filterMapSchema>;

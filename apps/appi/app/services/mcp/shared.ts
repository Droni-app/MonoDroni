import { z } from 'zod'

export const pagination = {
  page: z.number().int().min(1).optional().describe('Número de página (default 1)'),
  per_page: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe('Resultados por página (default 10)'),
}

/**
 * Tagged template that URL-encodes every interpolated segment, so ids/slugs
 * coming from the model can't change the target route:
 * path`admin/learn/courses/${id}/lessons`
 */
export function path(strings: TemplateStringsArray, ...segments: string[]) {
  return strings.reduce(
    (url, part, i) => url + part + (i < segments.length ? encodeURIComponent(segments[i]) : ''),
    ''
  )
}

import vine from '@vinejs/vine'

export const storeAttachmentValidator = vine.create({
  name: vine.string(),
  file: vine.file({
    size: '10mb',
    extnames: [
      'jpg',
      'jpeg',
      'png',
      'webp',
      'pdf',
      'doc',
      'docx',
      'xls',
      'xlsx',
      'zip',
      'text',
      'markdown',
    ],
  }),
})

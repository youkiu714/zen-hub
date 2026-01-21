/**
 * 解析docx文件，提取docx文件中的内容，以json结构展示出来
 * 表格中有的内容项有姓名，性别，民族，出生年月，电话号码，微信号，身份证号
 * 婚姻状况，常住地，省市，详细地址，最高学历，毕业院校，专业，职业，紧急联系人1姓名，紧急联系人1联系方式，紧急联系人2姓名，紧急联系人2联系方式，疾病史（请如实填写），服药史（请如实填写），传染病史（请如实填写），过往学修、承担经历，现承担部组，来崇恩寺的次数及时间，申请短住开始时间，申请短住结束时间，短住的原因及期许，推荐人，推荐人评价
 * 上面都是key，其中有一个输入项是图片，但是没有key，如果解析到图片，直接列为头像的key，并且返回base64的图片，最终以json的格式反馈key 和 value
 */

import { strFromU8, unzipSync } from 'fflate'

export type DocxAnalyzeResult = Record<string, string | string[]>

const FIELD_LABELS = [
  '姓名',
  '性别',
  '民族',
  '出生年月',
  '电话号码',
  '微信号',
  '身份证号',
  '婚姻状况',
  '常住地',
  '省市',
  '详细地址',
  '最高学历',
  '毕业院校',
  '专业',
  '职业',
  '紧急联系人',
  '联系方式',
  '疾病史（请如实填写）',
  '服药史（请如实填写）',
  '传染病史（请如实填写）',
  '过往学修、承担经历',
  '现承担部组',
  '来崇恩寺的次数及时间',
  '申请短住开始时间',
  '申请短住结束时间',
  '短住的原因及期许',
  '推荐人',
  '推荐人评价'
]

const normalizeLabel = (label: string) => label.replace(/[\s:：()（）]/g, '').trim()

const FIELD_LABEL_MAP = new Map(FIELD_LABELS.map((label) => [normalizeLabel(label), label]))

const getElementsByLocalName = (doc: Document, localName: string) =>
  Array.from(doc.getElementsByTagNameNS('*', localName))

const extractTextFromNode = (node: Element) => {
  const textNodes = getElementsByLocalName(node.ownerDocument ?? node, 't')
  const texts: string[] = []
  for (const textNode of textNodes) {
    if (node.contains(textNode) && textNode.textContent) {
      texts.push(textNode.textContent)
    }
  }
  return texts.join('').trim()
}

const extractTablePairs = (doc: Document) => {
  const results: Array<{ label: string; value: string }> = []
  const tables = getElementsByLocalName(doc, 'tbl')
  for (const table of tables) {
    const rows = getElementsByLocalName(table, 'tr')
    for (const row of rows) {
      const cells = getElementsByLocalName(row, 'tc')
      const cellTexts = cells.map((cell) => extractTextFromNode(cell))
      if (!cellTexts.length) continue

      for (let i = 0; i < cellTexts.length - 1; i += 2) {
        const label = cellTexts[i]?.trim()
        const value = cellTexts[i + 1]?.trim()
        if (!label || !value) continue
        results.push({ label, value })
      }
    }
  }
  return results
}

const parseImageFromDocx = (
  files: Record<string, Uint8Array>,
  documentXml: string
): string | undefined => {
  const relsFile = files['word/_rels/document.xml.rels']
  if (!relsFile) return undefined

  const parser = new DOMParser()
  const doc = parser.parseFromString(documentXml, 'application/xml')
  const rels = parser.parseFromString(strFromU8(relsFile), 'application/xml')

  const blips = getElementsByLocalName(doc, 'blip')
  if (!blips.length) return undefined

  const embedId = blips[0].getAttribute('r:embed') || blips[0].getAttribute('embed')
  if (!embedId) return undefined

  const relNodes = Array.from(rels.getElementsByTagName('Relationship'))
  const rel = relNodes.find((node) => node.getAttribute('Id') === embedId)
  const target = rel?.getAttribute('Target')
  if (!target) return undefined

  const normalizedTarget = target.startsWith('/') ? target.slice(1) : target
  const mediaPath = normalizedTarget.startsWith('word/')
    ? normalizedTarget
    : `word/${normalizedTarget}`
  const media = files[mediaPath]
  if (!media) return undefined

  const ext = mediaPath.split('.').pop()?.toLowerCase()
  const mime =
    ext === 'png'
      ? 'image/png'
      : ext === 'jpg' || ext === 'jpeg'
        ? 'image/jpeg'
        : ext === 'gif'
          ? 'image/gif'
          : 'application/octet-stream'

  const base64 = uint8ArrayToBase64(media)
  return `data:${mime};base64,${base64}`
}

const uint8ArrayToBase64 = (data: Uint8Array) => {
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}

export const analyzeDocx = async (file: File): Promise<DocxAnalyzeResult> => {
  const buffer = await file.arrayBuffer()
  const files = unzipSync(new Uint8Array(buffer))
  const documentFile = files['word/document.xml']
  if (!documentFile) {
    throw new Error('未找到 docx 文档主体')
  }

  const documentXml = strFromU8(documentFile)
  const parser = new DOMParser()
  const doc = parser.parseFromString(documentXml, 'application/xml')

  const entries = extractTablePairs(doc)
  const result: DocxAnalyzeResult = {}

  for (const { label, value } of entries) {
    const normalized = normalizeLabel(label)
    const mapped = FIELD_LABEL_MAP.get(normalized)
    if (!mapped) continue
    const existing = result[mapped]
    if (existing == null) {
      result[mapped] = value
    } else if (Array.isArray(existing)) {
      existing.push(value)
    } else {
      result[mapped] = [existing, value]
    }
  }

  const avatar = parseImageFromDocx(files, documentXml)
  if (avatar) {
    result['头像'] = avatar
  }

  return result
}

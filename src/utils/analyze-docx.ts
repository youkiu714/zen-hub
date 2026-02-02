/**
 * 解析docx文件，提取docx文件中的内容，以json结构展示出来
 * 表格中有的内容项有姓名，性别，民族，出生年月，电话号码，微信号，身份证号
 * 婚姻状况，常住省市，常住详细地址，最高学历，毕业院校，专业，职业，紧急联系人1姓名，紧急联系人1联系方式，紧急联系人2姓名，紧急联系人2联系方式，疾病史（请如实填写），服药史（请如实填写），传染病史（请如实填写），过往学修、承担经历，现承担部组，来崇恩寺的次数及时间，申请短住开始时间，申请短住结束时间，短住的原因及期许，推荐人，推荐人评价
 * 上面都是key，其中有一个输入项是图片，但是没有key，如果解析到图片，直接列为头像的key，并且返回可上传的文件，最终以json的格式反馈key 和 value
 */

import { strFromU8, unzipSync } from 'fflate'

export type DocxAnalyzeResult = Record<string, string | string[] | File>

const FIELD_LABELS = [
  '姓名',
  '性别',
  '民族',
  '出生年月',
  '电话号码',
  '微信号',
  '身份证号',
  '婚姻状况',
  '常住省市',
  '常住详细地址',
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

// 获取指定节点下所有指定 localName 的子元素（递归）
const getElementsByLocalName = (node: Node, localName: string) => {
  // 兼容 Document 和 Element
  const root = node instanceof Document ? node : (node as Element)
  return Array.from(root.getElementsByTagNameNS('*', localName))
}

const extractTextFromNode = (node: Element) => {
  // 1. 尝试获取单元格内的所有段落 <w:p>
  const paragraphs = getElementsByLocalName(node, 'p')

  // 如果找到段落，则按段落处理（这是大多数情况）
  if (paragraphs.length > 0) {
    return paragraphs
      .map((p) => {
        // 获取段落内的所有后代元素，按文档顺序排列
        const descendants = Array.from(p.getElementsByTagName('*'))
        let pText = ''

        for (const child of descendants) {
          const localName = child.localName
          if (localName === 't') {
            // <w:t> 包含文本
            pText += child.textContent || ''
          } else if (localName === 'br' || localName === 'cr') {
            // <w:br/> 或 <w:cr/> 代表换行
            pText += '\n'
          }
        }
        return pText
      })
      .join('\n') // 段落之间用换行符连接
      .trim()
  }

  // 2. 兜底逻辑：如果没有发现段落结构，直接扫描当前节点下的 t 和 br
  // 这通常用于处理非标准结构或简单片段
  const descendants = Array.from(node.getElementsByTagName('*'))
  let text = ''
  for (const child of descendants) {
    const localName = child.localName
    if (localName === 't') {
      text += child.textContent || ''
    } else if (localName === 'br' || localName === 'cr') {
      text += '\n'
    }
  }
  return text.trim()
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
): File | undefined => {
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
          : 'image/png'

  const fileExt = ext && ext !== '' ? ext : 'png'
  return new File([media], `avatar.${fileExt}`, { type: mime })
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

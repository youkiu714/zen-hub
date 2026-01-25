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
  // 先获取所有段落
  const paragraphs = getElementsByLocalName(node.ownerDocument ?? node, 'p')
  const cellParagraphs: Element[] = []

  // 筛选出属于当前单元格的段落
  for (const para of paragraphs) {
    if (node.contains(para)) {
      cellParagraphs.push(para)
    }
  }

  // 如果没有段落，降级到直接获取文本节点
  if (cellParagraphs.length === 0) {
    const textNodes = getElementsByLocalName(node.ownerDocument ?? node, 't')
    const texts: string[] = []
    for (const textNode of textNodes) {
      if (node.contains(textNode) && textNode.textContent) {
        texts.push(textNode.textContent)
      }
    }
    return texts.join('').trim()
  }

  // 提取每个段落的文本，并用换行符连接
  const paragraphTexts: string[] = []
  for (const para of cellParagraphs) {
    const textNodes = getElementsByLocalName(para.ownerDocument ?? para, 't')
    const texts: string[] = []
    for (const textNode of textNodes) {
      if (para.contains(textNode) && textNode.textContent) {
        texts.push(textNode.textContent)
      }
    }
    const paraText = texts.join('').trim()
    if (paraText) {
      paragraphTexts.push(paraText)
    }
  }

  return paragraphTexts.join('\n').trim()
}

const extractTablePairs = (doc: Document) => {
  const results: Array<{ label: string; value: string }> = []
  const tables = getElementsByLocalName(doc, 'tbl')

  // 辅助函数：检查文本是否是已知的字段标签
  const isKnownLabel = (text: string): boolean => {
    if (!text || !text.trim()) return false
    const normalized = normalizeLabel(text)
    return FIELD_LABEL_MAP.has(normalized)
  }

  // 辅助函数：检查文本是否是类别标签
  const isCategoryLabel = (text: string): boolean => {
    if (!text || !text.trim()) return false
    const knownCategories = ['常住地', '基本信息', '学修情况', '挂单信息', '申请信息']
    return knownCategories.includes(text.trim())
  }

  for (const table of tables) {
    const rows = getElementsByLocalName(table, 'tr')

    for (const row of rows) {
      const cells = getElementsByLocalName(row, 'tc')
      const cellTexts = cells.map((cell) => extractTextFromNode(cell))
      if (!cellTexts.length) continue

      // 清理空单元格
      const filteredCells = cellTexts.filter(text => text && text.trim())

      // 尝试不同的表格结构
      if (filteredCells.length === 2) {
        // 两列结构: 标签 | 值
        const label = filteredCells[0]?.trim()
        const value = filteredCells[1]?.trim()

        // 检查值是否是标签（避免错位）
        if (label && value && !isKnownLabel(value)) {
          results.push({ label, value })
        } else if (label && isKnownLabel(value)) {
          // 如果值是标签，说明可能为空，记录空值
          results.push({ label, value: '' })
        }
      } else if (filteredCells.length === 3) {
        // 三列结构: 类别 | 字段 | 值  或  标签1 | 标签2 | 值
        const col1 = filteredCells[0]?.trim()
        const col2 = filteredCells[1]?.trim()
        const col3 = filteredCells[2]?.trim()
console.log('三列结构：', col1)
        if (isCategoryLabel(col1)) {
          // 结构: 类别 | 字段 | 值，例如：常住地 | 省市 | 北京市
          if (col2 && col3 && !isKnownLabel(col3)) {
            results.push({ label: col2, value: col3 })
          } else if (col2 && isKnownLabel(col3)) {
            // 第三列是标签，说明值为空
            results.push({ label: col2, value: '' })
          }
        } else {
          // 可能是 标签 | 空 | 标签 或 标签 | 值 | 标签 的结构
          if (col1 && !isKnownLabel(col2) && !isKnownLabel(col3)) {
            // 正常情况: 标签1 | 值 | 其他内容
            results.push({ label: col1, value: col2 })
          } else if (col1 && isKnownLabel(col2)) {
            // 第二列是标签，说明第一列的值为空
            results.push({ label: col1, value: '' })
          } else if (col1 && col3 && !isKnownLabel(col3)) {
            // 尝试使用第一和第三列
            results.push({ label: col1, value: col3 })
          }
        }
      } else if (filteredCells.length >= 4) {
        // 多列结构，尝试所有相邻对
        for (let i = 0; i < filteredCells.length - 1; i++) {
          const label = filteredCells[i]?.trim()
          const value = filteredCells[i + 1]?.trim()
          console.log(label)
          // 跳过类别标签和空值
          // if (!label || isCategoryLabel(label)) continue
          results.push({ label, value })
          i++ // 跳过下一个，因为是值

          // 如果值是标签，说明当前字段为空
          // if (isKnownLabel(value)) {
          //   results.push({ label, value: '' })
          //   // 不跳过，因为value可能是下一个标签
          // } else if (value && !isKnownLabel(value)) {
          //   results.push({ label, value })
          //   i++ // 跳过下一个，因为是值
          // }
        }
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

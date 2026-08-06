const { pool } = require('../config/mysql')

function safeParseJSON(val, defaultValue = []) {
  if (!val) return defaultValue
  if (typeof val !== 'string') return val
  try {
    if (val.startsWith('[') || val.startsWith('{')) {
      return JSON.parse(val)
    }
    return val.split(',').map(s => s.trim()).filter(Boolean)
  } catch (e) {
    return defaultValue
  }
}

class MySQLService {
  async getHerbById(id) {
    const [rows] = await pool.query(`
      SELECT h.*,
             ki.smell, ki.texture, ki.cross_section, ki.outer_skin, ki.other,
             (SELECT hi.image_url FROM herb_images hi WHERE hi.herb_id = h.id AND hi.is_cover = 1 ORDER BY hi.sort_order LIMIT 1) as cover_image_url
      FROM herbs h
      LEFT JOIN key_identification ki ON h.id = ki.herb_id
      WHERE h.id = ?
    `, [id])

    if (!rows.length) return null

    const herb = rows[0]
    herb.alias = safeParseJSON(herb.alias)
    herb.keywords = safeParseJSON(herb.keywords)

    // 兼容前端：将 cover_image_url 映射为 image 字段
    if (herb.cover_image_url != null) {
      herb.image = herb.cover_image_url
    }

    herb.key_identification = {
      smell: herb.smell || '',
      texture: herb.texture || '',
      cross_section: herb.cross_section || '',
      outer_skin: herb.outer_skin || '',
      other: herb.other || ''
    }

    delete herb.smell
    delete herb.texture
    delete herb.cross_section
    delete herb.outer_skin
    delete herb.other

    const [classics] = await pool.query(
      'SELECT book, content FROM classics WHERE herb_id = ?',
      [id]
    )
    herb.classics = classics || []

    const [matchIds] = await pool.query(
      'SELECT food_match_id FROM herb_food_match WHERE herb_id = ?',
      [id]
    )
    herb.food_match = matchIds.map(m => m.food_match_id)

    return herb
  }

  async getHerbByName(name) {
    const [rows] = await pool.query(`
      SELECT h.*,
             ki.smell, ki.texture, ki.cross_section, ki.outer_skin, ki.other,
             (SELECT hi.image_url FROM herb_images hi WHERE hi.herb_id = h.id AND hi.is_cover = 1 ORDER BY hi.sort_order LIMIT 1) as cover_image_url
      FROM herbs h
      LEFT JOIN key_identification ki ON h.id = ki.herb_id
      WHERE h.name = ? OR h.alias LIKE ?
    `, [name, `%${name}%`])

    if (!rows.length) return null

    const herb = rows[0]
    return this._formatHerb(herb)
  }

  async getHerbBrief(id) {
    const [rows] = await pool.query(`
      SELECT h.id, h.name, h.category,
             (SELECT image_url FROM herb_images WHERE herb_id = h.id AND is_cover = 1 LIMIT 1) as cover_image_url
      FROM herbs h
      WHERE h.id = ?
    `, [id])
    if (!rows.length) return null
    const row = rows[0]
    if (row.cover_image_url != null) {
      row.image = row.cover_image_url
    }
    return row
  }

  async searchHerbs(keyword, category = '', page = 1, pageSize = 10, foodMedicine = '') {
    let query = `
      SELECT h.*,
             ki.smell, ki.texture, ki.cross_section, ki.outer_skin, ki.other,
             (SELECT hi.image_url FROM herb_images hi WHERE hi.herb_id = h.id AND hi.is_cover = 1 ORDER BY hi.sort_order LIMIT 1) as cover_image_url
      FROM herbs h
      LEFT JOIN key_identification ki ON h.id = ki.herb_id
      WHERE 1=1
    `
    const params = []

    if (keyword) {
      query += ` AND (h.name LIKE ? OR h.keywords LIKE ? OR h.alias LIKE ?)`
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
    }

    if (category) {
      query += ` AND h.category = ?`
      params.push(category)
    }

    if (foodMedicine === '1') {
      query += ` AND h.is_food_medicine = 1`
    }

    query += ` ORDER BY h.id LIMIT ? OFFSET ?`
    params.push(parseInt(pageSize), (page - 1) * parseInt(pageSize))

    const [rows] = await pool.query(query, params)

    const [countResult] = await pool.query(`
      SELECT COUNT(*) as total FROM herbs h WHERE 1=1
      ${keyword ? 'AND (h.name LIKE ? OR h.keywords LIKE ? OR h.alias LIKE ?)' : ''}
      ${category ? 'AND h.category = ?' : ''}
      ${foodMedicine === '1' ? 'AND h.is_food_medicine = 1' : ''}
    `, params.slice(0, -2))

    const formattedRows = rows.map(row => {
      const herb = { ...row }
      herb.alias = safeParseJSON(herb.alias)
      herb.keywords = safeParseJSON(herb.keywords)

      // 兼容前端：将 cover_image_url 映射为 image 字段
      if (herb.cover_image_url != null) {
        herb.image = herb.cover_image_url
      }

      herb.key_identification = {
        smell: herb.smell || '',
        texture: herb.texture || '',
        cross_section: herb.cross_section || '',
        outer_skin: herb.outer_skin || '',
        other: herb.other || ''
      }

      delete herb.smell
      delete herb.texture
      delete herb.cross_section
      delete herb.outer_skin
      delete herb.other

      return herb
    })

    return {
      list: formattedRows,
      total: countResult[0].total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }
  }

  async getAllHerbs() {
    const [rows] = await pool.query('SELECT id, name, category FROM herbs ORDER BY id')
    return rows
  }

  async getHerbClassics(id) {
    const [rows] = await pool.query(
      'SELECT book, content FROM classics WHERE herb_id = ?',
      [id]
    )
    return rows
  }

  async getHerbFoodMatches(id) {
    // 先查药材名，用于匹配 source_herb
    const [herbRows] = await pool.query('SELECT name FROM herbs WHERE id = ?', [id])
    const herbName = herbRows.length > 0 ? herbRows[0].name : ''

    // 同时通过 herb_id 和 source_herb 查询
    const [rows] = await pool.query(`
      SELECT fm.* FROM food_matches fm
      WHERE fm.herb_id = ? OR (fm.source_herb IS NOT NULL AND fm.source_herb = ?)
      ORDER BY fm.id
    `, [id, herbName])

    return rows.map(m => ({
      ...m,
      ingredients: m.ingredients ? (typeof m.ingredients === 'string' ? JSON.parse(m.ingredients) : m.ingredients) : []
    }))
  }

  async getFoodMatchById(id) {
    const [rows] = await pool.query('SELECT * FROM food_matches WHERE id = ?', [id])
    if (!rows.length) return null

    const match = rows[0]
    match.ingredients = match.ingredients ? JSON.parse(match.ingredients) : []

    const [herb] = await pool.query('SELECT name FROM herbs WHERE id = ?', [match.herb_id])
    match.herbName = herb.length ? herb[0].name : ''

    return match
  }

  async searchFoodMatches(keyword) {
    let query = 'SELECT fm.*, h.name as herbName FROM food_matches fm LEFT JOIN herbs h ON fm.herb_id = h.id WHERE 1=1'
    const params = []

    if (keyword) {
      query += ` AND (fm.name LIKE ? OR fm.effect LIKE ? OR fm.ingredients LIKE ?)`
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
    }

    query += ' ORDER BY fm.id'

    const [rows] = await pool.query(query, params)

    return rows.map(m => ({
      ...m,
      ingredients: m.ingredients ? JSON.parse(m.ingredients) : []
    }))
  }

  async getAllFoodMatches() {
    const [rows] = await pool.query('SELECT * FROM food_matches ORDER BY id')
    return rows.map(m => ({
      ...m,
      ingredients: m.ingredients ? JSON.parse(m.ingredients) : []
    }))
  }

  async getFoodMatches(page = 1, pageSize = 10, herbId = null) {
    let query = 'SELECT fm.* FROM food_matches fm'
    let countQuery = 'SELECT COUNT(*) as total FROM food_matches fm'
    const params = []
    const countParams = []

    if (herbId) {
      query += ' JOIN herb_food_match hfm ON fm.id = hfm.food_match_id WHERE hfm.herb_id = ?'
      countQuery += ' JOIN herb_food_match hfm ON fm.id = hfm.food_match_id WHERE hfm.herb_id = ?'
      params.push(herbId)
      countParams.push(herbId)
    }

    query += ' ORDER BY fm.id LIMIT ? OFFSET ?'
    params.push(parseInt(pageSize), (page - 1) * parseInt(pageSize))

    const [rows] = await pool.query(query, params)
    const [countRows] = await pool.query(countQuery, countParams)

    return {
      list: rows.map(m => ({
        ...m,
        ingredients: m.ingredients ? JSON.parse(m.ingredients) : []
      })),
      total: countRows[0].total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }
  }

  async getQuizzes(page = 1, pageSize = 10, category = '', herbId = null, keyword = '', topic_id = '') {
    let query = 'SELECT q.* FROM quizzes q'
    const params = []
    let where = []

    if (keyword) {
      query += ' LEFT JOIN herbs h ON q.herb_id = h.id'
      where.push('(h.name LIKE ? OR h.alias LIKE ? OR q.question LIKE ?)')
      const kw = '%' + keyword + '%'
      params.push(kw, kw, kw)
    }

    if (category) {
      where.push('q.category = ?')
      params.push(category)
    }

    if (herbId) {
      where.push('q.herb_id = ?')
      params.push(herbId)
    }

    if (topic_id) {
      where.push('q.topic_id = ?')
      params.push(topic_id)
    }

    if (where.length > 0) query += ' WHERE ' + where.join(' AND ')

    query += ' ORDER BY q.id LIMIT ? OFFSET ?'
    params.push(parseInt(pageSize), (page - 1) * parseInt(pageSize))

    const [rows] = await pool.query(query, params)

    let countQuery = 'SELECT COUNT(*) as total FROM quizzes q'
    const countParams = params.slice(0, -2)
    if (keyword) {
      countQuery += ' LEFT JOIN herbs h ON q.herb_id = h.id'
    }
    if (where.length > 0) countQuery += ' WHERE ' + where.join(' AND ')

    const [countResult] = await pool.query(countQuery, countParams)

    return {
      list: rows.map(q => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : []
      })),
      total: countResult[0].total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }
  }

  async getQuizById(id) {
    const [rows] = await pool.query('SELECT * FROM quizzes WHERE id = ?', [id])
    if (!rows.length) return null

    const quiz = rows[0]
    quiz.options = quiz.options ? JSON.parse(quiz.options) : []
    return quiz
  }

  async getRandomHerb(excludeIds = []) {
    let query = 'SELECT id, name FROM herbs WHERE 1=1'
    const params = []

    if (excludeIds.length > 0) {
      query += ' AND id NOT IN (?)'
      params.push(excludeIds)
    }

    query += ' ORDER BY RAND() LIMIT 1'

    const [rows] = await pool.query(query, params)
    return rows.length ? rows[0] : null
  }

  async getCategories() {
    const [rows] = await pool.query('SELECT DISTINCT category FROM herbs ORDER BY category')
    return rows.map(r => r.category)
  }

  // ==================== 参考图特征数据 ====================

  async getAllReferenceImages() {
    const [rows] = await pool.query('SELECT * FROM reference_images ORDER BY herb_id, image_name')
    return rows.map(r => ({
      ...r,
      features: typeof r.features === 'string' ? JSON.parse(r.features) : r.features,
      synthetic: r.is_synthetic
    }))
  }

  async getReferenceImagesByHerbId(herbId) {
    const [rows] = await pool.query('SELECT * FROM reference_images WHERE herb_id = ?', [herbId])
    return rows.map(r => ({
      ...r,
      features: typeof r.features === 'string' ? JSON.parse(r.features) : r.features,
      synthetic: r.is_synthetic
    }))
  }

  async saveReferenceImage(item) {
    const { id, herbId, herbName, imageName, synthetic, features } = item
    await pool.query(`
      INSERT INTO reference_images (id, herb_id, herb_name, image_name, is_synthetic, features)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        herb_name = VALUES(herb_name),
        is_synthetic = VALUES(is_synthetic),
        features = VALUES(features),
        created_at = CURRENT_TIMESTAMP
    `, [id, herbId, herbName, imageName, synthetic ? 1 : 0, JSON.stringify(features)])
    return item
  }

  async deleteReferenceImage(id) {
    await pool.query('DELETE FROM reference_images WHERE id = ?', [id])
  }

  async clearReferenceImages() {
    await pool.query('DELETE FROM reference_images')
  }

  async getReferenceImageStats() {
    const [rows] = await pool.query(`
      SELECT COUNT(*) as total, COUNT(DISTINCT herb_id) as herb_count
      FROM reference_images
    `)
    return rows[0]
  }

  // ==================== 药材图片 ====================

  async getHerbImages(herbId) {
    const [rows] = await pool.query(
      'SELECT * FROM herb_images WHERE herb_id = ? ORDER BY is_cover DESC, sort_order, id',
      [herbId]
    )
    return rows
  }

  async getHerbCoverImage(herbId) {
    const [rows] = await pool.query(
      'SELECT * FROM herb_images WHERE herb_id = ? AND is_cover = 1 LIMIT 1',
      [herbId]
    )
    if (rows.length) return rows[0]
    const [rows2] = await pool.query(
      'SELECT * FROM herb_images WHERE herb_id = ? ORDER BY sort_order, id LIMIT 1',
      [herbId]
    )
    return rows2.length ? rows2[0] : null
  }

  async addHerbImage(herbId, imageUrl, options = {}) {
    const { sortOrder = 0, description = '', isCover = false } = options
    const [result] = await pool.query(
      'INSERT INTO herb_images (herb_id, image_url, sort_order, description, is_cover) VALUES (?, ?, ?, ?, ?)',
      [herbId, imageUrl, sortOrder, description, isCover ? 1 : 0]
    )
    return result.insertId
  }

  async deleteHerbImage(imageId) {
    await pool.query('DELETE FROM herb_images WHERE id = ?', [imageId])
  }

  async setHerbCoverImage(imageId, herbId) {
    await pool.query(
      'UPDATE herb_images SET is_cover = 0 WHERE herb_id = ?',
      [herbId]
    )
    await pool.query(
      'UPDATE herb_images SET is_cover = 1 WHERE id = ?',
      [imageId]
    )
  }

  _formatHerb(herb) {
    herb.alias = safeParseJSON(herb.alias)
    herb.keywords = safeParseJSON(herb.keywords)

    // 兼容前端：将 cover_image_url 映射为 image 字段
    if (herb.cover_image_url != null) {
      herb.image = herb.cover_image_url
    }

    herb.key_identification = {
      smell: herb.smell || '',
      texture: herb.texture || '',
      cross_section: herb.cross_section || '',
      outer_skin: herb.outer_skin || '',
      other: herb.other || ''
    }

    delete herb.smell
    delete herb.texture
    delete herb.cross_section
    delete herb.outer_skin
    delete herb.other

    return herb
  }

  // ========== 真伪鉴别模块 ==========
  // 格式化单条鉴别记录（解析 JSON 字段）
  _formatAuth(row) {
    if (!row) return null
    return {
      id: row.id,
      herbName: row.herb_name,
      herbId: row.herb_id,
      counterfeiter: row.counterfeiter,
      fraudType: row.fraud_type,
      summary: row.summary,
      keyPoints: safeParseJSON(row.key_points, []),
      genuineFeatures: safeParseJSON(row.genuine_features, []),
      fakeFeatures: safeParseJSON(row.fake_features, []),
      genuineImages: safeParseJSON(row.genuine_images, []),
      fakeImages: safeParseJSON(row.fake_images, []),
      source: row.source,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  // 获取鉴别列表（支持按造假方式筛选 + 关键词搜索）
  async getAuthenticationList(page = 1, pageSize = 10, fraudType = '', keyword = '') {
    const offset = (page - 1) * pageSize
    let sql = `SELECT * FROM herb_authentication WHERE 1=1`
    const params = []
    if (fraudType) {
      sql += ` AND fraud_type = ?`
      params.push(fraudType)
    }
    if (keyword) {
      sql += ` AND (herb_name LIKE ? OR counterfeiter LIKE ? OR summary LIKE ?)`
      const kw = `%${keyword}%`
      params.push(kw, kw, kw)
    }
    // 统计总数
    let countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total')
    const [countRows] = await pool.query(countSql, params)
    const total = countRows[0].total

    // 分页查询
    sql += ` ORDER BY sort_order ASC, id ASC LIMIT ? OFFSET ?`
    params.push(pageSize, offset)
    const [rows] = await pool.query(sql, params)

    return {
      list: rows.map(r => this._formatAuth(r)),
      total,
      page,
      pageSize
    }
  }

  // 按 id 获取详情
  async getAuthenticationById(id) {
    const [rows] = await pool.query(`SELECT * FROM herb_authentication WHERE id = ?`, [id])
    return this._formatAuth(rows[0])
  }

  // 按药材名或药材id查询（用于药材详情页联动）
  async getAuthenticationByHerb(herbName, herbId) {
    let sql = `SELECT * FROM herb_authentication WHERE `
    const params = []
    if (herbId) {
      sql += `herb_id = ?`
      params.push(herbId)
    } else if (herbName) {
      sql += `herb_name = ? OR herb_name LIKE ?`
      params.push(herbName, `%${herbName}%`)
    } else {
      return null
    }
    sql += ` ORDER BY sort_order ASC LIMIT 1`
    const [rows] = await pool.query(sql, params)
    return this._formatAuth(rows[0])
  }

  // 获取所有造假方式分类
  async getAuthenticationTypes() {
    const [rows] = await pool.query(
      `SELECT DISTINCT fraud_type FROM herb_authentication WHERE fraud_type IS NOT NULL AND fraud_type != '' ORDER BY fraud_type`
    )
    return rows.map(r => r.fraud_type)
  }
}

module.exports = new MySQLService()

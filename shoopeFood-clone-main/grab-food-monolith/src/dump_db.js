const db = require('./models');
const fs = require('fs');

let markdown = "";

for (const modelName in db) {
  if (modelName === 'sequelize' || modelName === 'Sequelize') continue;
  
  const model = db[modelName];
  if (!model.rawAttributes) continue;

  markdown += `- **Bảng:** ${model.tableName.toUpperCase()}\n\n`;
  markdown += `| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Giải thích |\n`;
  markdown += `| :--- | :--- | :--- | :--- |\n`;

  for (const attrName in model.rawAttributes) {
    const attr = model.rawAttributes[attrName];
    
    let type = attr.type.key || attr.type.constructor.name;
    if (type === 'INTEGER') type = 'numeric';
    else if (type === 'STRING' || type === 'VARCHAR') type = `varchar(${attr.type.options?.length || 255})`;
    else if (type === 'TEXT') type = 'text';
    else if (type === 'BOOLEAN') type = 'boolean';
    else if (type === 'DECIMAL') type = 'numeric';
    else if (type === 'FLOAT') type = 'float';
    else if (type === 'DATE') type = 'datetime';
    
    let constraints = [];
    if (attr.primaryKey) constraints.push('PK');
    if (attr.allowNull === false || attr.primaryKey) constraints.push('Not Null');
    if (attr.unique) constraints.push('Unique');
    if (attr.references) constraints.push(`FK (-> ${attr.references.model})`);

    const constraintStr = constraints.join(', ') || 'None';
    
    let description = '';
    if (attrName === 'id') description = `Mã định danh ${modelName}`;
    else if (attrName.includes('Id')) description = `Khóa ngoại tham chiếu ${attrName.replace('Id', '')}`;
    else if (attrName === 'createdAt') description = 'Thời gian tạo';
    else if (attrName === 'updatedAt') description = 'Thời gian cập nhật';
    else description = `Thông tin ${attrName}`;
    
    markdown += `| **${attrName.toUpperCase()}** | ${type.toLowerCase()} | ${constraintStr} | ${description} |\n`;
  }
  markdown += `\n`;
}

fs.writeFileSync('db_structure.md', markdown);
console.log("Done");

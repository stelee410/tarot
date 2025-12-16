/**
 * 下载塔罗牌图片到本地 assets 目录
 * 
 * 数据源更换为: https://github.com/patriciarealini/tarot
 * 
 * 命名规则 (Kebab-case):
 * 使用卡牌的英文全名，转换为小写，空格替换为连字符。
 * 例如: 
 * "The Fool" -> "the-fool.jpg"
 * "Ace of Wands" -> "ace-of-wands.jpg"
 * 
 * 运行方法: 
 * node download_images.js
 */

import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

// 在 ES Module 中获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 远程源
const REMOTE_BASE_URL = "https://raw.githubusercontent.com/patriciarealini/tarot/master/images/deck";

// 本地目标目录
const TARGET_DIR = path.join(__dirname, 'assets', 'cards');

// 确保目录存在
if (!fs.existsSync(TARGET_DIR)) {
  console.log(`创建目录: ${TARGET_DIR}`);
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// 定义卡牌名称列表 (必须与 data.ts 中的 EnglishName 对应的 kebab-case 格式一致)
const majors = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor", 
  "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit", 
  "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance", 
  "The Devil", "The Tower", "The Star", "The Moon", "The Sun", 
  "Judgement", "The World"
];

const ranks = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];
const suits = ['Wands', 'Cups', 'Swords', 'Pentacles'];

const files = [];

// 1. 生成大阿卡纳文件名
majors.forEach(name => {
  files.push(name.toLowerCase().replace(/\s+/g, '-') + '.jpg');
});

// 2. 生成小阿卡纳文件名
suits.forEach(suit => {
  ranks.forEach(rank => {
    const name = `${rank} of ${suit}`;
    files.push(name.toLowerCase().replace(/\s+/g, '-') + '.jpg');
  });
});

// 下载函数
const downloadFile = (filename) => {
  return new Promise((resolve, reject) => {
    const remoteUrl = `${REMOTE_BASE_URL}/${filename}`;
    const localPath = path.join(TARGET_DIR, filename);
    const file = fs.createWriteStream(localPath);

    https.get(remoteUrl, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${filename}: Status ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        process.stdout.write('.'); // 进度条效果
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(localPath, () => {}); // 删除未完成的文件
      reject(err);
    });
  });
};

// 批量下载执行
async function downloadAll() {
  console.log(`开始下载 ${files.length} 张塔罗牌图片...`);
  console.log(`源: ${REMOTE_BASE_URL}`);
  console.log(`目标: ${TARGET_DIR}`);
  
  let successCount = 0;
  let failCount = 0;

  // 限制并发数
  const batchSize = 10;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    try {
      await Promise.all(batch.map(file => downloadFile(file)));
      successCount += batch.length;
    } catch (err) {
      console.error(`\nBatch error:`, err);
      failCount += batch.length;
    }
  }

  console.log(`\n\n所有任务完成!`);
  console.log(`成功: ${successCount}`);
  console.log(`失败: ${failCount}`);
  console.log(`\n如果不使用本地图片，App 会自动回退到远程源。`);
}

downloadAll();
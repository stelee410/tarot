/**
 * 下载塔罗牌图片到本地 assets 目录
 * 
 * 数据源更换为: https://github.com/kylev/tarot
 * 这是一个完整且命名规范的 Rider-Waite-Smith 牌组源。
 * 
 * 命名规则:
 * m00-m21: 大阿卡纳 (Major Arcana)
 * w01-w14: 权杖 (Wands)
 * c01-c14: 圣杯 (Cups)
 * s01-s14: 宝剑 (Swords)
 * p01-p14: 星币 (Pentacles)
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

// 远程源 (High quality RWS scans from kylev/tarot)
const REMOTE_BASE_URL = "https://raw.githubusercontent.com/kylev/tarot/master/public/cards";

// 本地目标目录
const TARGET_DIR = path.join(__dirname, 'assets', 'cards');

// 确保目录存在
if (!fs.existsSync(TARGET_DIR)) {
  console.log(`创建目录: ${TARGET_DIR}`);
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// 定义需要下载的文件列表
const files = [];

// 1. 大阿卡纳 (m00.jpg - m21.jpg)
for (let i = 0; i <= 21; i++) {
  files.push(`m${i.toString().padStart(2, '0')}.jpg`);
}

// 2. 小阿卡纳
// w=Wands, c=Cups, s=Swords, p=Pentacles
// 01(Ace) - 14(King)
const suits = ['w', 'c', 's', 'p'];
suits.forEach(suit => {
  for (let i = 1; i <= 14; i++) {
    files.push(`${suit}${i.toString().padStart(2, '0')}.jpg`);
  }
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

  // 限制并发数为 10
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
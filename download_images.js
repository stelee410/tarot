/**
 * 下载塔罗牌图片到本地 assets 目录
 * 
 * 运行方法: 
 * node download_images.js
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

// 远程源 (Sacred Texts PKT)
const REMOTE_BASE_URL = "https://www.sacred-texts.com/tarot/pkt/img";

// 本地目标目录 (适用于 Vite/React 项目结构)
const TARGET_DIR = path.join(__dirname, 'assets', 'cards');

// 确保目录存在
if (!fs.existsSync(TARGET_DIR)) {
  console.log(`创建目录: ${TARGET_DIR}`);
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// 定义需要下载的文件列表
const files = [];

// 1. 大阿卡纳 (ar00.jpg - ar21.jpg)
for (let i = 0; i <= 21; i++) {
  files.push(`ar${i.toString().padStart(2, '0')}.jpg`);
}

// 2. 小阿卡纳 (wands=wa, cups=cu, swords=sw, pentacles=pe) - 01-14
const suits = ['wa', 'cu', 'sw', 'pe'];
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

  // 限制并发数为 5，防止触发网站限流
  const batchSize = 5;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    try {
      await Promise.all(batch.map(file => downloadFile(file)));
      successCount += batch.length;
    } catch (err) {
      console.error(`\nBatch error:`, err);
      failCount += batch.length; // 简化处理，假设这批都失败
    }
  }

  console.log(`\n\n所有任务完成!`);
  console.log(`成功: ${successCount}`);
  console.log(`失败: ${failCount}`);
  console.log(`\n现在你的 App.tsx 已经配置为从 /assets/cards 读取图片了。`);
}

downloadAll();
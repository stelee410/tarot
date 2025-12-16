// 尝试连接量子随机数服务
// 主要使用 ANU (Australian National University) Quantum Random Numbers Server
// 这是一个基于真空量子涨落测量的真随机数源

export async function getQuantumRandomNumbers(count: number): Promise<number[]> {
  try {
    // 请求 uint16 类型 (0-65535) 以获得足够的洗牌精度并减少模偏差
    // ANU API Endpoint
    // 1. 添加 _t 时间戳参数防止 URL 缓存
    // 2. 设置 cache: 'no-store' 防止浏览器缓存
    const response = await fetch(
      `https://qrng.anu.edu.au/API/jsonI.php?length=${count}&type=uint16&_t=${Date.now()}`, 
      {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Quantum API Status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && Array.isArray(data.data) && data.data.length === count) {
      console.log(`已成功从量子真空涨落中获取 ${count} 个新鲜的随机熵源 (无缓存)。`);
      return data.data;
    }

    throw new Error('Invalid Quantum Data Structure');
  } catch (e) {
    console.warn("量子服务连接受限 (可能是网络或 CORS 原因)，降级使用本地加密级 CSPRNG。", e);
    
    // 降级方案：使用浏览器内置的加密级随机数 (CSPRNG)
    // 虽不是物理量子随机，但在计算上是不可预测的，且每次调用都会重新生成
    const buffer = new Uint16Array(count);
    crypto.getRandomValues(buffer);
    return Array.from(buffer);
  }
}
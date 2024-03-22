import https from 'https';
import http from 'http';
import url from 'url';

const targetUrl = 'https://www.dlsite.com/maniax/product/info/ajax';
let targetQueryParams = {
    product_id: 'RJ01144225',
    cdn_cache_min: '1'
};

const server = http.createServer((req, res) => {
    // 解析请求的URL  
    const parsedUrl = url.parse(req.url, true);
    const queryParams = parsedUrl.query;

    // 获取查询参数  
    const productId = queryParams["product_id"] || "RJ01144225";
    // const cdnCacheMin = queryParams.cdn_cache_min;

    // 在这里可以处理这些参数，比如记录到控制台  
    console.log('Received product_id:', queryParams["product_id"]);
    // console.log('Received cdn_cache_min:', cdnCacheMin);

    targetQueryParams.product_id = productId;

    // 设置请求头  
    const headers = {
        'Accept': 'application/json, text/plain, */*',
        'Sec-CH-UA': '"Chromium";v="122", "Not(A:Brand";v="24", "Microsoft Edge";v="122"',
        'Sec-CH-UA-Mobile': '?0',
        'Sec-CH-UA-Platform': '"Windows"',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': `https://www.dlsite.com/maniax/work/=/product_id/${productId}.html`,
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    };

    // 构建完整的请求URL  
    const queryString = Object.entries(targetQueryParams)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
    const options = {
        hostname: url.parse(targetUrl).hostname,
        port: 443, // HTTPS默认端口  
        path: `${url.parse(targetUrl).path}?${queryString}`,
        method: 'GET',
        headers: headers
    };

    // 发送请求到目标服务器  
    const proxyReq = https.request(options, (proxyRes) => {
        // 设置响应头  
        res.writeHead(proxyRes.statusCode, proxyRes.headers);

        // 转发响应数据到客户端  
        proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (error) => {
        console.error('代理请求遇到问题:', error);
        res.writeHead(500);
        res.end('代理服务器出错');
    });

    // 如果客户端发送了请求体，也需要转发，但在这个GET请求中，没有请求体  
    // proxyReq.end(req.body);  
    proxyReq.end(); // GET请求不需要请求体，直接结束请求  
});

const PORT = 3000; // 代理服务器监听的端口  
server.listen(PORT, () => {
    console.log(`代理服务器已启动，监听端口：${PORT}`);
});

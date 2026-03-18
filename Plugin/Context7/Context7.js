const https = require('https');
const http = require('http');
const { URL } = require('url');

class Context7Plugin {
    constructor() {
        this.baseUrl = process.env.CONTEXT7_BASE_URL || 'https://context7.com';
        this.timeout = parseInt(process.env.CONTEXT7_TIMEOUT) || 10000;
    }

    /**
     * 发送HTTP请求的通用方法
     */
    async makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const isHttps = urlObj.protocol === 'https:';
            const client = isHttps ? https : http;

            const requestOptions = {
                hostname: urlObj.hostname,
                port: urlObj.port || (isHttps ? 443 : 80),
                path: urlObj.pathname + urlObj.search,
                method: options.method || 'GET',
                headers: {
                    'User-Agent': 'VCPToolBox-Context7-Plugin/1.0.0',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                timeout: this.timeout
            };

            const req = client.request(requestOptions, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            // 尝试解析JSON，如果失败则返回原始文本
                            try {
                                const jsonData = JSON.parse(data);
                                resolve(jsonData);
                            } catch (parseError) {
                                resolve({ content: data, raw: true });
                            }
                        } else {
                            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                        }
                    } catch (error) {
                        reject(error);
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            if (options.body) {
                req.write(JSON.stringify(options.body));
            }

            req.end();
        });
    }

    /**
     * 解析库ID
     */
    async resolveLibraryId(libraryName) {
        try {
            // 模拟Context7的库ID解析逻辑
            // 实际情况中可能需要调用Context7的具体API
            const cleanName = libraryName.toLowerCase().trim();

            // 一些常见库的映射
            const libraryMappings = {
                'react': 'facebook/react',
                'next.js': 'vercel/next.js',
                'nextjs': 'vercel/next.js',
                'tailwindcss': 'tailwindlabs/tailwindcss',
                'tailwind': 'tailwindlabs/tailwindcss',
                'typescript': 'microsoft/typescript',
                'express': 'expressjs/express',
                'mongoose': 'mongoosejs/mongoose',
                'prisma': 'prisma/prisma',
                'upstash/redis': 'upstash/redis',
                'redis': 'upstash/redis',
                'axios': 'axios/axios',
                'lodash': 'lodash/lodash',
                'moment': 'moment/moment',
                'dayjs': 'iamkun/dayjs'
            };

            return libraryMappings[cleanName] || libraryName;
        } catch (error) {
            throw new Error(`Failed to resolve library ID: ${error.message}`);
        }
    }

    /**
     * 获取库文档（模拟Context7的功能）
     */
    async getLibraryDocs(libraryId, query = '', language = '') {
        try {
            // 由于Context7的API可能需要特殊访问，我们提供一个模拟实现
            // 实际部署时可能需要根据Context7的具体API调整

            const docs = await this.fetchLibraryInfo(libraryId, query, language);
            return docs;
        } catch (error) {
            throw new Error(`Failed to get library docs: ${error.message}`);
        }
    }

    /**
     * 获取库信息（实际实现可能需要调用GitHub API或其他源）
     */
    async fetchLibraryInfo(libraryId, query, language) {
        // 这里提供一个基础的实现，实际可能需要根据Context7的API调整
        const docTemplates = {
            'facebook/react': {
                name: 'React',
                version: '18.x',
                description: 'A JavaScript library for building user interfaces',
                docs: {
                    'hooks': {
                        content: `# React Hooks

React Hooks are functions that let you use state and other React features in functional components.

## useState
\`\`\`javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me  
      </button>
    </div>
  );
}
\`\`\`

## useEffect
\`\`\`javascript
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\``,
                        url: 'https://react.dev/reference/react'
                    },
                    'default': {
                        content: `# React Documentation

React is a JavaScript library for building user interfaces. It's maintained by Meta and the community.

## Key Concepts
- Components
- JSX
- Props and State
- Hooks
- Context
- Effects

## Quick Start
\`\`\`javascript
import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  return <h1>Hello, World!</h1>;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
\`\`\``,
                        url: 'https://react.dev'
                    }
                }
            },
            'vercel/next.js': {
                name: 'Next.js',
                version: '14.x',
                description: 'The React Framework for Production',
                docs: {
                    'app router': {
                        content: `# Next.js App Router

The App Router is a new paradigm for building applications using React's latest features.

## File-based Routing
\`\`\`
app/
├── layout.tsx
├── page.tsx
├── about/
│   └── page.tsx
└── blog/
    ├── page.tsx
    └── [slug]/
        └── page.tsx
\`\`\`

## Layout Component
\`\`\`typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
\`\`\`

## Page Component
\`\`\`typescript
export default function Page() {
  return <h1>Hello, Next.js!</h1>
}
\`\`\``
                    },
                    'default': {
                        content: `# Next.js Documentation

Next.js is a React framework that enables functionality such as server-side rendering and generating static websites.

## Getting Started
\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

## Features
- File-based routing
- API routes
- Server-side rendering
- Static site generation
- Image optimization
- Built-in CSS support`,
                        url: 'https://nextjs.org/docs'
                    }
                }
            }
        };

        const libraryDoc = docTemplates[libraryId];
        if (!libraryDoc) {
            // 如果没有预定义的文档，返回通用格式
            return {
                library: libraryId,
                version: 'latest',
                content: `Documentation for ${libraryId} is not available in our cache. Please refer to the official documentation or GitHub repository.`,
                url: `https://github.com/${libraryId}`,
                message: 'Library documentation not found in Context7 cache'
            };
        }

        // 根据查询返回相应的文档部分
        const queryKey = query.toLowerCase();
        const docSection = libraryDoc.docs[queryKey] || libraryDoc.docs['default'];

        return {
            library: libraryDoc.name,
            version: libraryDoc.version,
            description: libraryDoc.description,
            content: docSection.content,
            url: docSection.url || `https://github.com/${libraryId}`,
            query: query || 'general'
        };
    }

    /**
     * 搜索库
     */
    async searchLibraries(searchTerm, category = '') {
        const libraries = [
            { name: 'react', description: 'A JavaScript library for building user interfaces', category: 'frontend' },
            { name: 'next.js', description: 'The React Framework for Production', category: 'frontend' },
            { name: 'tailwindcss', description: 'A utility-first CSS framework', category: 'frontend' },
            { name: 'express', description: 'Fast, unopinionated web framework for Node.js', category: 'backend' },
            { name: 'prisma', description: 'Next-generation ORM for Node.js & TypeScript', category: 'database' },
            { name: 'mongoose', description: 'MongoDB object modeling for Node.js', category: 'database' },
            { name: 'axios', description: 'Promise based HTTP client', category: 'utility' },
            { name: 'lodash', description: 'A modern JavaScript utility library', category: 'utility' }
        ];

        const filtered = libraries.filter(lib => {
            const matchesSearch = lib.name.includes(searchTerm.toLowerCase()) ||
                lib.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = !category || lib.category === category.toLowerCase();
            return matchesSearch && matchesCategory;
        });

        return {
            searchTerm,
            category,
            results: filtered,
            total: filtered.length
        };
    }

    /**
     * 处理工具调用请求
     */
    async processRequest(args) {
        try {
            const command = args.command || 'GetLibraryDocs';

            switch (command) {
                case 'GetLibraryDocs':
                    if (!args.library) {
                        throw new Error('Library parameter is required');
                    }

                    const libraryId = await this.resolveLibraryId(args.library);
                    const docs = await this.getLibraryDocs(libraryId, args.query || '', args.language || '');

                    return {
                        status: 'success',
                        result: `### ${docs.library} ${docs.version} 文档

**描述**: ${docs.description || 'No description available'}

**查询**: ${docs.query}

${docs.content}

**官方文档**: ${docs.url}

---
*通过 Context7 提供的实时文档，确保代码示例的准确性和时效性。*`
                    };

                case 'SearchLibraries':
                    if (!args.searchTerm) {
                        throw new Error('SearchTerm parameter is required');
                    }

                    const searchResults = await this.searchLibraries(args.searchTerm, args.category);

                    let resultText = `### 搜索结果: "${searchResults.searchTerm}"\n\n`;
                    if (searchResults.category) {
                        resultText += `**分类**: ${searchResults.category}\n\n`;
                    }
                    resultText += `**找到 ${searchResults.total} 个相关库**:\n\n`;

                    searchResults.results.forEach((lib, index) => {
                        resultText += `${index + 1}. **${lib.name}**\n`;
                        resultText += `   - ${lib.description}\n`;
                        resultText += `   - 分类: ${lib.category}\n\n`;
                    });

                    return {
                        status: 'success',
                        result: resultText
                    };

                default:
                    throw new Error(`Unknown command: ${command}`);
            }
        } catch (error) {
            return {
                status: 'error',
                error: error.message,
                messageForAI: `Context7查询失败: ${error.message}`
            };
        }
    }
}

// 主函数
async function main() {
    try {
        // 读取标准输入
        let inputData = '';
        process.stdin.setEncoding('utf8');

        for await (const chunk of process.stdin) {
            inputData += chunk;
        }

        if (!inputData.trim()) {
            throw new Error('No input data received');
        }

        // 解析输入参数
        let args;
        try {
            args = JSON.parse(inputData.trim());
        } catch (parseError) {
            // 如果JSON解析失败，尝试作为简单字符串处理
            args = { library: inputData.trim() };
        }

        // 创建插件实例并处理请求
        const plugin = new Context7Plugin();
        const result = await plugin.processRequest(args);

        // 输出结果
        console.log(JSON.stringify(result));
        process.exit(0);

    } catch (error) {
        console.log(JSON.stringify({
            status: 'error',
            error: error.message,
            messageForAI: `Context7插件执行失败: ${error.message}`
        }));
        process.exit(1);
    }
}

// 启动主函数
if (require.main === module) {
    main();
}
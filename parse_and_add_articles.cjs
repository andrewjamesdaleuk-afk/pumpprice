const fs = require('fs');

const markdownContent = fs.readFileSync('new-articles.md', 'utf8');
const postsContent = fs.readFileSync('frontend/src/content/posts.ts', 'utf8');

const articleRegex = /## Article \d+: (.*?)\n\* \*\*Slug:\*\* \`(.*?)\`\n\* \*\*Category:\*\* (.*?)\n\* \*\*Date:\*\* (.*?)\n\* \*\*Read Time:\*\* (.*?)\n\* \*\*Excerpt:\*\* (.*?)\n\n### Content:\n([\s\S]*?)(?=\n## Article \d+:|\n--- End of content ---|$)/g;

let newArticlesStr = '';
let match;

while ((match = articleRegex.exec(markdownContent)) !== null) {
    const title = match[1].trim();
    const slug = match[2].trim();
    const category = match[3].trim();
    const date = match[4].trim();
    const readTime = match[5].trim();
    const excerpt = match[6].trim();
    let contentStr = match[7].trim();

    // Convert markdown to simple HTML for the content string
    contentStr = contentStr
        .replace(/### (.*?)\n/g, '<h3>$1</h3>\n')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\* (.*?)\n/g, '<li>$1</li>\n')
        .replace(/(<li>.*<\/li>\n)+/g, match => `<ul>\n${match}</ul>\n`)
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/^(?!<h3|<ul|<li)(.+)$/gm, '<p>$1</p>')
        .replace(/<\/p>\n<p>/g, '</p>\n      <p>') // format a bit
        
    // Clean up
    contentStr = contentStr.replace(/<p><\/p>/g, '');

    newArticlesStr += `  {
    slug: "${slug}",
    title: "${title.replace(/"/g, '\\"')}",
    category: "${category}",
    date: "${date}",
    readTime: "${readTime}",
    excerpt: "${excerpt.replace(/"/g, '\\"')}",
    content: \`
      ${contentStr}
    \`
  },\n`;
}

if (newArticlesStr) {
    const updatedPosts = postsContent.replace(/];$/, newArticlesStr + "];");
    fs.writeFileSync('frontend/src/content/posts.ts', updatedPosts);
    console.log("Successfully parsed and added articles to posts.ts!");
} else {
    console.log("No articles found to parse.");
}

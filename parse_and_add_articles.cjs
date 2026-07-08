const fs = require('fs');

const markdownContent = fs.readFileSync('new-articles.md', 'utf8');
const postsContent = fs.readFileSync('frontend/src/content/posts.ts', 'utf8');

const rawArticles = markdownContent.split('## Article ').slice(1);

let newArticlesStr = '';

rawArticles.forEach(raw => {
    const lines = raw.split('\n');
    const titleMatch = raw.match(/^\d+: (.*)/);
    const slugMatch = raw.match(/\* \*\*Slug:\*\* `(.*?)`/);
    const categoryMatch = raw.match(/\* \*\*Category:\*\* (.*)/);
    const dateMatch = raw.match(/\* \*\*Date:\*\* (.*)/);
    const readTimeMatch = raw.match(/\* \*\*Read Time:\*\* (.*)/);
    const excerptMatch = raw.match(/\* \*\*Excerpt:\*\* (.*)/);

    if (!slugMatch) return;

    const title = titleMatch[1].trim();
    const slug = slugMatch[1].trim();
    const category = categoryMatch[1].trim();
    const date = dateMatch[1].trim();
    const readTime = readTimeMatch[1].trim();
    const excerpt = excerptMatch[1].trim();

    // Extract content block
    const contentSplit = raw.split('### Content:\n');
    let contentStr = '';
    if (contentSplit.length > 1) {
        contentStr = contentSplit[1].split('\n---')[0].trim();
    }

    contentStr = contentStr
        .replace(/### (.*?)\n/g, '<h3>$1</h3>\n')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\* (.*?)\n/g, '<li>$1</li>\n')
        .replace(/(<li>.*<\/li>\n)+/g, match => `<ul>\n${match}</ul>\n`)
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/^(?!<h3|<ul|<li)(.+)$/gm, '<p>$1</p>')
        .replace(/<\/p>\n<p>/g, '</p>\n      <p>')
        .replace(/<p><\/p>/g, '').trim();

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
});

if (newArticlesStr) {
    const updatedPosts = postsContent.replace(/];\s*$/, ',\n' + newArticlesStr + '];\n');
    fs.writeFileSync('frontend/src/content/posts.ts', updatedPosts);
    console.log(`Successfully parsed and added ${rawArticles.length} articles to posts.ts!`);
} else {
    console.log("No articles found to parse.");
}
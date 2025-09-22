import fs from 'fs';
import path from 'path';

export interface Post {
  slug: string;
  title: string;
  date: string;
  content: string;
  image: string;
}

const DEFAULT_IMAGE = '';

const postsDirectory = path.join(process.cwd(), 'public', 'posts');

export function getPosts(): Post[] {
  let fileNames: string[] = [];
  try {
    fileNames = fs.readdirSync(postsDirectory);
  } catch (error) {
    console.error('Error reading posts directory:', error);
    return [];
  }

  const posts = fileNames
    .filter((fileName) => {
      const fullPath = path.join(postsDirectory, fileName);
      return fs.statSync(fullPath).isFile() && fileName.endsWith('.md');
    })
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      
      const lines = fileContents.split('\n');
      
      let title = lines[0].trim();
      if (title.startsWith('#')) {
        title = title.replace(/^#+\s*/, '');
      }
      
      const content = lines.slice(1).join('\n');
      
      const imageRegex = /!\[.*?\]\((.*?)\)/;
      const imageMatch = content.match(imageRegex);
      const image = imageMatch ? imageMatch[1] : DEFAULT_IMAGE;
      
      const baseName = fileName.replace(/\.md$/, '');
      const parts = baseName.split('-');
      const date = parts.slice(0, 3).join('-');
      
      return {
        slug,
        title,
        date,
        content,
        image,
      };
    });
  
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

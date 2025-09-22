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
      
      // First, try to find image in markdown content
      const imageRegex = /!\[.*?\]\((.*?)\)/;
      const imageMatch = content.match(imageRegex);
      let image = imageMatch ? imageMatch[1] : '';
      
      // If no image found in content, look for image based on post filename
      if (!image) {
        const baseName = fileName.replace(/\.md$/, '');
        // Try common image extensions
        const extensions = ['.jpg', '.jpeg', '.png', '.gif'];
        const imagePaths = [
          `/images/blog/${baseName}/`,
          `/images/blog/${baseName.toLowerCase()}/`,
          `/images/posts/${baseName}/`,
          `/images/posts/${baseName.toLowerCase()}/`
        ];
        
        // Check if any standard image exists
        for (const imagePath of imagePaths) {
          for (const ext of extensions) {
            const potentialImage = `${imagePath}featured${ext}`;
            const potentialImage2 = `${imagePath}main${ext}`;
            const potentialImage3 = `${imagePath}1${ext}`;
            
            // You'd need to check if file exists in public folder
            // For now, let's use a simpler approach based on your existing structure
            try {
              const publicPath = path.join(process.cwd(), 'public', imagePath.slice(1));
              if (fs.existsSync(publicPath)) {
                const files = fs.readdirSync(publicPath);
                const imageFile = files.find(file => 
                  extensions.some(ext => file.toLowerCase().endsWith(ext))
                );
                if (imageFile) {
                  image = `${imagePath}${imageFile}`;
                  break;
                }
              }
            } catch (e) {
              // Directory doesn't exist, continue
            }
          }
          if (image) break;
        }
      }
      
      // Use default image if still no image found
      if (!image) {
        image = DEFAULT_IMAGE;
      }
      
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

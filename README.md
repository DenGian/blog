# Portfolio Blog

A modern, full-stack blog application built to document my internship journey. This blog serves as both a portfolio piece and a platform to share my experiences, learnings, and technical insights during my internship.

## Purpose
This blog was created as part of my internship portfolio at AP University of Applied Sciences. It serves multiple purposes:

- 📌 Document my internship experiences
- 💻 Showcase my technical skills
- 📚 Share knowledge and insights
- 🚀 Demonstrate my growth as a developer
- 🔍 Provide a platform for reflection

## Tech Stack

### Frontend

- **Next.js** - React framework for production
- **TypeScript** - For type safety and better developer experience
- **Tailwind CSS** - For styling and responsive design
- **TipTap** - Rich text editor with code syntax highlighting
- **React Components** - Custom-built modular components

### Backend

- **MongoDB** - NoSQL database for storing blog posts and comments
- **Mongoose** - MongoDB object modeling for Node.js
- **Next.js API Routes** - Serverless API endpoints

## Features

### Blog Management

- 🔐 Secure admin dashboard
- ✍️ Rich text editor with support for:
    - Markdown-style formatting
    - Code blocks with syntax highlighting
    - Multiple programming language support (JavaScript, TypeScript, C#, HTML, CSS)
    - Image embedding
- 📝 CRUD operations for blog posts
- 🏷️ Tag-based categorization

### User Experience

- 🔍 Search functionality
- 🏷️ Tag filtering
- 📱 Responsive design
- 📖 Pagination
- 💬 Comments system using Giscus (GitHub Discussions)
- 🔗 Social sharing capabilities

### Content Features

- 📝 Blog posts with rich text formatting
- 🖼️ Cover images for posts
- 📑 Post excerpts
- ⏱️ Reading time estimates
- 📅 Publication dates
- 👤 Author information

## Notable Packages Used

- **@tiptap/react** - Rich text editor
- **@tiptap/starter-kit** - Essential editing features
- **@tiptap/extension-code-block-lowlight** - Code syntax highlighting
- **lowlight** - Syntax highlighting engine
- **mongoose** - MongoDB object modeling
- **cloudinary** - Image management
- **giscus** - Comments system

## Project Structure

```
Directory structure:
└── dengian-blog/
    ├── README.md
    ├── next.config.ts
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── public/
    └── src/
        ├── components/
        │   ├── Layout.tsx
        │   ├── Navbar.tsx
        │   └── blog/
        │       ├── Comments.tsx
        │       ├── Editor.tsx
        │       ├── PostCard.tsx
        │       ├── PostList.tsx
        │       ├── SearchBar.tsx
        │       └── ShareButtons.tsx
        ├── constants/
        │   └── navigation.ts
        ├── hooks/
        │   └── useAdminAuth.ts
        ├── lib/
        │   └── mongodb.ts
        ├── models/
        │   └── Post.ts
        ├── pages/
        │   ├── _app.tsx
        │   ├── _document.tsx
        │   ├── index.tsx
        │   ├── about/
        │   │   └── index.tsx
        │   ├── admin/
        │   │   ├── index.tsx
        │   │   └── posts/
        │   │       ├── index.tsx
        │   │       ├── new.tsx
        │   │       └── [id]/
        │   │           └── edit.tsx
        │   ├── api/
        │   │   └── posts/
        │   │       ├── [id].ts
        │   │       └── index.ts
        │   ├── blog/
        │   │   ├── [slug].tsx
        │   │   └── index.tsx
        │   └── contact/
        │       └── index.tsx
        ├── styles/
        │   ├── Home.module.css
        │   └── globals.css
        ├── types/
        │   └── blog.ts
        └── utils/
            └── formatDate.ts
```

## Features in Detail

### Admin Dashboard
The admin dashboard provides a secure interface for managing blog content. It includes:

- Post creation with rich text editing
- Post management (edit/delete)
- Tag management
- Image upload capabilities

### Rich Text Editor
The TipTap-based editor supports:

- Text formatting (bold, italic, headings)
- Code blocks with syntax highlighting
- Multiple programming language support
- Image embedding
- Link insertion

### Blog Features

- Tag-based navigation
- Search functionality
- Responsive design for all devices
- Social sharing capabilities
- Comments system using Giscus
- Reading time estimates

## Deployment
The blog is deployed using Vercel for optimal performance and reliability. The deployment process is automated through GitHub integration.

## Future Improvements
- [] Image optimization and CDN integration
- [] Dark mode support
- [] RSS feed
- [] Newsletter integration
- [] Analytics dashboard
- [] SEO optimizations

## Contributing
While this is a personal portfolio project, suggestions and feedback are always welcome. Feel free to open an issue or submit a pull request.

# Guilhermo González - Personal Website

A modern, responsive personal portfolio website built with Astro, featuring multi-language support and a clean, professional design.

## 🚀 Features

- **Multi-language Support**: Available in English, French, and Portuguese
- **Resume Downloads**: Pre-generated PDF resumes in each language
- **Modern Design**: Clean, professional UI built with Tailwind CSS
- **Responsive Layout**: Optimized for all device sizes
- **Performance Optimized**: Built with Astro for fast loading times
- **Accessibility**: WCAG compliant design
- **SEO Friendly**: Optimized meta tags and structure
- **Contact Form**: Working contact form with Netlify integration

## 🛠️ Technologies Used

- **Astro** - Static site generator
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript
- **React** - For interactive components
- **Astro i18n** - Internationalization

## 📁 Project Structure

```
/
├── public/
│   ├── favicon.svg
│   └── resumes/
│       ├── README.md
│       ├── guilhermo-gonzalez-resume-en.pdf
│       ├── guilhermo-gonzalez-resume-fr.pdf
│       └── guilhermo-gonzalez-resume-pt.pdf
├── src/
│   ├── components/
│   │   ├── About.astro
│   │   ├── Contact.astro
│   │   ├── Experience.astro
│   │   ├── Footer.astro
│   │   ├── Hero.astro
│   │   ├── LanguageSwitcher.astro
│   │   ├── Navigation.astro
│   │   ├── Projects.astro
│   │   └── ResumeDownload.astro
│   ├── i18n/
│   │   ├── config.ts
│   │   └── utils.ts
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       ├── index.astro
│       ├── fr/
│       │   └── index.astro
│       └── pt/
│           └── index.astro
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

## 🏃‍♂️ Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

4. **Preview the production build**
   ```bash
   npm run preview
   ```

## 🌐 Available Languages

- **English** (default) - `/`
- **French** - `/fr`
- **Portuguese** - `/pt`

## 📄 Resume Downloads

The website includes resume download functionality in all three languages:

- **English**: `guilhermo-gonzalez-resume-en.pdf`
- **French**: `guilhermo-gonzalez-resume-fr.pdf`  
- **Portuguese**: `guilhermo-gonzalez-resume-pt.pdf`

### Adding Resume Files

1. Place your PDF resume files in the `public/resumes/` directory
2. Use the exact filenames specified above
3. The download buttons will automatically link to the correct language version
4. Include error handling for missing files

## 📝 Customization

### Personal Information
Update your personal information in:
- `src/i18n/config.ts` - Translations
- `src/components/Hero.astro` - Hero section content
- `src/components/About.astro` - About section and skills
- `src/components/Experience.astro` - Work experience
- `src/components/Projects.astro` - Portfolio projects
- `src/components/Contact.astro` - Contact information
- `src/components/ResumeDownload.astro` - Resume download functionality

### Styling
The website uses Tailwind CSS for styling. You can customize:
- Colors in `tailwind.config.mjs`
- Typography and spacing using Tailwind classes
- Dark mode support is built-in

### Adding New Languages
1. Add the language to `src/i18n/config.ts`
2. Add translations to the `ui` object
3. Create a new page directory in `src/pages/[lang]/`
4. Update the Astro config in `astro.config.mjs`
5. Add corresponding resume file in `public/resumes/`

## �� Deployment

This site is optimized for deployment on:
- **Netlify** (recommended for the contact form)
- **Vercel**
- **GitHub Pages**
- Any static hosting provider

### Netlify Deployment
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. The contact form will work automatically with Netlify Forms
5. Upload resume files to the deployed site's `/resumes/` directory

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📞 Contact

Feel free to reach out if you have any questions or suggestions!

- **Email**: gui@gonzalez.dev.br
- **LinkedIn**: [linkedin.com/in/guilhermogonzalez](https://www.linkedin.com/in/guilhermogonzalez/)
- **GitHub**: [github.com/guilhermomg](https://github.com/guilhermomg)

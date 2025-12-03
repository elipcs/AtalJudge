# 🔨 AtalJudge Frontend

> Modern web interface for an online judge platform, built with Next.js, TypeScript, and Tailwind CSS.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

## ✨ Features

- 🎓 **Code Submission** - Multi-language support with real-time feedback
- 📊 **Progress Tracking** - Monitor performance across question lists
- 👨‍🏫 **Question Management** - Create questions with test cases
- 🏫 **Class Management** - Organize students and track submissions
- 🔐 **Role-Based Access** - Student, Assistant, and Professor roles
- 🌐 **IP Whitelisting** - Restrict access for in-class exams


## 🚀 Tech Stack

- **[Next.js 15](https://nextjs.org/)** & **[React 19](https://reactjs.org/)** - Framework & UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Styling framework
- **[shadcn/ui](https://ui.shadcn.com/)** & **[Radix UI](https://www.radix-ui.com/)** - UI components
- **[Turbopack](https://turbo.build/)** - Fast bundler

## 📁 Project Structure

```
src/
├── app/                # Next.js App Router pages
│   ├── cadastro/      # Registration
│   ├── configuracoes/ # System settings
│   ├── convites/      # Invite management
│   ├── listas/        # Question lists
│   └── ...            # Other routes
├── components/         # React components by domain
│   ├── auth/          # Authentication
│   ├── lists/         # Question lists
│   ├── questions/     # Questions & submissions
│   └── ui/            # Base UI (shadcn/ui)
├── hooks/             # Custom React hooks (27)
├── services/          # API service layer (10)
├── types/             # TypeScript definitions
└── utils/             # Helper functions (13)
```

## 🏗️ Architecture

```
Pages → Hooks → Services → Backend API
```

- **Pages** - Minimal logic, routing, authorization
- **Hooks** - Business logic, state, API calls
- **Components** - Pure presentation (props-based)
- **Services** - Centralized API communication
- **Utils** - Reusable helper functions

## 🚦 Quick Start

### Prerequisites
- Node.js 20+
- Backend API running at `http://localhost:3333/api`

### Setup

```bash
# Clone repository
git clone https://github.com/elipcs/ataljudge-frontend.git
cd ataljudge-frontend

# Install dependencies
npm install

# Configure environment
# Create .env.local file with your settings

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Check TypeScript |

## 🔐 User Roles

- **Student** - Submit solutions, view grades
- **Assistant** - Help manage classes
- **Professor** - Full access, create questions, manage system

## 🛠️ Key Features

### Custom Hooks Pattern
```typescript
export function useListPage(questionListId: string) {
  const [list, setList] = useState<QuestionList | null>(null);
  const [loading, setLoading] = useState(true);
  return { list, loading, handleSubmit };
}
```

### Service Layer
```typescript
export const getQuestions = async (questionListId: string): Promise<Question[]> => {
  return await API.config.get(`/questions/list/${questionListId}`);
};
```

### Component Structure
```typescript
export function QuestionCard({ question, onSubmit }: Props) {
  return <div>...</div>;
}
```

---

**Built with ❤️ for education**
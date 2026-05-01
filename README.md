# ResumeFlow 🚀

ResumeFlow is a modern, high-performance resume builder designed to help you create professional, ATS-friendly resumes with ease. Built with React, TypeScript, and Vite, it offers a seamless and interactive user experience.

## ✨ Features

- **Modern UI/UX**: Clean, intuitive interface built with Tailwind CSS and Radix UI.
- **Real-time Preview**: See your changes instantly as you type.
- **Customizable Templates**: Choose from various professional templates.
- **Supabase Integration**: Securely save and manage your resumes in the cloud.
- **PDF Export**: Download your resume in high-quality PDF format.
- **AI-Powered (Optional)**: AI features to help optimize your resume content.

## 🛠️ Tech Stack

- **Frontend**: [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Components**: [Radix UI](https://www.radix-ui.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd resumeflow
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

## 🔗 Database Connection (Supabase)

ResumeFlow uses Supabase for data persistence and authentication. To connect your own database:

1. **Create a Supabase Project**: Go to [supabase.com](https://supabase.com/) and create a new project.
2. **Retrieve API Keys**: In your project settings, navigate to **API** to find your `Project URL` and `anon public` key.
3. **Configure Tables**: Run the following SQL in your Supabase SQL Editor to create the necessary tables:

```sql
CREATE TABLE resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  data JSONB NOT NULL,
  theme_id TEXT,
  template TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, title)
);

-- Enable Row Level Security
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own resumes"
  ON resumes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own resumes"
  ON resumes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes"
  ON resumes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes"
  ON resumes FOR DELETE
  USING (auth.uid() = user_id);
```

## 📄 License

This project is licensed under the MIT License.


import EditQuestionClientPage from "./EditQuestionClientPage";

// Return empty array to allow static export with dynamic routes (SPA behavior fallback)
export async function generateStaticParams() {
  return [{ id: '0' }];
}

export default function Page() {
  return <EditQuestionClientPage />;
}

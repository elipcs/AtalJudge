import { Suspense } from "react";
import QuestionsClientPage from "./QuestionsClientPage";
import PageLoading from "@/components/PageLoading";

export default function Page() {
    return (
        <Suspense fallback={<PageLoading message="Carregando questões..." />}>
            <QuestionsClientPage />
        </Suspense>
    );
}

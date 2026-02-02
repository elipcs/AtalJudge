import { Suspense } from "react";
import EditQuestionClientPage from "./EditQuestionClientPage";
import PageLoading from "@/components/PageLoading";

export default function Page() {
    return (
        <Suspense fallback={<PageLoading message="Carregando questão..." />}>
            <EditQuestionClientPage />
        </Suspense>
    );
}

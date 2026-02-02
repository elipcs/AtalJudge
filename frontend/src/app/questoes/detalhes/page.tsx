import { Suspense } from "react";
import QuestionClientPage from "./QuestionClientPage";
import PageLoading from "@/components/PageLoading";

export default function Page() {
    return (
        <Suspense fallback={<PageLoading message="Carregando questão..." />}>
            <QuestionClientPage />
        </Suspense>
    );
}

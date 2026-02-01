
import { Suspense } from "react";
import QuestionsClientPage from "../[id]/questoes/QuestionsClientPage";
import PageLoading from "@/components/PageLoading";

export default function Page() {
    return (
        <Suspense fallback={<PageLoading message="Carregando..." />}>
            <QuestionsClientPage />
        </Suspense>
    );
}

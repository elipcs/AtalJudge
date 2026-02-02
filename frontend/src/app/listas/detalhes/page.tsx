import { Suspense } from "react";
import ListClientPage from "./ListClientPage";
import PageLoading from "@/components/PageLoading";

export default function Page() {
    return (
        <Suspense fallback={<PageLoading message="Carregando lista..." />}>
            <ListClientPage />
        </Suspense>
    );
}

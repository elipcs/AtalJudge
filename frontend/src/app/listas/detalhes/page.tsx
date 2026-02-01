
import { Suspense } from "react";
import ListClientPage from "../[id]/ListClientPage";
import PageLoading from "@/components/PageLoading";

export default function Page() {
    return (
        <Suspense fallback={<PageLoading message="Carregando..." />}>
            <ListClientPage />
        </Suspense>
    );
}

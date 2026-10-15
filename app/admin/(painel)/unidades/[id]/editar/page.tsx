
import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { atualizarUnidade } from "./actions";

type EditarUnidadePageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    erro?: string;
  }>;
};

export default async function EditarUnidadePage({
  params,
  searchParams,
}: EditarUnidadePageProps) {
  const { id } = await params;
  const { erro } = await searchParams;

  const supabase = await createClient();

  const { data: unidade, error } = await supabase
    .from("units")
    .select(
      "id, building_id, title, description, bedrooms, bathrooms, floor, area_m2, status"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Erro ao carregar unidade:", error.message);
    throw new Error("Não foi possível carregar os dados da unidade.");
  }

  if (!unidade) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/unidades"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
        >
          ← Voltar para unidades
        </Link>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-indigo-700 to-blue-600 px-6 py-7 text-white sm:px-8">
            <p className="text-sm font-medium text-indigo-100">
              Painel administrativo
            </p>

            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
              Editar unidade
            </h1>

            <p className="mt-2 text-sm text-indigo-100">
              Atualize as informações do imóvel abaixo.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {erro && (
              <div
                role="alert"
                className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {erro === "campos" &&
                  "Preencha o título e o status da unidade."}

                {erro === "valores" &&
                  "Confira os valores numéricos informados."}

                {erro === "salvar" &&
                  "Não foi possível salvar as alterações. Verifique os dados e as permissões do Supabase."}

                {!["campos", "valores", "salvar"].includes(erro) &&
                  "Ocorreu um erro. Tente novamente."}
              </div>
            )}

            <form action={atualizarUnidade} className="space-y-6">
              <input type="hidden" name="id" value={unidade.id} />

              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Título da unidade *
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  defaultValue={unidade.title ?? ""}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Ex.: Apartamento com 2 quartos"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Descrição
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  defaultValue={unidade.description ?? ""}
                  className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Descreva as características do imóvel..."
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="bedrooms"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Quartos
                  </label>

                  <input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={unidade.bedrooms ?? ""}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="bathrooms"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Banheiros
                  </label>

                  <input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={unidade.bathrooms ?? ""}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="area_m2"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Área em m²
                  </label>

                  <input
                    id="area_m2"
                    name="area_m2"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={unidade.area_m2 ?? ""}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    placeholder="Ex.: 75"
                  />
                </div>

                <div>
                  <label
                    htmlFor="floor"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Andar
                  </label>

                  <input
                    id="floor"
                    name="floor"
                    type="number"
                    step="1"
                    defaultValue={unidade.floor ?? ""}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    placeholder="Ex.: 3"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Status *
                </label>

                <input
                  id="status"
                  name="status"
                  type="text"
                  required
                  defaultValue={unidade.status ?? ""}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Informe o status atual"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Mantenha o formato de status utilizado no seu sistema.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
                <Link
                  href="/admin/unidades"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancelar
                </Link>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                >
                  Salvar alterações
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

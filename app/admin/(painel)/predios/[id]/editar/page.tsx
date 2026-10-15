
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
};

export default async function EditarPredioPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { erro } = await searchParams;

  const supabase = await createClient();

  const { data: predio, error } = await supabase
    .from("buildings")
    .select("id, name, slug, city, address, lat, lng, description")
    .eq("id", id)
    .maybeSingle();

  if (error || !predio) {
    return (
      <main className="mx-auto max-w-3xl space-y-5">
        <h1 className="text-3xl font-bold text-gray-900">
          Editar prédio
        </h1>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          <h2 className="font-bold">
            Não foi possível carregar este prédio.
          </h2>

          <p className="mt-2 text-sm">
            ID recebido: {id}
          </p>

          {error && (
            <p className="mt-2 text-sm">
              Erro do Supabase: {error.message}
            </p>
          )}

          {!error && (
            <p className="mt-2 text-sm">
              Nenhum prédio foi encontrado com esse identificador.
            </p>
          )}
        </div>

        <Link
          href="/admin/predios"
          className="inline-block font-medium text-blue-700 hover:underline"
        >
          ← Voltar aos prédios
        </Link>
      </main>
    );
  }

  async function atualizarPredio(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const name = String(formData.get("name") || "").trim();
    const slug = String(formData.get("slug") || "").trim();
    const city = String(formData.get("city") || "").trim();
    const address = String(formData.get("address") || "").trim();
    const description = String(
      formData.get("description") || ""
    ).trim();

    const latValue = String(formData.get("lat") || "").trim();
    const lngValue = String(formData.get("lng") || "").trim();

    if (!name || !slug) {
      redirect(
        `/admin/predios/${encodeURIComponent(id)}/editar?erro=${encodeURIComponent(
          "Preencha o nome e o slug do prédio."
        )}`
      );
    }

    const lat = latValue === "" ? null : Number(latValue);
    const lng = lngValue === "" ? null : Number(lngValue);

    if (
      (lat !== null && !Number.isFinite(lat)) ||
      (lng !== null && !Number.isFinite(lng))
    ) {
      redirect(
        `/admin/predios/${encodeURIComponent(id)}/editar?erro=${encodeURIComponent(
          "Latitude e longitude precisam ser números válidos."
        )}`
      );
    }

    if (
      (lat !== null && (lat < -90 || lat > 90)) ||
      (lng !== null && (lng < -180 || lng > 180))
    ) {
      redirect(
        `/admin/predios/${encodeURIComponent(id)}/editar?erro=${encodeURIComponent(
          "Latitude deve estar entre -90 e 90 e longitude entre -180 e 180."
        )}`
      );
    }

    const { data: atualizado, error: updateError } = await supabase
      .from("buildings")
      .update({
        name,
        slug,
        city: city || null,
        address: address || null,
        description: description || null,
        lat,
        lng,
      })
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (updateError) {
      redirect(
        `/admin/predios/${encodeURIComponent(id)}/editar?erro=${encodeURIComponent(
          updateError.message
        )}`
      );
    }

    if (!atualizado) {
      redirect(
        `/admin/predios/${encodeURIComponent(id)}/editar?erro=${encodeURIComponent(
          "Nenhum prédio foi atualizado. Verifique as permissões de acesso no Supabase."
        )}`
      );
    }

    redirect("/admin/predios");
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Editar prédio
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Atualize os dados do prédio cadastrado.
        </p>

        <p className="mt-1 text-xs text-gray-400">
          ID: {String(predio.id)}
        </p>
      </div>

      {erro && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <strong>Não foi possível salvar as alterações.</strong>
          <p className="mt-1">{erro}</p>
        </div>
      )}

      <form
        action={atualizarPredio}
        className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Nome do prédio *
          </label>

          <input
            id="name"
            name="name"
            required
            maxLength={150}
            defaultValue={predio.name ?? ""}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="slug"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Slug *
          </label>

          <input
            id="slug"
            name="slug"
            required
            maxLength={150}
            defaultValue={predio.slug ?? ""}
            placeholder="exemplo-nome-do-predio"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />

          <p className="mt-1 text-xs text-gray-500">
            Identificador usado no endereço do prédio.
          </p>
        </div>

        <div>
          <label
            htmlFor="city"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Cidade
          </label>

          <input
            id="city"
            name="city"
            defaultValue={predio.city ?? ""}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label
            htmlFor="address"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Endereço
          </label>

          <input
            id="address"
            name="address"
            defaultValue={predio.address ?? ""}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-600"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="lat"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Latitude
            </label>

            <input
              id="lat"
              name="lat"
              type="number"
              step="any"
              defaultValue={predio.lat ?? ""}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label
              htmlFor="lng"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Longitude
            </label>

            <input
              id="lng"
              name="lng"
              type="number"
              step="any"
              defaultValue={predio.lng ?? ""}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-600"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Descrição
          </label>

          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={predio.description ?? ""}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
          <Link
            href="/admin/predios"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
          >
            Salvar alterações
          </button>
        </div>
      </form>
    </main>
  );
}


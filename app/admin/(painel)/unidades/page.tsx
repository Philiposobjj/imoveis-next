
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{ erro?: string; sucesso?: string }>;
};

async function excluirUnidade(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");

  if (!id) {
    redirect(
      "/admin/unidades?erro=" +
        encodeURIComponent("ID do imóvel não informado.")
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.from("units").delete().eq("id", id);

  if (error) {
    redirect(
      "/admin/unidades?erro=" + encodeURIComponent(error.message)
    );
  }

  revalidatePath("/admin/unidades");
  revalidatePath("/admin");
  revalidatePath("/imoveis");

  redirect("/admin/unidades?sucesso=excluida");
}

function formatarStatus(status: string | null) {
  const valor = (status || "").toLowerCase();

  if (
    valor.includes("disponível") ||
    valor.includes("disponivel") ||
    valor.includes("available")
  ) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
  }

  if (
    valor.includes("alugado") ||
    valor.includes("ocupado") ||
    valor.includes("indisponível") ||
    valor.includes("indisponivel") ||
    valor.includes("occupied")
  ) {
    return "bg-amber-50 text-amber-700 ring-amber-600/20";
  }

  return "bg-slate-100 text-slate-700 ring-slate-500/20";
}

export default async function UnidadesPage({ searchParams }: Props) {
  const { erro, sucesso } = await searchParams;
  const supabase = await createClient();

  const { data: unidades, error } = await supabase
    .from("units")
    .select(`
      id,
      building_id,
      title,
      description,
      bedrooms,
      bathrooms,
      floor,
      area_m2,
      status,
      created_at,
      buildings (
        name,
        city
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="space-y-6">
        <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 p-8 text-white shadow-xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
            Administração imobiliária
          </p>
          <h1 className="mt-3 text-3xl font-black">
            Imóveis e apartamentos
          </h1>
          <p className="mt-2 text-sm text-blue-100">
            Gerencie as unidades cadastradas.
          </p>
        </section>

        <section
          role="alert"
          className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm"
        >
          <h2 className="font-extrabold text-red-700">
            Erro ao carregar os imóveis
          </h2>
          <p className="mt-2 break-words text-sm text-slate-600">
            {error.message}
          </p>
        </section>

        <Link
          href="/admin"
          className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          ← Voltar ao painel
        </Link>
      </main>
    );
  }

  const lista = unidades ?? [];
  const total = lista.length;

  const disponiveis = lista.filter((unidade) => {
    const status = (unidade.status || "").toLowerCase();
    return (
      status.includes("disponível") ||
      status.includes("disponivel") ||
      status.includes("available")
    );
  }).length;

  const ocupadas = lista.filter((unidade) => {
    const status = (unidade.status || "").toLowerCase();
    return (
      status.includes("alugado") ||
      status.includes("ocupado") ||
      status.includes("occupied")
    );
  }).length;

  return (
    <main className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 p-6 text-white shadow-xl sm:p-9">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl"
        />

        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
              Gestão de imóveis
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Imóveis e apartamentos
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-blue-100/80 sm:text-base">
              Consulte os imóveis cadastrados e gerencie as informações de
              cada unidade em um só lugar.
            </p>
          </div>

          <Link
            href="/admin/unidades/nova"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 font-extrabold text-blue-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
          >
            <span className="text-xl leading-none">+</span>
            Novo imóvel
          </Link>
        </div>
      </section>

      {erro && (
        <div
          role="alert"
          className="break-words rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <strong>Não foi possível concluir a operação:</strong> {erro}
        </div>
      )}

      {sucesso === "excluida" && (
        <div
          role="status"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800"
        >
          Imóvel excluído com sucesso.
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">
              Total de imóveis
            </p>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
              🏠
            </span>
          </div>
          <p className="mt-4 text-3xl font-black text-slate-950">{total}</p>
          <p className="mt-1 text-sm text-slate-500">
            Unidades cadastradas no sistema
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">
              Disponíveis
            </p>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-emerald-700">
              ✓
            </span>
          </div>
          <p className="mt-4 text-3xl font-black text-emerald-700">
            {disponiveis}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Imóveis marcados como disponíveis
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">
              Ocupados ou alugados
            </p>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-xl">
              🔑
            </span>
          </div>
          <p className="mt-4 text-3xl font-black text-amber-700">
            {ocupadas}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Unidades marcadas como ocupadas ou alugadas
          </p>
        </article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950">
              Unidades cadastradas
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Consulte os dados e as ações de cada imóvel.
            </p>
          </div>

          <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-800">
            {total} {total === 1 ? "imóvel" : "imóveis"}
          </span>
        </div>

        {total === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
              🏠
            </div>

            <h3 className="mt-5 text-lg font-extrabold text-slate-950">
              Nenhum imóvel cadastrado
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Cadastre seu primeiro imóvel para começar a organizar as unidades
              neste painel.
            </p>

            <Link
              href="/admin/unidades/nova"
              className="mt-6 inline-flex rounded-xl bg-blue-700 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-blue-800"
            >
              + Cadastrar primeiro imóvel
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">Imóvel</th>
                  <th className="px-5 py-4 font-bold">Prédio</th>
                  <th className="px-5 py-4 font-bold">Quartos</th>
                  <th className="px-5 py-4 font-bold">Banheiros</th>
                  <th className="px-5 py-4 font-bold">Andar</th>
                  <th className="px-5 py-4 font-bold">Área</th>
                  <th className="px-5 py-4 font-bold">Situação</th>
                  <th className="px-5 py-4 font-bold">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {lista.map((unidade) => {
                  const predio = Array.isArray(unidade.buildings)
                    ? unidade.buildings[0]
                    : unidade.buildings;

                  return (
                    <tr
                      key={unidade.id}
                      className="transition hover:bg-blue-50/40"
                    >
                      <td className="px-5 py-5">
                        <p className="font-bold text-slate-900">
                          {unidade.title || "Imóvel sem título"}
                        </p>
                        {unidade.description && (
                          <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                            {unidade.description}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-semibold text-slate-800">
                          {predio?.name || "Prédio não identificado"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {predio?.city || ""}
                        </p>
                      </td>

                      <td className="px-5 py-5 text-slate-700">
                        {unidade.bedrooms ?? "—"}
                      </td>
                      <td className="px-5 py-5 text-slate-700">
                        {unidade.bathrooms ?? "—"}
                      </td>
                      <td className="px-5 py-5 text-slate-700">
                        {unidade.floor ?? "—"}
                      </td>
                      <td className="px-5 py-5 font-semibold text-slate-700">
                        {unidade.area_m2 != null
                          ? `${unidade.area_m2} m²`
                          : "—"}
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${formatarStatus(
                            unidade.status
                          )}`}
                        >
                          {unidade.status || "Não informado"}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/unidades/${encodeURIComponent(
                              unidade.id
                            )}/editar`}
                            className="inline-flex items-center justify-center rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
                          >
                            Editar
                          </Link>

                          <form
                            action={excluirUnidade}
                            onSubmit={undefined}
                          >
                            <input
                              type="hidden"
                              name="id"
                              value={unidade.id}
                            />
                            <button
                              type="submit"
                              formAction={excluirUnidade}
                              className="inline-flex items-center justify-center rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
                            >
                              Excluir
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-700"
      >
        ← Voltar ao painel
      </Link>
    </main>
  );
}

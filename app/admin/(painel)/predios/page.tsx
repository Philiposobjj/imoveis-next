
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import PrediosLista from "./PrediosLista"

export default async function PrediosPage() {
  const supabase = await createClient()

  const { data: predios, error } = await supabase
    .from("buildings")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return (
      <main className="space-y-4">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-700"
        >
          ← Voltar ao painel
        </Link>

        <section
          role="alert"
          className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-xl text-red-700">
              !
            </span>

            <div>
              <h2 className="font-extrabold text-slate-900">
                Erro ao carregar os prédios
              </h2>

              <p className="mt-2 text-sm leading-6 text-red-700">
                {error.message}
              </p>

              <p className="mt-3 text-sm text-slate-500">
                Verifique a conexão com o banco de dados e tente novamente.
              </p>
            </div>
          </div>
        </section>
      </main>
    )
  }

  const totalPredios = predios?.length ?? 0

  return (
    <main className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 p-7 text-white shadow-xl sm:p-9">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl"
        />

        <div className="relative flex flex-col justify-between gap-7 sm:flex-row sm:items-center">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
              Administração imobiliária
            </span>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Gerenciamento de prédios
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-blue-100/80 sm:text-base">
              Cadastre empreendimentos, consulte os dados e mantenha seus
              prédios organizados em um só lugar.
            </p>
          </div>

          <Link
            href="/admin/predios/novo"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 font-extrabold text-blue-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
          >
            <span className="text-xl" aria-hidden="true">
              +
            </span>
            Novo prédio
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-700">
              ▦
            </span>

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Total de prédios
              </p>

              <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">
                {totalPredios}
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Empreendimentos cadastrados no sistema.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl text-indigo-700">
              ⌂
            </span>

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Gestão centralizada
              </p>

              <p className="mt-1 text-lg font-extrabold text-slate-950">
                Seus empreendimentos
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Consulte e gerencie os dados dos prédios cadastrados.
          </p>
        </article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-7">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950">
              Seus prédios
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Lista atualizada com os registros mais recentes primeiro.
            </p>
          </div>

          <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-800">
            {totalPredios} {totalPredios === 1 ? "prédio" : "prédios"}
          </span>
        </div>

        <div className="p-4 sm:p-6">
          {totalPredios > 0 ? (
            <PrediosLista predios={predios ?? []} />
          ) : (
            <div className="flex flex-col items-center px-5 py-12 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl text-blue-700">
                ▦
              </span>

              <h3 className="mt-5 text-lg font-extrabold text-slate-900">
                Nenhum prédio cadastrado
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Comece cadastrando seu primeiro empreendimento para organizar
                os imóveis no sistema.
              </p>

              <Link
                href="/admin/predios/novo"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-700 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-blue-800"
              >
                + Cadastrar primeiro prédio
              </Link>
            </div>
          )}
        </div>
      </section>

      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-700"
      >
        ← Voltar ao painel
      </Link>
    </main>
  )
}
